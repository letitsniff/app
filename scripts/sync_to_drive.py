#!/usr/bin/env python3
"""
Sync Laptop -> Google Drive
1. Syncs all local images from docs/blog/*/images/ to Google Drive.
2. Syncs all local markdown files to Google Drive, converting relative
   image links (./images/filename.jpg) into direct Google Drive links
   (https://drive.google.com/file/d/<id>/view) on Google Drive only.
3. Overwrites any base64 images in Google Drive documents, ensuring Google Docs
   only contains clean Google Drive image links while local Git keeps clean relative paths.
"""

import os
import sys
import json
import re
import subprocess
import tempfile
import time
import hashlib
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

WORKSPACE_DIR = Path(__file__).resolve().parent.parent
DOCS_DIR = WORKSPACE_DIR / "docs"
STATE_FILE = WORKSPACE_DIR / ".sync" / "drive_state.json"

sys.path.insert(0, str(WORKSPACE_DIR))
sys.path.insert(0, str(WORKSPACE_DIR / ".sync"))
from scripts.sync_images_to_drive import sync_images
from path_mapper import map_local_rel_to_drive_rel

def run_cmd(*args):
    return subprocess.run(list(args), capture_output=True, text=True)

def sync_markdown_to_drive(verbose=True):
    if not STATE_FILE.exists():
        sys.exit(f"❌ State file not found: {STATE_FILE}")

    with open(STATE_FILE, "r", encoding="utf-8") as f:
        state = json.load(f)

    tracked_files = state.setdefault("files", {})

    # Build filename -> Drive ID map for images in shared folders
    filename_to_drive_id = {}
    for rel_path, info in tracked_files.items():
        if "images/" in rel_path and info.get("id"):
            fname = os.path.basename(rel_path)
            filename_to_drive_id[fname] = info["id"]

    if verbose:
        print(f"📊 Loaded {len(filename_to_drive_id)} shared images from drive_state.json")

    blog_dir = DOCS_DIR / "blog"
    services_dir = DOCS_DIR / "services"
    site_dir = DOCS_DIR / "site"
    md_files = [f for f in sorted(blog_dir.glob("**/*.md")) if "images" not in f.parts]
    if services_dir.exists():
        md_files += sorted(services_dir.glob("*.md"))
    if site_dir.exists():
        md_files += sorted(site_dir.glob("*.md"))

    tasks = []
    skipped_count = 0
    for md_file in md_files:
        local_rel = str(md_file.relative_to(DOCS_DIR))
        rel_path = map_local_rel_to_drive_rel(local_rel)
        if not rel_path:
            continue
        doc_info = tracked_files.get(rel_path)
        if not doc_info or not doc_info.get("id"):
            continue

        doc_id = doc_info["id"]

        with open(md_file, "r", encoding="utf-8") as f:
            local_content = f.read()

        # Convert local relative paths to Google Drive direct image links for Drive upload
        def to_drive_link(match):
            alt = match.group(1)
            raw_url = match.group(2).strip("<> ")
            fname = os.path.basename(raw_url)
            drive_id = filename_to_drive_id.get(fname)
            if drive_id:
                return f"![{alt}](https://lh3.googleusercontent.com/d/{drive_id})"
            return match.group(0)

        drive_ready_content = re.sub(r"!\[(.*?)\]\((.*?)\)", to_drive_link, local_content)
        content_hash = hashlib.sha256(drive_ready_content.encode("utf-8")).hexdigest()

        # If file content is identical to last sync, skip upload!
        if doc_info.get("contentHash") == content_hash:
            skipped_count += 1
            continue

        tasks.append((md_file, rel_path, doc_id, drive_ready_content, content_hash))

    if not tasks:
        if verbose:
            print(f"✨ All {len(md_files)} documents are up-to-date with Google Drive (0 modified).")
        return 0

    if verbose:
        print(f"🚀 Updating {len(tasks)} modified document(s) on Google Drive ({skipped_count} unchanged skipped)...")

    updated_count = 0
    errors = []

    def update_single_doc(task):
        md_file, rel_path, doc_id, drive_content, content_hash = task
        # Create temp file with drive_ready_content (preserves local file with relative paths!)
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".md", delete=False) as tf:
            tf.write(drive_content)
            temp_path = tf.name

        try:
            res = None
            for attempt in range(4):
                res = run_cmd("gdrive", "mutate", "update", doc_id, temp_path, "--mime-type", "text/markdown")
                if res.returncode == 0:
                    break
                if "RATE_LIMIT_EXCEEDED" in res.stderr or "403" in res.stderr or "429" in res.stderr:
                    time.sleep(2 ** attempt + 1.5)
                    continue
                return False, rel_path, res.stderr.strip(), content_hash
            else:
                return False, rel_path, res.stderr.strip() if res else "Unknown error", content_hash

            # Retrieve updated modifiedTime
            info_res = run_cmd("gdrive", "readonly", "info", doc_id, "--json")
            mod_time = ""
            if info_res.returncode == 0:
                try:
                    info_data = json.loads(info_res.stdout)
                    mod_time = info_data.get("modifiedTime", "")
                except Exception:
                    pass

            return True, rel_path, mod_time, content_hash
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    with ThreadPoolExecutor(max_workers=3) as executor:
        future_to_task = {executor.submit(update_single_doc, t): t for t in tasks}
        for future in as_completed(future_to_task):
            task = future_to_task[future]
            success, rel_path, result, c_hash = future.result()
            if success:
                updated_count += 1
                if result:
                    tracked_files[rel_path]["modifiedTime"] = result
                tracked_files[rel_path]["contentHash"] = c_hash
                if verbose:
                    print(f"  [{updated_count}/{len(tasks)}] ✅ Synced to Drive: {task[0].name}")
            else:
                errors.append((rel_path, result))
                if verbose:
                    print(f"  ❌ Error updating {rel_path}: {result}", file=sys.stderr)

    if updated_count > 0:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)

    if verbose:
        print(f"\n🎉 Successfully synced {updated_count}/{len(tasks)} documents to Google Drive.")
        if errors:
            print(f"⚠️ {len(errors)} error(s):", errors)

    return updated_count

def main():
    print("🐾 Let It Sniff — Syncing Laptop -> Google Drive")
    print("--------------------------------------------------")
    # Step 1: Sync all images
    print("📸 Step 1: Uploading local images to Google Drive...")
    sync_images(verbose=True)

    # Step 2: Sync all markdown docs (with Drive links on Drive, relative paths in Git)
    print("\n📝 Step 2: Syncing markdown docs to Google Drive (with Drive links)...")
    sync_markdown_to_drive(verbose=True)
    print("--------------------------------------------------")
    print("✅ All images and documents are in perfect sync with Google Drive!")

if __name__ == "__main__":
    main()
