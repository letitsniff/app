import os
import sys
import json
import time
import hashlib
import subprocess
import re
from datetime import datetime
import threading
from concurrent.futures import ThreadPoolExecutor

WORKSPACE_DIR = "/home/vasilis/Projects/letitsniff"
DOCS_DIR = os.path.join(WORKSPACE_DIR, "docs")
SYNC_DIR = os.path.join(WORKSPACE_DIR, ".sync")
STATE_FILE = os.path.join(SYNC_DIR, "drive_state.json")
ROOT_FOLDER_ID = "1oNgHqLRswU0GSE9e8XFTyf9j-dGlotbi"
IGNORE_FOLDERS = {"blogold", "old", "archive", "backup", "trash", ".trash"}

sys.path.insert(0, WORKSPACE_DIR)
sys.path.insert(0, SYNC_DIR)

from scripts.sync_images_to_drive import sync_images
from path_mapper import map_drive_rel_to_local_rel, map_local_rel_to_drive_rel

def run_gdrive(*args):
    cmd = ["gdrive"] + list(args)
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return res

def list_drive_folder(folder_id, max_retries=3):
    for attempt in range(max_retries):
        res = run_gdrive("readonly", "ls", folder_id, "--json")
        if res.returncode == 0:
            try:
                return json.loads(res.stdout)
            except Exception:
                pass
        time.sleep(1 + attempt)
    return None

def get_shared_images_map():
    """Builds a lookup of {drive_file_id: filename} for all images in the shared folders."""
    if not os.path.exists(STATE_FILE):
        return {}
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
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
                return {"files": normalized_files}
        except Exception:
            pass
    return {"files": {}}

def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    temp_state = f"{STATE_FILE}.tmp"
    with open(temp_state, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    os.replace(temp_state, STATE_FILE)

def scan_drive_tree():
    """Recursively scans all files in Google Drive from ROOT_FOLDER_ID."""
    files = {}
    lock = threading.Lock()
    scan_had_errors = False

    def scan_recursive(folder_id, current_rel):
        nonlocal scan_had_errors
        items = list_drive_folder(folder_id)
        if items is None:
            scan_had_errors = True
            print(f"⚠️ Failed to list folder: {folder_id} ({current_rel})")
            return

        sub_folders = []
        for it in items:
            name = it.get("name")
            mime = it.get("mimeType")
            if mime == "application/vnd.google-apps.folder":
                if name.lower() in IGNORE_FOLDERS:
                    continue
                sub_rel = os.path.join(current_rel, name) if current_rel else name
                sub_folders.append((it.get("id"), sub_rel))
            elif mime == "application/vnd.google-apps.document":
                rel_name = name if name.endswith(".md") else f"{name}.md"
                f_rel = os.path.join(current_rel, rel_name) if current_rel else rel_name
                with lock:
                    if f_rel in files:
                        curr = files[f_rel]
                        if (it.get("modifiedTime", ""), it.get("id", "")) <= (curr.get("modifiedTime", ""), curr.get("id", "")):
                            continue
                    files[f_rel] = it
            else:
                f_rel = os.path.join(current_rel, name) if current_rel else name
                with lock:
                    if f_rel in files:
                        curr = files[f_rel]
                        if (it.get("modifiedTime", ""), it.get("id", "")) <= (curr.get("modifiedTime", ""), curr.get("id", "")):
                            continue
                    files[f_rel] = it

        if sub_folders:
            with ThreadPoolExecutor(max_workers=min(10, len(sub_folders))) as ex:
                list(ex.map(lambda t: scan_recursive(t[0], t[1]), sub_folders))

    scan_recursive(ROOT_FOLDER_ID, "")
    return files, scan_had_errors

def sync_from_drive():
    """Pulls new or modified docs from Google Drive to docs/."""
    state = load_state()
    tracked_files = state.setdefault("files", {})

    remote_files, scan_had_errors = scan_drive_tree()
    active_remote_paths = set(remote_files.keys())

    # 1. Pull new or updated files from Drive
    for rel_path, rem in remote_files.items():
        drive_id = rem.get("id")
        mime = rem.get("mimeType")
        r_mod = rem.get("modifiedTime")
        local_rel = map_drive_rel_to_local_rel(rel_path)
        local_dest = os.path.join(DOCS_DIR, local_rel)

        record = tracked_files.get(rel_path)
        needs_pull = False

        if not os.path.exists(local_dest):
            needs_pull = True
            print(f"⬇️  [DRIVE -> LOCAL] Pulling new file: {rel_path}")
        elif record and (record.get("modifiedTime") != r_mod and record.get("drive_modified") != r_mod):
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
                    "id": drive_id,
                    "modifiedTime": r_mod,
                    "mimeType": mime
                }

    # 2. Clean up local files that were removed from Google Drive (NEVER delete images or index.md)
    if scan_had_errors:
        print("⚠️ Scan encountered errors on one or more folders; skipping deletion cleanup to protect local files.")
    elif len(tracked_files) > 0 and len(remote_files) < len(tracked_files) * 0.8:
        print(f"⚠️ Remote scan returned suspiciously few files ({len(remote_files)} vs {len(tracked_files)} tracked); skipping deletion cleanup.")
    else:
        for tracked_rel in list(tracked_files.keys()):
            if tracked_rel not in active_remote_paths:
                if "/images/" in tracked_rel or tracked_rel.startswith("images/") or tracked_rel.endswith("index.md") or tracked_rel.startswith("site/"):
                    continue  # Never delete images, index.md, or site copy!
                local_path = os.path.join(DOCS_DIR, map_drive_rel_to_local_rel(tracked_rel))
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
    if "--once" in sys.argv:
        print("🐾 Running single sync iteration...")
        sync_images(verbose=True)
        sync_from_drive()
        print("✅ Single sync complete.")
    else:
        run_sync_loop(interval=15)
