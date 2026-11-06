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
sys.path.insert(0, WORKSPACE_DIR)

from scripts.sync_images_to_drive import sync_images

DOCS_DIR = os.path.join(WORKSPACE_DIR, "docs")
SYNC_DIR = os.path.join(WORKSPACE_DIR, ".sync")
STATE_FILE = os.path.join(SYNC_DIR, "sync_state.json")
DRIVE_STATE_FILE = os.path.join(SYNC_DIR, "drive_state.json")
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

def list_drive_folder(folder_id):
    res = run_gdrive("readonly", "ls", folder_id, "--json")
    if res.returncode != 0:
        return []
    try:
        return json.loads(res.stdout)
    except Exception:
        return []

def get_shared_images_map():
    """Builds a lookup of {drive_file_id: filename} for all images in the shared folders."""
    if not os.path.exists(DRIVE_STATE_FILE):
        return {}
    try:
        with open(DRIVE_STATE_FILE, "r", encoding="utf-8") as f:
            state = json.load(f)
        id_to_filename = {}
        for rel_path, info in state.get("files", {}).items():
            if "images/" in rel_path and info.get("id"):
                id_to_filename[info["id"]] = os.path.basename(rel_path)
        return id_to_filename
    except Exception:
        return {}

def sanitize_markdown(filepath, id_to_filename=None):
    """
    1. Removes any inline base64 image strings exported by Google Docs.
    2. Replaces Google Drive image links with local relative paths (./images/<filename>).
       ONLY links from the shared folders are allowed.
    """
    if not filepath.endswith(".md") or not os.path.exists(filepath):
        return
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()

        original_text = text

        # 1. Strip base64 image definitions & usages
        if "data:image/" in text:
            text = re.sub(r"\n*\[image\d+\]:\s*<data:image/[^>]+>", "", text)
            text = re.sub(r"!\[\]\[image\d+\]", "", text)
            text = re.sub(r"!\[.*?\]\(data:image/[^\)]+\)", "", text)

        # 2. Map Drive image links to local relative paths (Shared folders ONLY)
        if id_to_filename is None:
            id_to_filename = get_shared_images_map()

        def drive_link_to_relative(match):
            alt = match.group(1)
            raw_url = match.group(2).strip("<> ")

            # Match Google Drive file ID
            m = re.search(r"(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)", raw_url)
            if m:
                drive_id = m.group(1)
                filename = id_to_filename.get(drive_id)
                if filename:
                    # Allowed: image belongs to the shared folders
                    return f"![{alt}](./images/{filename})"
                else:
                    # Unauthorized: not from the shared folders -> ignore / strip
                    return ""

            return match.group(0)

        cleaned = re.sub(r"!\[(.*?)\]\((.*?)\)", drive_link_to_relative, text)

        if cleaned != original_text:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(cleaned)
    except Exception as e:
        print(f"Error sanitizing markdown {filepath}: {e}")

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
                    "files": normalized_files,
                    "last_sync": data.get("last_sync", 0)
                }
        except Exception:
            pass
    return {"files": {}, "last_sync": 0}

def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    temp_state = f"{STATE_FILE}.tmp"
    with open(temp_state, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    os.replace(temp_state, STATE_FILE)

def scan_drive_tree():
    """Scans Google Drive fast using ThreadPoolExecutor."""
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
            top_folders.append((name, item_id))
        elif mime == "application/vnd.google-apps.document":
            rel_name = name if name.endswith(".md") else f"{name}.md"
            files[rel_name] = it
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
            if s_mime == "application/vnd.google-apps.folder":
                if s_name.lower() in IGNORE_FOLDERS:
                    continue
                s_rel = os.path.join(rel_dir, s_name)
                local_f.append((s_rel, s_id))
            elif s_mime == "application/vnd.google-apps.document":
                rel_name = s_name if s_name.endswith(".md") else f"{s_name}.md"
                s_rel = os.path.join(rel_dir, rel_name)
                local_files.append((s_rel, it))
            else:
                s_rel = os.path.join(rel_dir, s_name)
                local_files.append((s_rel, it))
        return local_f, local_files

    with ThreadPoolExecutor(max_workers=8) as ex:
        for local_f, local_files in ex.map(scan_level1, top_folders):
            level2_folders.extend(local_f)
            for r_file, it in local_files:
                files[r_file] = it

    # Scan level 2 (e.g. blog/01 - ..., which may have images/)
    def scan_level2(folder_tuple):
        rel_dir, f_id = folder_tuple
        sub_items = list_drive_folder(f_id)
        local_f = []
        local_files = []
        for it in sub_items:
            s_name = it.get("name")
            s_mime = it.get("mimeType")
            s_id = it.get("id")
            if s_mime == "application/vnd.google-apps.folder":
                if s_name.lower() in IGNORE_FOLDERS:
                    continue
                s_rel = os.path.join(rel_dir, s_name)
                local_f.append((s_rel, s_id))
            elif s_mime == "application/vnd.google-apps.document":
                rel_name = s_name if s_name.endswith(".md") else f"{s_name}.md"
                s_rel = os.path.join(rel_dir, rel_name)
                local_files.append((s_rel, it))
            else:
                s_rel = os.path.join(rel_dir, s_name)
                local_files.append((s_rel, it))
        return local_f, local_files

    with ThreadPoolExecutor(max_workers=10) as ex:
        for local_f, local_files in ex.map(scan_level2, level2_folders):
            for r_dir, f_id in local_f:
                # Scan level 3 (e.g. images/)
                l3_items = list_drive_folder(f_id)
                for it in l3_items:
                    s_name = it.get("name")
                    s_mime = it.get("mimeType")
                    if s_mime == "application/vnd.google-apps.document":
                        rel_name = s_name if s_name.endswith(".md") else f"{s_name}.md"
                    else:
                        rel_name = s_name
                    it_rel = os.path.join(r_dir, rel_name)
                    if s_mime != "application/vnd.google-apps.folder":
                        files[it_rel] = it
            for r_file, it in local_files:
                files[r_file] = it

    return files

def sync_from_drive():
    """Pulls new or modified docs from Google Drive to docs/."""
    state = load_state()
    tracked_files = state.setdefault("files", {})

    remote_files = scan_drive_tree()
    active_remote_paths = set(remote_files.keys())

    # 1. Pull new or updated files from Drive
    for rel_path, rem in remote_files.items():
        drive_id = rem.get("id")
        mime = rem.get("mimeType")
        r_mod = rem.get("modifiedTime")
        local_dest = os.path.join(DOCS_DIR, rel_path)

        record = tracked_files.get(rel_path)
        needs_pull = False

        if not os.path.exists(local_dest):
            needs_pull = True
            print(f"⬇️  [DRIVE -> LOCAL] Pulling new file: {rel_path}")
        elif record and record.get("drive_modified") != r_mod:
            needs_pull = True
            print(f"⬇️  [DRIVE -> LOCAL] Updating modified file: {rel_path}")
        elif not record:
            needs_pull = True

        if needs_pull:
            os.makedirs(os.path.dirname(local_dest), exist_ok=True)
            if mime == "application/vnd.google-apps.document":
                run_gdrive("readonly", "export", drive_id, local_dest, "--format", "md")
            else:
                run_gdrive("readonly", "download", drive_id, "--out", local_dest)

            sanitize_markdown(local_dest)

            if os.path.exists(local_dest):
                tracked_files[rel_path] = {
                    "drive_id": drive_id,
                    "mime": mime,
                    "drive_modified": r_mod,
                    "local_mtime": os.path.getmtime(local_dest),
                    "hash": md5_file(local_dest)
                }

    # 2. Clean up local files that were removed from Google Drive (NEVER delete images)
    for tracked_rel in list(tracked_files.keys()):
        if tracked_rel not in active_remote_paths:
            if "/images/" in tracked_rel or tracked_rel.startswith("images/"):
                continue  # Never delete images!
            local_path = os.path.join(DOCS_DIR, tracked_rel)
            if os.path.exists(local_path):
                print(f"🗑️  [DRIVE REMOVED] Deleting local file: {tracked_rel}")
                try:
                    os.remove(local_path)
                except Exception:
                    pass
            tracked_files.pop(tracked_rel, None)

    # 3. Clean empty directories inside docs/
    for root, dirs, files_in_dir in os.walk(DOCS_DIR, topdown=False):
        if not files_in_dir and not dirs and root != DOCS_DIR:
            try:
                os.rmdir(root)
            except Exception:
                pass

    state["last_sync"] = time.time()
    save_state(state)

def run_sync_loop(interval=15):
    print(f"🐾 Let It Sniff Sync Daemon started (polling interval: {interval}s).")
    print(f"   ⬆️  Laptop -> Drive: Auto-uploads any generated/committed images in docs/blog/*/images/*")
    print(f"   ⬇️  Drive -> Laptop: Pulls articles updated by Alex in Google Docs")

    while True:
        # Step 1: Upload any local images from Laptop -> Drive
        try:
            sync_images(verbose=False)
        except Exception as e:
            print(f"⚠️  Image upload error: {e}", file=sys.stderr)

        # Step 2: Pull any Google Docs updates from Drive -> Laptop
        try:
            sync_from_drive()
        except Exception as e:
            print(f"⚠️  Drive pull error: {e}", file=sys.stderr)

        time.sleep(interval)

if __name__ == "__main__":
    run_sync_loop(interval=15)
