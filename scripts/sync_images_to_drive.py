#!/usr/bin/env python3
"""
Sync Local Images -> Google Drive
Scans docs/blog/*/images/* and uploads any missing or updated images
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
BLOG_FOLDER_NAME = "blog"

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

def get_or_create_folder(name, parent_id):
    items = list_folder_json(parent_id)
    for it in items:
        if it.get("name") == name and it.get("mimeType") == "application/vnd.google-apps.folder":
            return it.get("id")
    
    # Create folder
    print(f"📁 Creating folder '{name}' on Google Drive (parent: {parent_id})...")
    res = run_gdrive("mutate", "mkdir", name, "--parent", parent_id)
    if res.returncode != 0:
        print(f"❌ Error creating folder '{name}': {res.stderr.strip()}", file=sys.stderr)
        return None
    
    m = re.search(r"ID:\s*([a-zA-Z0-9_-]+)", res.stdout)
    if m:
        return m.group(1)
    
    # Fallback to re-listing
    items = list_folder_json(parent_id)
    for it in items:
        if it.get("name") == name and it.get("mimeType") == "application/vnd.google-apps.folder":
            return it.get("id")
    return None

def upload_file(local_path, parent_id):
    filename = local_path.name
    print(f"⬆️  Uploading: {filename} -> Drive folder {parent_id}")
    res = run_gdrive("mutate", "upload", str(local_path), "--parent", parent_id)
    if res.returncode != 0:
        print(f"❌ Failed to upload {filename}: {res.stderr.strip()}", file=sys.stderr)
        return None
    m = re.search(r"ID:\s*([a-zA-Z0-9_-]+)", res.stdout)
    if m:
        return m.group(1)
    return None

def main():
    print("🐾 Let It Sniff — Image Sync to Google Drive")
    print(f"Scanning local images in {DOCS_DIR / 'blog'}...")

    # Load drive_state if exists
    state = {}
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                state = json.load(f)
        except Exception:
            state = {}
    tracked_files = state.setdefault("files", {})

    # 1. Find blog folder on Drive
    root_items = list_folder_json(ROOT_FOLDER_ID)
    blog_folder_id = None
    for it in root_items:
        if it.get("name") == BLOG_FOLDER_NAME and it.get("mimeType") == "application/vnd.google-apps.folder":
            blog_folder_id = it.get("id")
            break
    
    if not blog_folder_id:
        sys.exit(f"❌ Could not find '{BLOG_FOLDER_NAME}' folder under root {ROOT_FOLDER_ID}")

    # 2. Get all pillars on Drive
    pillar_items = list_folder_json(blog_folder_id)
    drive_pillars = {}
    for it in pillar_items:
        if it.get("mimeType") == "application/vnd.google-apps.folder":
            drive_pillars[it.get("name")] = it.get("id")

    # 3. Scan local pillars
    local_blog_dir = DOCS_DIR / "blog"
    if not local_blog_dir.exists():
        sys.exit(f"❌ {local_blog_dir} does not exist.")

    uploaded_count = 0
    skipped_count = 0

    for pillar_dir in sorted(local_blog_dir.iterdir()):
        if not pillar_dir.is_dir():
            continue
        images_dir = pillar_dir / "images"
        if not images_dir.exists() or not images_dir.is_dir():
            continue

        pillar_name = pillar_dir.name
        pillar_drive_id = drive_pillars.get(pillar_name)
        if not pillar_drive_id:
            # Try fuzzy match if accents or formatting differ
            for d_name, d_id in drive_pillars.items():
                if d_name.startswith(pillar_name[:2]):
                    pillar_drive_id = d_id
                    break

        if not pillar_drive_id:
            print(f"⚠️  Could not find pillar '{pillar_name}' on Google Drive. Skipping its images.")
            continue

        # Get or create 'images' folder on Drive inside this pillar
        images_folder_id = get_or_create_folder("images", pillar_drive_id)
        if not images_folder_id:
            print(f"⚠️  Could not access or create 'images' folder for '{pillar_name}'.")
            continue

        # List existing files in this Drive images folder
        drive_images = list_folder_json(images_folder_id)
        existing_names = {it.get("name"): it for it in drive_images}

        # Scan local image files
        for img_file in sorted(images_dir.iterdir()):
            if not img_file.is_file():
                continue
            if img_file.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".svg", ".avif"}:
                continue

            rel_path = f"blog/{pillar_name}/images/{img_file.name}"
            
            # Check if file already exists on Drive
            if img_file.name in existing_names:
                drive_it = existing_names[img_file.name]
                drive_id = drive_it.get("id")
                # Record in state if missing
                if rel_path not in tracked_files:
                    tracked_files[rel_path] = {
                        "id": drive_id,
                        "modifiedTime": drive_it.get("modifiedTime"),
                        "mimeType": drive_it.get("mimeType", "image/jpeg")
                    }
                skipped_count += 1
                continue

            # Upload missing image
            new_id = upload_file(img_file, images_folder_id)
            if new_id:
                uploaded_count += 1
                tracked_files[rel_path] = {
                    "id": new_id,
                    "modifiedTime": "",
                    "mimeType": "image/jpeg"
                }

    # Save state
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

    print(f"\n📊 Image Sync Finished: {uploaded_count} uploaded, {skipped_count} already existed on Drive.")

if __name__ == "__main__":
    main()
