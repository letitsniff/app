#!/usr/bin/env python3
"""
Sync Local Images -> Google Drive
Scans docs/blog/**/images/* and uploads any missing or updated images
to the corresponding 'images' folder on Google Drive.
"""

import os
import sys
import json
import subprocess
import re
from pathlib import Path

WORKSPACE_DIR = Path(__file__).resolve().parent.parent
DOCS_DIR = WORKSPACE_DIR / "docs"
STATE_FILE = WORKSPACE_DIR / ".sync" / "drive_state.json"
ROOT_FOLDER_ID = "1oNgHqLRswU0GSE9e8XFTyf9j-dGlotbi"

def run_gdrive(*args):
    cmd = ["gdrive"] + list(args)
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return res

def list_folder_json(folder_id):
    res = run_gdrive("readonly", "ls", folder_id, "--json")
    if res.returncode != 0:
        return []
    try:
        return json.loads(res.stdout)
    except Exception:
        return []

_folder_id_cache = {}

def get_or_create_folder(name, parent_id, verbose=True):
    cache_key = (parent_id, name)
    if cache_key in _folder_id_cache:
        return _folder_id_cache[cache_key]

    items = list_folder_json(parent_id)
    for it in items:
        if it.get("name") == name and it.get("mimeType") == "application/vnd.google-apps.folder":
            _folder_id_cache[cache_key] = it.get("id")
            return it.get("id")

    # Create folder
    if verbose:
        print(f"📁 Creating folder '{name}' on Google Drive (parent: {parent_id})...")
    res = run_gdrive("mutate", "mkdir", name, "--parent", parent_id)
    if res.returncode != 0:
        if verbose:
            print(f"❌ Error creating folder '{name}': {res.stderr.strip()}", file=sys.stderr)
        return None

    m = re.search(r"ID:\s*([a-zA-Z0-9_-]+)", res.stdout)
    if m:
        _folder_id_cache[cache_key] = m.group(1)
        return m.group(1)

    items = list_folder_json(parent_id)
    for it in items:
        if it.get("name") == name and it.get("mimeType") == "application/vnd.google-apps.folder":
            _folder_id_cache[cache_key] = it.get("id")
            return it.get("id")
    return None

def resolve_drive_folder_for_path(rel_dir_path: str, verbose=True) -> str | None:
    """Recursively resolves or creates the Drive folder ID for a relative path from ROOT_FOLDER_ID."""
    parts = Path(rel_dir_path).parts
    current_id = ROOT_FOLDER_ID
    for part in parts:
        current_id = get_or_create_folder(part, current_id, verbose=verbose)
        if not current_id:
            return None
    return current_id

def upload_file(local_path, parent_id, verbose=True):
    filename = local_path.name
    if verbose:
        print(f"⬆️  Uploading: {filename} -> Drive folder {parent_id}")
    res = run_gdrive("mutate", "upload", str(local_path), "--parent", parent_id)
    if res.returncode != 0:
        if verbose:
            print(f"❌ Failed to upload {filename}: {res.stderr.strip()}", file=sys.stderr)
        return None
    m = re.search(r"ID:\s*([a-zA-Z0-9_-]+)", res.stdout)
    if m:
        return m.group(1)
    return None

def sync_images(verbose=True):
    if verbose:
        print("🐾 Let It Sniff — Image Sync to Google Drive")
        print(f"Scanning local images in {DOCS_DIR / 'blog'}...")

    state = {}
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                state = json.load(f)
        except Exception:
            state = {}
    tracked_files = state.setdefault("files", {})

    local_blog_dir = DOCS_DIR / "blog"
    if not local_blog_dir.exists():
        return 0, 0

    uploaded_count = 0
    skipped_count = 0

    images_dirs = sorted(local_blog_dir.glob("**/images"))
    for images_dir in images_dirs:
        rel_dir = str(images_dir.relative_to(DOCS_DIR))
        images_folder_id = resolve_drive_folder_for_path(rel_dir, verbose=verbose)
        if not images_folder_id:
            continue

        drive_images = list_folder_json(images_folder_id)
        existing_names = {}
        for it in drive_images:
            name = it.get("name")
            if not name:
                continue
            if name in existing_names:
                curr = existing_names[name]
                if (it.get("modifiedTime", ""), it.get("id", "")) <= (curr.get("modifiedTime", ""), curr.get("id", "")):
                    continue
            existing_names[name] = it

        for img_file in sorted(images_dir.iterdir()):
            if not img_file.is_file():
                continue
            if img_file.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".svg", ".avif"}:
                continue

            rel_path = f"{rel_dir}/{img_file.name}"

            if img_file.name in existing_names:
                drive_it = existing_names[img_file.name]
                drive_id = drive_it.get("id")
                curr_tracked = tracked_files.get(rel_path)
                if not curr_tracked or curr_tracked.get("id") != drive_id or curr_tracked.get("modifiedTime") != drive_it.get("modifiedTime"):
                    tracked_files[rel_path] = {
                        "id": drive_id,
                        "modifiedTime": drive_it.get("modifiedTime"),
                        "mimeType": drive_it.get("mimeType", "image/jpeg")
                    }
                skipped_count += 1
                continue

            new_id = upload_file(img_file, images_folder_id, verbose=True)
            if new_id:
                uploaded_count += 1
                tracked_files[rel_path] = {
                    "id": new_id,
                    "modifiedTime": "",
                    "mimeType": "image/jpeg"
                }

    if uploaded_count > 0:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)

    if verbose or uploaded_count > 0:
        print(f"📊 Image Sync: {uploaded_count} uploaded, {skipped_count} up-to-date on Drive.")

    return uploaded_count, skipped_count

if __name__ == "__main__":
    sync_images(verbose=True)
