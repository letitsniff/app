import os
import sys
import json
import time
import hashlib
import subprocess
from datetime import datetime

WORKSPACE_DIR = "/home/vasilis/Projects/letitsniff"
DOCS_DIR = os.path.join(WORKSPACE_DIR, "docs")
SYNC_DIR = os.path.join(WORKSPACE_DIR, ".sync")
STATE_FILE = os.path.join(SYNC_DIR, "sync_state.json")
ROOT_FOLDER_ID = "1oNgHqLRswU0GSE9e8XFTyf9j-dGlotbi"

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

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"files": {}, "last_sync": 0}

def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def scan_drive_tree_recursive(folder_id, current_rel_dir=""):
    """
    Recursively scans Google Drive folder hierarchy.
    Returns:
      folders: dict of drive_id -> relative_path
      files: list of (relative_filepath, drive_item)
    """
    folder_map = {folder_id: current_rel_dir}
    file_list = []
    
    items = list_drive_folder(folder_id)
    for it in items:
        name = it.get("name")
        mime = it.get("mimeType")
        item_id = it.get("id")
        
        if mime == "application/vnd.google-apps.folder":
            sub_rel = os.path.join(current_rel_dir, name) if current_rel_dir else name
            sub_folders, sub_files = scan_drive_tree_recursive(item_id, sub_rel)
            folder_map.update(sub_folders)
            file_list.extend(sub_files)
        elif mime == "application/vnd.google-apps.document":
            file_rel = os.path.join(current_rel_dir, f"{name}.md")
            file_list.append((file_rel, it))
        else:
            file_rel = os.path.join(current_rel_dir, name)
            file_list.append((file_rel, it))
            
    return folder_map, file_list

def sync_drive_to_docs():
    """
    ONE-WAY SYNC: Recursively mirrors Google Drive structure into docs/.
    - Detects moved folders/files on Drive (e.g. moving into guides/).
    - Pulls modified or new files.
    - Cleans up local files that were moved/deleted on Drive.
    """
    state = load_state()
    files_state = state.setdefault("files", {})

    remote_folders, remote_files = scan_drive_tree_recursive(ROOT_FOLDER_ID, "")

    active_local_rel_paths = set()

    for rel_path_under_drive, item in remote_files:
        drive_id = item.get("id")
        mime = item.get("mimeType")
        r_mod = item.get("modifiedTime")
        
        # Local target path is inside docs/
        local_rel = os.path.join("docs", rel_path_under_drive)
        active_local_rel_paths.add(local_rel)
        local_abs = os.path.join(WORKSPACE_DIR, local_rel)

        # Check if file moved locally from a previous location
        prev_rel = None
        for k, v in list(files_state.items()):
            if v.get("drive_id") == drive_id and k != local_rel:
                prev_rel = k
                break

        if prev_rel:
            old_abs = os.path.join(WORKSPACE_DIR, prev_rel)
            if os.path.exists(old_abs) and not os.path.exists(local_abs):
                print(f"📦 [DRIVE MOVED] Moving local file: {prev_rel} -> {local_rel}")
                os.makedirs(os.path.dirname(local_abs), exist_ok=True)
                os.rename(old_abs, local_abs)
                files_state[local_rel] = files_state.pop(prev_rel)

        record = files_state.get(local_rel)
        needs_pull = False

        if not os.path.exists(local_abs):
            needs_pull = True
            print(f"⬇️  [DRIVE -> LOCAL] Pulling: {local_rel}")
        elif record and record.get("drive_modified") != r_mod:
            needs_pull = True
            print(f"⬇️  [DRIVE -> LOCAL] Updating: {local_rel}")

        if needs_pull:
            os.makedirs(os.path.dirname(local_abs), exist_ok=True)
            if mime == "application/vnd.google-apps.document":
                run_gdrive("readonly", "export", drive_id, local_abs, "--format", "md")
            else:
                run_gdrive("readonly", "download", drive_id, "--out", local_abs)

            files_state[local_rel] = {
                "drive_id": drive_id,
                "mime": mime,
                "drive_modified": r_mod,
                "hash": md5_file(local_abs),
                "local_mtime": os.path.getmtime(local_abs) if os.path.exists(local_abs) else 0
            }
        else:
            if not record:
                files_state[local_rel] = {
                    "drive_id": drive_id,
                    "mime": mime,
                    "drive_modified": r_mod,
                    "hash": md5_file(local_abs),
                    "local_mtime": os.path.getmtime(local_abs) if os.path.exists(local_abs) else 0
                }

    # Clean up state entries that no longer exist on Drive
    for tracked_rel in list(files_state.keys()):
        if tracked_rel not in active_local_rel_paths:
            old_path = os.path.join(WORKSPACE_DIR, tracked_rel)
            if os.path.exists(old_path) and not "images" in tracked_rel:
                print(f"🗑️  [DRIVE REMOVED] Removing old location: {tracked_rel}")
                try:
                    os.remove(old_path)
                except Exception:
                    pass
            files_state.pop(tracked_rel, None)

    # Clean empty directories inside docs/
    for root, dirs, files in os.walk(DOCS_DIR, topdown=False):
        if not files and not dirs and root != DOCS_DIR:
            try:
                os.rmdir(root)
            except Exception:
                pass

    state["last_sync"] = time.time()
    save_state(state)

if __name__ == "__main__":
    interval = 15
    print(f"📥 Dynamic Recursive Drive -> docs/ Daemon started (polling interval: {interval}s).")
    while True:
        try:
            sync_drive_to_docs()
        except Exception as e:
            print(f"Sync error: {e}", file=sys.stderr)
        time.sleep(interval)
