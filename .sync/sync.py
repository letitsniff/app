import os
import sys
import json
import time
import hashlib
import subprocess
from datetime import datetime

ROOT_FOLDER_ID = "1oNgHqLRswU0GSE9e8XFTyf9j-dGlotbi"
WORKSPACE_DIR = "/home/vasilis/Projects/letitsniff"
STATE_FILE = os.path.join(WORKSPACE_DIR, ".sync", "sync_state.json")

def md5_file(filepath):
    h = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def run_gdrive(*args):
    cmd = ["gdrive"] + list(args)
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return res

def list_drive_folder(folder_id):
    res = run_gdrive("readonly", "ls", folder_id, "--json")
    if res.returncode != 0:
        print(f"Error listing Drive folder {folder_id}: {res.stderr.strip()}", file=sys.stderr)
        return []
    try:
        return json.loads(res.stdout)
    except Exception as e:
        print(f"Error parsing Drive listing: {e}", file=sys.stderr)
        return []

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "drive_folders": {},  # rel_dir -> folder_id
        "files": {},          # rel_path -> {"drive_id": ..., "mime": ..., "drive_modified": ..., "local_mtime": ..., "hash": ...}
        "last_sync": 0
    }

def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def sync_once(verbose=True):
    state = load_state()
    files_state = state.get("files", {})
    drive_folders = state.get("drive_folders", {})
    
    if "" not in drive_folders:
        drive_folders[""] = ROOT_FOLDER_ID

    # 1. Discover all remote folders
    remote_tree = {} # rel_path -> item
    root_items = list_drive_folder(ROOT_FOLDER_ID)
    
    for item in root_items:
        name = item.get("name")
        mime = item.get("mimeType")
        item_id = item.get("id")
        
        if mime == "application/vnd.google-apps.folder":
            drive_folders[name] = item_id
            sub_items = list_drive_folder(item_id)
            for sub in sub_items:
                rel = os.path.join(name, sub.get("name"))
                remote_tree[rel] = sub
        else:
            remote_tree[name] = item

    state["drive_folders"] = drive_folders

    # Check remote items for changes or new items
    for rel_path_remote, r_item in remote_tree.items():
        r_id = r_item.get("id")
        r_mime = r_item.get("mimeType")
        r_mod = r_item.get("modifiedTime")
        r_name = r_item.get("name")
        parent_dir = os.path.dirname(rel_path_remote)

        # Match local file name
        # If it's a doc, local file ends with .md
        target_ext = ".md" if r_mime == "application/vnd.google-apps.document" else ""
        candidate_name = f"{r_name}{target_ext}"
        candidate_rel = os.path.join(parent_dir, candidate_name)
        
        # Check if known in state
        matched_rel = None
        for known_rel, info in files_state.items():
            if info.get("drive_id") == r_id:
                matched_rel = known_rel
                break
        
        local_rel = matched_rel if matched_rel else candidate_rel
        local_abs = os.path.join(WORKSPACE_DIR, local_rel)

        # Is this remote file newer?
        record = files_state.get(local_rel)
        if not os.path.exists(local_abs):
            # Remote file needs to be pulled
            if verbose:
                print(f"⬇️  Pulling new file from Drive: {local_rel}")
            os.makedirs(os.path.dirname(local_abs), exist_ok=True)
            if r_mime == "application/vnd.google-apps.document":
                run_gdrive("readonly", "export", r_id, local_abs, "--format", "md")
            else:
                run_gdrive("readonly", "download", r_id, "--out", local_abs)
            
            if os.path.exists(local_abs):
                files_state[local_rel] = {
                    "drive_id": r_id,
                    "mime": r_mime,
                    "drive_modified": r_mod,
                    "local_mtime": os.path.getmtime(local_abs),
                    "hash": md5_file(local_abs)
                }
        elif record and record.get("drive_modified") != r_mod:
            # Drive version modified
            current_local_hash = md5_file(local_abs)
            if current_local_hash == record.get("hash"):
                # Local has not changed, safe to overwrite from Drive
                if verbose:
                    print(f"⬇️  Updating local file from Drive: {local_rel}")
                if r_mime == "application/vnd.google-apps.document":
                    run_gdrive("readonly", "export", r_id, local_abs, "--format", "md")
                else:
                    run_gdrive("readonly", "download", r_id, "--out", local_abs)
                
                files_state[local_rel] = {
                    "drive_id": r_id,
                    "mime": r_mime,
                    "drive_modified": r_mod,
                    "local_mtime": os.path.getmtime(local_abs),
                    "hash": md5_file(local_abs)
                }
            else:
                if verbose:
                    print(f"⚠️  Conflict on {local_rel}: both modified. Keeping local, saving remote as {local_rel}.remote")
                backup = f"{local_abs}.remote"
                if r_mime == "application/vnd.google-apps.document":
                    run_gdrive("readonly", "export", r_id, backup, "--format", "md")

    # 2. Check local files for changes or additions
    for root, dirs, filenames in os.walk(WORKSPACE_DIR):
        if ".sync" in root or ".git" in root or "images" in root:
            continue
        for fname in filenames:
            if not fname.endswith(".md"):
                continue
            local_abs = os.path.join(root, fname)
            local_rel = os.path.relpath(local_abs, WORKSPACE_DIR)
            parent_rel = os.path.relpath(root, WORKSPACE_DIR)
            if parent_rel == ".": parent_rel = ""

            record = files_state.get(local_rel)
            current_mtime = os.path.getmtime(local_abs)
            current_hash = md5_file(local_abs)

            if not record:
                # Find matching remote file by ID or title if not yet linked
                # Look for matching title in remote_tree
                matched_id = None
                clean_title = fname[:-3] if fname.endswith(".md") else fname
                for r_path, r_item in remote_tree.items():
                    if r_item.get("name") == clean_title:
                        matched_id = r_item.get("id")
                        matched_mime = r_item.get("mimeType")
                        break
                
                if matched_id:
                    # Link and check if upload/update needed
                    files_state[local_rel] = {
                        "drive_id": matched_id,
                        "mime": matched_mime,
                        "drive_modified": "",
                        "local_mtime": current_mtime,
                        "hash": current_hash
                    }
                    record = files_state[local_rel]
                else:
                    # New local file, upload to Drive
                    parent_drive_id = drive_folders.get(parent_rel, ROOT_FOLDER_ID)
                    if verbose:
                        print(f"⬆️  Uploading new local file to Drive: {local_rel}")
                    res = run_gdrive("mutate", "upload", local_abs, "--parent", parent_drive_id, "--mime-type", "application/vnd.google-apps.document")
                    # Retrieve new id
                    new_id = ""
                    for line in res.stdout.splitlines():
                        if "ID:" in line:
                            new_id = line.split("ID:")[1].strip().split()[0]
                    files_state[local_rel] = {
                        "drive_id": new_id,
                        "mime": "application/vnd.google-apps.document",
                        "drive_modified": "",
                        "local_mtime": current_mtime,
                        "hash": current_hash
                    }
                    continue

            # If existing record, check if local file changed
            if record and record.get("hash") != current_hash:
                d_id = record.get("drive_id")
                if d_id:
                    if verbose:
                        print(f"⬆️  Pushing local changes to Drive: {local_rel} (ID: {d_id})")
                    mime_arg = ["--mime-type", "application/vnd.google-apps.document"] if record.get("mime") == "application/vnd.google-apps.document" else []
                    run_gdrive("mutate", "update", d_id, local_abs, *mime_arg)
                    record["local_mtime"] = current_mtime
                    record["hash"] = current_hash

    state["files"] = files_state
    state["last_sync"] = time.time()
    save_state(state)
    if verbose:
        print(f"✨ Sync completed at {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    interval = 60
    if len(sys.argv) > 1 and sys.argv[1] == "--daemon":
        print(f"🚀 Starting background bi-directional sync daemon (interval: {interval}s)...")
        while True:
            try:
                sync_once(verbose=True)
            except Exception as e:
                print(f"Sync error: {e}", file=sys.stderr)
            time.sleep(interval)
    else:
        sync_once(verbose=True)
