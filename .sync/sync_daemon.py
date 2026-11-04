import os
import sys
import json
import time
import hashlib
import subprocess
import re
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

WORKSPACE_DIR = "/home/vasilis/Projects/letitsniff"
DOCS_DIR = os.path.join(WORKSPACE_DIR, "docs")
SYNC_DIR = os.path.join(WORKSPACE_DIR, ".sync")
STATE_FILE = os.path.join(SYNC_DIR, "sync_state.json")
ROOT_FOLDER_ID = "1oNgHqLRswU0GSE9e8XFTyf9j-dGlotbi"
IGNORE_FOLDERS = {"blogold", "old", "archive", "backup", "trash", ".trash"}

def md5_file(filepath):
    try:
        h = hashlib.md5()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return None

def run_gdrive(*args):
    cmd = ["gdrive"] + list(args)
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return res

def extract_id_from_output(text):
    if not text:
        return None
    m = re.search(r"ID:\s*([a-zA-Z0-9_-]+)", text)
    return m.group(1) if m else None

def list_drive_folder(folder_id):
    res = run_gdrive("readonly", "ls", folder_id, "--json")
    if res.returncode != 0:
        return []
    try:
        return json.loads(res.stdout)
    except Exception:
        return []

def get_drive_info(file_id):
    if not file_id:
        return {}
    res = run_gdrive("readonly", "info", file_id, "--json")
    if res.returncode != 0:
        return {}
    try:
        return json.loads(res.stdout)
    except Exception:
        return {}

def sanitize_markdown(filepath):
    if not filepath.endswith(".md") or not os.path.exists(filepath):
        return
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        if "data:image/" in text:
            cleaned = re.sub(r"\n*\[image\d+\]:\s*<data:image/[^>]+>", "", text)
            cleaned = re.sub(r"!\[\]\[image\d+\]", "", cleaned)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(cleaned)
    except Exception:
        pass

def normalize_rel_path(path_str):
    p = path_str.replace("\\", "/").strip("/")
    if p.startswith("docs/"):
        p = p[5:]
    return p

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                normalized_files = {}
                raw_files = data.get("files", {})
                for k, v in raw_files.items():
                    normalized_files[normalize_rel_path(k)] = v
                return {
                    "folders": data.get("folders", {}),
                    "files": normalized_files,
                    "last_sync": data.get("last_sync", 0)
                }
        except Exception:
            pass
    return {"folders": {}, "files": {}, "last_sync": 0}

def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    temp_state = f"{STATE_FILE}.tmp"
    with open(temp_state, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    os.replace(temp_state, STATE_FILE)

def scan_drive_tree():
    """
    Scans Google Drive fast using ThreadPoolExecutor.
    Returns:
      folders: dict of rel_path -> folder_id
      files: dict of rel_path -> item dict
    """
    folders = {}
    files = {}

    root_items = list_drive_folder(ROOT_FOLDER_ID)
    top_folders = []
    for it in root_items:
        name = it.get("name")
        mime = it.get("mimeType")
        item_id = it.get("id")
        if mime == "application/vnd.google-apps.folder":
            if name.lower() in IGNORE_FOLDERS:
                continue
            folders[name] = item_id
            top_folders.append((name, item_id))
        else:
            files[name] = it

    # Scan level 1 (e.g. blog, services)
    level2_folders = []
    def scan_level1(folder_tuple):
        rel_dir, f_id = folder_tuple
        sub_items = list_drive_folder(f_id)
        local_f = []
        local_files = []
        for it in sub_items:
            s_name = it.get("name")
            s_mime = it.get("mimeType")
            s_id = it.get("id")
            s_rel = os.path.join(rel_dir, s_name)
            if s_mime == "application/vnd.google-apps.folder":
                if s_name.lower() in IGNORE_FOLDERS:
                    continue
                local_f.append((s_rel, s_id))
            else:
                local_files.append((s_rel, it))
        return local_f, local_files

    with ThreadPoolExecutor(max_workers=8) as ex:
        for local_f, local_files in ex.map(scan_level1, top_folders):
            for r_dir, f_id in local_f:
                folders[r_dir] = f_id
                level2_folders.append((r_dir, f_id))
            for r_file, it in local_files:
                files[r_file] = it

    # Scan level 2 (e.g. blog/01 - ..., which might have images/)
    def scan_level2(folder_tuple):
        rel_dir, f_id = folder_tuple
        sub_items = list_drive_folder(f_id)
        local_f = []
        local_files = []
        for it in sub_items:
            s_name = it.get("name")
            s_mime = it.get("mimeType")
            s_id = it.get("id")
            s_rel = os.path.join(rel_dir, s_name)
            if s_mime == "application/vnd.google-apps.folder":
                if s_name.lower() in IGNORE_FOLDERS:
                    continue
                local_f.append((s_rel, s_id))
            else:
                local_files.append((s_rel, it))
        return local_f, local_files

    with ThreadPoolExecutor(max_workers=10) as ex:
        for local_f, local_files in ex.map(scan_level2, level2_folders):
            for r_dir, f_id in local_f:
                folders[r_dir] = f_id
                # In case images or subfolders have files, scan level 3
                l3_items = list_drive_folder(f_id)
                for it in l3_items:
                    it_rel = os.path.join(r_dir, it.get("name"))
                    if it.get("mimeType") != "application/vnd.google-apps.folder":
                        files[it_rel] = it
            for r_file, it in local_files:
                files[r_file] = it

    return folders, files

def scan_local_docs():
    """
    Scans local docs/ directory.
    Returns:
      folders: set of relative dir paths
      files: dict of rel_path -> dict(abs_path, mtime, hash)
    """
    folders = set()
    files = {}

    if not os.path.exists(DOCS_DIR):
        return folders, files

    for root, dirnames, filenames in os.walk(DOCS_DIR):
        dirnames[:] = [d for d in dirnames if not d.startswith(".") and d.lower() not in IGNORE_FOLDERS]
        rel_dir = os.path.relpath(root, DOCS_DIR)
        if rel_dir != ".":
            folders.add(rel_dir)

        for f in filenames:
            if f.startswith(".") or f.endswith("~") or f.endswith(".tmp") or f.endswith(".swp"):
                continue
            abs_p = os.path.join(root, f)
            rel_p = os.path.relpath(abs_p, DOCS_DIR)
            files[rel_p] = {
                "abs_path": abs_p,
                "mtime": os.path.getmtime(abs_p),
                "hash": md5_file(abs_p)
            }

    return folders, files

def ensure_drive_folder(rel_dir, folder_map):
    """
    Ensures a directory path exists on Google Drive.
    Returns folder_id.
    """
    if not rel_dir or rel_dir == ".":
        return ROOT_FOLDER_ID
    if rel_dir in folder_map:
        return folder_map[rel_dir]

    parts = rel_dir.split(os.sep)
    current_path = ""
    parent_id = ROOT_FOLDER_ID

    for part in parts:
        current_path = os.path.join(current_path, part) if current_path else part
        if current_path in folder_map:
            parent_id = folder_map[current_path]
        else:
            res = run_gdrive("mutate", "mkdir", part, "--parent", parent_id)
            new_id = extract_id_from_output(res.stdout)
            if not new_id:
                items = list_drive_folder(parent_id)
                for it in items:
                    if it.get("name") == part and it.get("mimeType") == "application/vnd.google-apps.folder":
                        new_id = it.get("id")
                        break
            if new_id:
                folder_map[current_path] = new_id
                parent_id = new_id
            else:
                raise RuntimeError(f"Could not create Drive folder {current_path}")

    return parent_id

def sync_bidirectional():
    """
    Executes one bidirectional sync pass between Google Drive and docs/.
    """
    state = load_state()
    tracked_files = state.setdefault("files", {})
    state_folders = state.setdefault("folders", {})

    remote_folders, remote_files = scan_drive_tree()
    state_folders.update(remote_folders)

    local_folders, local_files = scan_local_docs()

    # 1. Check all already-tracked files
    all_tracked_keys = list(tracked_files.keys())
    for rel_path in all_tracked_keys:
        info = tracked_files[rel_path]
        drive_id = info.get("drive_id")
        last_hash = info.get("hash")
        last_drive_mod = info.get("drive_modified")

        loc = local_files.get(rel_path)
        rem = remote_files.get(rel_path)

        # Case 1: Exists on both sides
        if loc and rem:
            loc_changed = (loc["hash"] != last_hash)
            rem_changed = (rem["modifiedTime"] != last_drive_mod)

            if loc_changed and not rem_changed:
                print(f"⬆️  [LOCAL -> DRIVE] Updating: {rel_path}")
                run_gdrive("mutate", "update", drive_id, loc["abs_path"])
                new_info = get_drive_info(drive_id)
                tracked_files[rel_path] = {
                    "drive_id": drive_id,
                    "mime": rem.get("mimeType"),
                    "drive_modified": new_info.get("modifiedTime", rem["modifiedTime"]),
                    "local_mtime": os.path.getmtime(loc["abs_path"]),
                    "hash": loc["hash"]
                }
            elif rem_changed and not loc_changed:
                print(f"⬇️  [DRIVE -> LOCAL] Updating: {rel_path}")
                if rem.get("mimeType") == "application/vnd.google-apps.document":
                    run_gdrive("readonly", "export", drive_id, loc["abs_path"], "--format", "md")
                else:
                    run_gdrive("readonly", "download", drive_id, "--out", loc["abs_path"])
                sanitize_markdown(loc["abs_path"])
                tracked_files[rel_path] = {
                    "drive_id": drive_id,
                    "mime": rem.get("mimeType"),
                    "drive_modified": rem["modifiedTime"],
                    "local_mtime": os.path.getmtime(loc["abs_path"]),
                    "hash": md5_file(loc["abs_path"])
                }
            elif loc_changed and rem_changed:
                tmp_cmp = f"/tmp/cmp_{drive_id}"
                if rem.get("mimeType") == "application/vnd.google-apps.document":
                    run_gdrive("readonly", "export", drive_id, tmp_cmp, "--format", "md")
                else:
                    run_gdrive("readonly", "download", drive_id, "--out", tmp_cmp)
                sanitize_markdown(tmp_cmp)
                rem_hash = md5_file(tmp_cmp)
                if rem_hash == loc["hash"]:
                    tracked_files[rel_path] = {
                        "drive_id": drive_id,
                        "mime": rem.get("mimeType"),
                        "drive_modified": rem["modifiedTime"],
                        "local_mtime": os.path.getmtime(loc["abs_path"]),
                        "hash": loc["hash"]
                    }
                else:
                    print(f"⚠️  [CONFLICT] Both modified: {rel_path}. Saving remote as {rel_path}.remote")
                    backup_path = f"{loc['abs_path']}.remote"
                    os.replace(tmp_cmp, backup_path)
                    tracked_files[rel_path]["local_mtime"] = os.path.getmtime(loc["abs_path"])
                    tracked_files[rel_path]["hash"] = loc["hash"]
                if os.path.exists(tmp_cmp):
                    try:
                        os.remove(tmp_cmp)
                    except Exception:
                        pass
            else:
                pass

        # Case 2: Exists on Drive, deleted locally
        elif rem and not loc:
            if rem["modifiedTime"] == last_drive_mod:
                print(f"🗑️  [LOCAL DELETED] Trashing on Drive: {rel_path}")
                run_gdrive("mutate", "trash", drive_id)
                tracked_files.pop(rel_path, None)
                remote_files.pop(rel_path, None)
            else:
                local_dest = os.path.join(DOCS_DIR, rel_path)
                print(f"⬇️  [DRIVE -> LOCAL] Restoring modified file: {rel_path}")
                os.makedirs(os.path.dirname(local_dest), exist_ok=True)
                if rem.get("mimeType") == "application/vnd.google-apps.document":
                    run_gdrive("readonly", "export", drive_id, local_dest, "--format", "md")
                else:
                    run_gdrive("readonly", "download", drive_id, "--out", local_dest)
                sanitize_markdown(local_dest)
                if os.path.exists(local_dest):
                    tracked_files[rel_path] = {
                        "drive_id": drive_id,
                        "mime": rem.get("mimeType"),
                        "drive_modified": rem["modifiedTime"],
                        "local_mtime": os.path.getmtime(local_dest),
                        "hash": md5_file(local_dest)
                    }

        # Case 3: Exists locally, deleted on Drive
        elif loc and not rem:
            if loc["hash"] == last_hash:
                print(f"🗑️  [DRIVE DELETED] Removing local file: {rel_path}")
                try:
                    os.remove(loc["abs_path"])
                except Exception:
                    pass
                tracked_files.pop(rel_path, None)
                local_files.pop(rel_path, None)
            else:
                print(f"⬆️  [LOCAL -> DRIVE] Re-uploading edited file: {rel_path}")
                parent_rel = os.path.dirname(rel_path)
                parent_id = ensure_drive_folder(parent_rel, state_folders)
                res = run_gdrive("mutate", "upload", loc["abs_path"], "--parent", parent_id)
                new_id = extract_id_from_output(res.stdout)
                new_info = get_drive_info(new_id) if new_id else {}
                tracked_files[rel_path] = {
                    "drive_id": new_id,
                    "mime": "text/markdown" if rel_path.endswith(".md") else "",
                    "drive_modified": new_info.get("modifiedTime", ""),
                    "local_mtime": os.path.getmtime(loc["abs_path"]),
                    "hash": loc["hash"]
                }

        # Case 4: Deleted on both sides
        else:
            tracked_files.pop(rel_path, None)

    # 2. Check untracked files
    # 2a. Files on Drive not in tracked_files
    for r_rel, rem in remote_files.items():
        if r_rel not in tracked_files:
            loc = local_files.get(r_rel)
            local_dest = os.path.join(DOCS_DIR, r_rel)
            if loc:
                tracked_files[r_rel] = {
                    "drive_id": rem["id"],
                    "mime": rem.get("mimeType"),
                    "drive_modified": rem["modifiedTime"],
                    "local_mtime": loc["mtime"],
                    "hash": loc["hash"]
                }
            else:
                print(f"⬇️  [DRIVE -> LOCAL] Pulling new file: {r_rel}")
                os.makedirs(os.path.dirname(local_dest), exist_ok=True)
                if rem.get("mimeType") == "application/vnd.google-apps.document":
                    run_gdrive("readonly", "export", rem["id"], local_dest, "--format", "md")
                else:
                    run_gdrive("readonly", "download", rem["id"], "--out", local_dest)
                sanitize_markdown(local_dest)
                if os.path.exists(local_dest):
                    tracked_files[r_rel] = {
                        "drive_id": rem["id"],
                        "mime": rem.get("mimeType"),
                        "drive_modified": rem["modifiedTime"],
                        "local_mtime": os.path.getmtime(local_dest),
                        "hash": md5_file(local_dest)
                    }

    # 2b. Files locally not in tracked_files
    for l_rel, loc in local_files.items():
        if l_rel not in tracked_files:
            print(f"⬆️  [LOCAL -> DRIVE] Uploading new file: {l_rel}")
            parent_rel = os.path.dirname(l_rel)
            parent_id = ensure_drive_folder(parent_rel, state_folders)
            res = run_gdrive("mutate", "upload", loc["abs_path"], "--parent", parent_id)
            new_id = extract_id_from_output(res.stdout)
            new_info = get_drive_info(new_id) if new_id else {}
            tracked_files[l_rel] = {
                "drive_id": new_id,
                "mime": "text/markdown" if l_rel.endswith(".md") else "",
                "drive_modified": new_info.get("modifiedTime", ""),
                "local_mtime": loc["mtime"],
                "hash": loc["hash"]
            }

    # Clean empty directories inside docs/
    for root, dirs, files_in_dir in os.walk(DOCS_DIR, topdown=False):
        if not files_in_dir and not dirs and root != DOCS_DIR:
            try:
                os.rmdir(root)
            except Exception:
                pass

    state["last_sync"] = time.time()
    save_state(state)

if __name__ == "__main__":
    interval = 15
    print(f"🔄 Bidirectional Drive <-> docs/ Sync Daemon started (polling interval: {interval}s).")
    while True:
        try:
            sync_bidirectional()
        except Exception as e:
            print(f"Sync error: {e}", file=sys.stderr)
        time.sleep(interval)
