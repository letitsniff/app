#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sync docs/posts/ to Google Drive (folder: posts, ID: 1WpyYy4ryfB6wYyisJS0om2rOGa4zl1ZC)
Incrementally tracks state in .sync/posts_drive_state.json
"""

import os
import sys
import json
import subprocess
from pathlib import Path

WORKSPACE_DIR = Path(__file__).resolve().parent.parent
POSTS_DIR = WORKSPACE_DIR / "docs" / "posts"
STATE_FILE = WORKSPACE_DIR / ".sync" / "posts_drive_state.json"
GDRIVE_BIN = WORKSPACE_DIR.parent / ".gemini" / "config" / "plugins" / "gdrive" / "skills" / "gdrive" / "scripts" / "gdrive"
if not GDRIVE_BIN.exists():
    GDRIVE_BIN = "gdrive"
else:
    GDRIVE_BIN = str(GDRIVE_BIN)

DRIVE_POSTS_FOLDER_ID = "1WpyYy4ryfB6wYyisJS0om2rOGa4zl1ZC"

def run_cmd(*args):
    cmd = [GDRIVE_BIN] + list(args)
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res

def load_state():
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"folders": {}, "files": {}}

def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

def get_or_create_drive_folder(folder_name, parent_id, state):
    if folder_name in state["folders"]:
        return state["folders"][folder_name]

    # Check on drive
    res = run_cmd("readonly", "ls", parent_id, "--json")
    if res.returncode == 0:
        try:
            items = json.loads(res.stdout)
            for it in items:
                if it.get("name") == folder_name:
                    state["folders"][folder_name] = it.get("id")
                    save_state(state)
                    return it.get("id")
        except Exception:
            pass

    # Create folder
    res = run_cmd("mutate", "mkdir", folder_name, "--parent", parent_id)
    if res.returncode == 0:
        # Created folder: name (ID: xxx)
        m = re.search(r"\(ID:\s*([^\)]+)\)", res.stdout)
        if m:
            fid = m.group(1).strip()
            state["folders"][folder_name] = fid
            save_state(state)
            return fid

    return None

import re

def sync_post_folder(folder_path, state):
    folder_name = folder_path.name
    drive_folder_id = get_or_create_drive_folder(folder_name, DRIVE_POSTS_FOLDER_ID, state)
    if not drive_folder_id:
        print(f"❌ Failed to get or create Drive folder for: {folder_name}")
        return

    for file_name in ["scenario.md", "prompt.md", "video.mp4"]:
        local_file = folder_path / file_name
        if not local_file.exists():
            continue

        rel_key = f"{folder_name}/{file_name}"
        mtime = os.path.getmtime(local_file)
        size = os.path.getsize(local_file)

        cached = state["files"].get(rel_key, {})
        if cached.get("mtime") == mtime and cached.get("size") == size:
            # up to date
            continue

        file_id = cached.get("id")
        if file_id:
            # Update existing file
            print(f"🔄 Updating {rel_key} on Drive...")
            res = run_cmd("mutate", "update", file_id, str(local_file))
            if res.returncode == 0:
                cached["mtime"] = mtime
                cached["size"] = size
                state["files"][rel_key] = cached
                save_state(state)
            else:
                print(f"⚠️ Update failed for {rel_key}: {res.stderr}")
        else:
            # Upload new file
            print(f"⬆️ Uploading {rel_key} to Drive...")
            res = run_cmd("mutate", "upload", str(local_file), "--parent", drive_folder_id)
            if res.returncode == 0:
                m = re.search(r"\(ID:\s*([^\)]+)\)", res.stdout)
                fid = m.group(1).strip() if m else None
                state["files"][rel_key] = {
                    "id": fid,
                    "mtime": mtime,
                    "size": size
                }
                save_state(state)
                print(f"✅ Uploaded {rel_key} (ID: {fid})")
            else:
                print(f"⚠️ Upload failed for {rel_key}: {res.stderr}")

def main():
    if not POSTS_DIR.exists():
        print(f"❌ Posts dir does not exist: {POSTS_DIR}")
        return

    state = load_state()
    folders = sorted([f for f in POSTS_DIR.iterdir() if f.is_dir()])
    print(f"Syncing {len(folders)} post folders to Google Drive (posts folder: {DRIVE_POSTS_FOLDER_ID})...")

    # Also sync README.md
    readme_file = POSTS_DIR / "README.md"
    if readme_file.exists():
        rel_key = "README.md"
        mtime = os.path.getmtime(readme_file)
        size = os.path.getsize(readme_file)
        cached = state["files"].get(rel_key, {})
        if cached.get("mtime") != mtime:
            print("⬆️ Syncing posts/README.md to Drive...")
            if cached.get("id"):
                run_cmd("mutate", "update", cached["id"], str(readme_file))
            else:
                res = run_cmd("mutate", "upload", str(readme_file), "--parent", DRIVE_POSTS_FOLDER_ID)
                m = re.search(r"\(ID:\s*([^\)]+)\)", res.stdout)
                if m:
                    cached["id"] = m.group(1).strip()
            cached["mtime"] = mtime
            cached["size"] = size
            state["files"][rel_key] = cached
            save_state(state)

    for idx, folder in enumerate(folders, 1):
        sync_post_folder(folder, state)

    print("🎉 Google Drive sync completed!")

if __name__ == "__main__":
    main()
