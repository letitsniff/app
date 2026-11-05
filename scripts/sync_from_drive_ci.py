#!/usr/bin/env python3
"""
CI One-Way Google Drive -> docs/ Sync Script
Incremental Sync: Only downloads/exports files that were actually modified on Google Drive.
"""

import os
import sys
import json
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

ROOT_FOLDER_ID = os.environ.get("GDRIVE_ROOT_FOLDER_ID", "1oNgHqLRswU0GSE9e8XFTyf9j-dGlotbi")
WORKSPACE_DIR = Path(__file__).resolve().parent.parent
DOCS_DIR = WORKSPACE_DIR / "docs"
STATE_FILE = WORKSPACE_DIR / ".sync" / "drive_state.json"
IGNORE_FOLDERS = {"blogold", "old", "archive", "backup", "trash", ".trash"}

def get_drive_service():
    """Initializes Google Drive v3 API client using Service Account credentials."""
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    key_json = os.environ.get("GDRIVE_SERVICE_ACCOUNT_KEY")
    if key_json:
        try:
            info = json.loads(key_json)
        except Exception as e:
            sys.exit(f"❌ Error parsing GDRIVE_SERVICE_ACCOUNT_KEY JSON: {e}")
        creds = service_account.Credentials.from_service_account_info(
            info,
            scopes=["https://www.googleapis.com/auth/drive.readonly"]
        )
    elif (WORKSPACE_DIR / "service_account.json").exists():
        creds = service_account.Credentials.from_service_account_file(
            str(WORKSPACE_DIR / "service_account.json"),
            scopes=["https://www.googleapis.com/auth/drive.readonly"]
        )
    else:
        sys.exit("❌ Error: GDRIVE_SERVICE_ACCOUNT_KEY secret is not set.")

    return build("drive", "v3", credentials=creds)

def sanitize_markdown(filepath):
    """Removes any inline base64 image strings exported by Google Docs."""
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        if "data:image/" in text:
            cleaned = re.sub(r"\n*\[image\d+\]:\s*<data:image/[^>]+>", "", text)
            cleaned = re.sub(r"!\[\]\[image\d+\]", "", cleaned)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(cleaned)
    except Exception as e:
        print(f"Warning sanitizing {filepath}: {e}", file=sys.stderr)

def list_folder_contents(service, folder_id):
    """Fetches all non-trashed items inside a Drive folder."""
    items = []
    page_token = None
    query = f"'{folder_id}' in parents and trashed = false"

    while True:
        res = service.files().list(
            q=query,
            fields="nextPageToken, files(id, name, mimeType, modifiedTime)",
            pageToken=page_token,
            pageSize=100
        ).execute()
        items.extend(res.get("files", []))
        page_token = res.get("nextPageToken")
        if not page_token:
            break

    return items

def scan_drive_recursive(service, folder_id, current_rel_dir=""):
    """
    Recursively scans Google Drive folder tree.
    Returns: list of (rel_file_path, file_id, mime_type, name, modified_time)
    """
    file_list = []
    items = list_folder_contents(service, folder_id)

    for item in items:
        name = item.get("name", "")
        mime = item.get("mimeType", "")
        item_id = item.get("id")
        modified_time = item.get("modifiedTime", "")

        if mime == "application/vnd.google-apps.folder":
            if name.lower() in IGNORE_FOLDERS:
                continue
            sub_rel = os.path.join(current_rel_dir, name) if current_rel_dir else name
            file_list.extend(scan_drive_recursive(service, item_id, sub_rel))
        elif mime == "application/vnd.google-apps.document":
            rel_name = name if name.endswith(".md") else f"{name}.md"
            file_rel = os.path.join(current_rel_dir, rel_name) if current_rel_dir else rel_name
            file_list.append((file_rel, item_id, mime, name, modified_time))
        else:
            file_rel = os.path.join(current_rel_dir, name) if current_rel_dir else name
            file_list.append((file_rel, item_id, mime, name, modified_time))

    return file_list

def export_file(service, item_id, mime, dest_path):
    """Exports or downloads a file from Google Drive."""
    from googleapiclient.http import MediaIoBaseDownload

    dest_path.parent.mkdir(parents=True, exist_ok=True)

    if mime == "application/vnd.google-apps.document":
        req = service.files().export_media(fileId=item_id, mimeType="text/markdown")
    else:
        req = service.files().get_media(fileId=item_id)

    with open(dest_path, "wb") as f:
        downloader = MediaIoBaseDownload(f, req)
        done = False
        while not done:
            _, done = downloader.next_chunk()

    if dest_path.name.endswith(".md"):
        sanitize_markdown(dest_path)

def load_state():
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"files": {}}

def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def main():
    print(f"Connecting to Google Drive (Root Folder: {ROOT_FOLDER_ID})...")
    service = get_drive_service()

    print("Scanning Google Drive structure...")
    drive_files = scan_drive_recursive(service, ROOT_FOLDER_ID)
    print(f"Found {len(drive_files)} files on Google Drive.")

    state = load_state()
    tracked_files = state.setdefault("files", {})

    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    active_paths = set()

    to_download = []
    skipped_count = 0

    for rel_path, item_id, mime, original_name, modified_time in drive_files:
        dest_path = DOCS_DIR / rel_path
        active_paths.add(dest_path)

        cached_info = tracked_files.get(rel_path, {})
        cached_mod = cached_info.get("modifiedTime")

        # Skip download if local file exists and Drive modifiedTime hasn't changed
        if dest_path.exists() and cached_mod == modified_time:
            skipped_count += 1
            continue

        to_download.append((rel_path, item_id, mime, modified_time, dest_path))

    if to_download:
        print(f"\n⚡ Downloading {len(to_download)} changed/new file(s)...")
        for rel_path, item_id, mime, modified_time, dest_path in to_download:
            action = "Updating" if dest_path.exists() else "Pulling new"
            print(f"⬇️  [{action}] {rel_path}")
            export_file(service, item_id, mime, dest_path)
            tracked_files[rel_path] = {
                "id": item_id,
                "modifiedTime": modified_time,
                "mimeType": mime
            }
    else:
        print("\n✨ All files are already up-to-date! No downloads needed.")

    # Clean local files in docs/ that were removed on Drive
    deleted_count = 0
    for root, _, files in os.walk(DOCS_DIR):
        for f in files:
            p = Path(root) / f
            if p not in active_paths:
                rel_p = str(p.relative_to(DOCS_DIR))
                print(f"🗑️  Removing deleted file: {rel_p}")
                try:
                    p.unlink()
                    tracked_files.pop(rel_p, None)
                    deleted_count += 1
                except Exception as e:
                    print(f"Error removing {p}: {e}")

    # Remove any state entries no longer on Drive
    for tracked_rel in list(tracked_files.keys()):
        if (DOCS_DIR / tracked_rel) not in active_paths:
            tracked_files.pop(tracked_rel, None)

    # Clean empty directories
    for root, dirs, files in os.walk(DOCS_DIR, topdown=False):
        if not files and not dirs and Path(root) != DOCS_DIR:
            try:
                os.rmdir(root)
            except Exception:
                pass

    save_state(state)
    print(f"\n📊 Summary: {skipped_count} unchanged (skipped), {len(to_download)} downloaded, {deleted_count} deleted.")
    print("✅ Incremental Google Drive sync completed!")

if __name__ == "__main__":
    main()
