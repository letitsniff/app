#!/usr/bin/env python3
"""
CI Google Drive <-> docs/ Sync Script
- Incremental Sync: Pulls docs/articles from Google Drive to repo.
- Image Sync: Uploads local images in docs/blog/*/images/* to Google Drive.
- Strictly protects articles on Google Drive (Docs -> Repo only).
"""

import os
import sys
import json
import re
from pathlib import Path

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
            scopes=["https://www.googleapis.com/auth/drive"]
        )
    elif (WORKSPACE_DIR / "service_account.json").exists():
        creds = service_account.Credentials.from_service_account_file(
            str(WORKSPACE_DIR / "service_account.json"),
            scopes=["https://www.googleapis.com/auth/drive"]
        )
    else:
        sys.exit("❌ Error: GDRIVE_SERVICE_ACCOUNT_KEY secret is not set.")

    return build("drive", "v3", credentials=creds)

def get_shared_images_map():
    """Builds a lookup of {drive_file_id: filename} for all images in the shared folders."""
    if not STATE_FILE.exists():
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
    if not os.path.exists(filepath):
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

def list_folder_contents(service, folder_id):
    """Lists all non-trashed items inside a given folder ID."""
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
    import io

    dest_path.parent.mkdir(parents=True, exist_ok=True)

    if mime == "application/vnd.google-apps.document":
        req = service.files().export_media(fileId=item_id, mimeType="text/markdown")
    else:
        req = service.files().get_media(fileId=item_id)

    with open(dest_path, "wb") as f:
        downloader = MediaIoBaseDownload(f, req)
        done = False
        while not done:
            status, done = downloader.next_chunk()

    if dest_path.name.endswith(".md"):
        sanitize_markdown(dest_path)

def upload_local_images_to_drive(service):
    """
    Finds any local images in docs/blog/*/images/* and uploads
    any missing images to Google Drive.
    """
    from googleapiclient.http import MediaFileUpload

    local_blog_dir = DOCS_DIR / "blog"
    if not local_blog_dir.exists():
        return

    # 1. Locate blog folder on Drive
    root_items = list_folder_contents(service, ROOT_FOLDER_ID)
    blog_folder = next((it for it in root_items if it.get("name") == "blog" and it.get("mimeType") == "application/vnd.google-apps.folder"), None)
    if not blog_folder:
        return

    # 2. Get pillars on Drive
    drive_pillars = {it.get("name"): it.get("id") for it in list_folder_contents(service, blog_folder["id"]) if it.get("mimeType") == "application/vnd.google-apps.folder"}

    uploaded_count = 0

    for images_dir in sorted(local_blog_dir.glob("**/images")):
        pillar_dir = images_dir.parent
        pillar_name = pillar_dir.name
        pillar_id = drive_pillars.get(pillar_name)
        if not pillar_id:
            for d_name, d_id in drive_pillars.items():
                if d_name.startswith(pillar_name[:2]):
                    pillar_id = d_id
                    break
        if not pillar_id:
            continue

        # Check or create 'images' folder on Drive
        pillar_items = list_folder_contents(service, pillar_id)
        images_folder = next((it for it in pillar_items if it.get("name") == "images" and it.get("mimeType") == "application/vnd.google-apps.folder"), None)
        if not images_folder:
            print(f"📁 Creating 'images' folder in Drive pillar: {pillar_name}")
            folder_metadata = {
                "name": "images",
                "mimeType": "application/vnd.google-apps.folder",
                "parents": [pillar_id]
            }
            images_folder = service.files().create(body=folder_metadata, fields="id").execute()

        images_folder_id = images_folder.get("id")
        drive_images = {it.get("name"): it for it in list_folder_contents(service, images_folder_id)}

        for img_path in sorted(images_dir.iterdir()):
            if not img_path.is_file():
                continue
            if img_path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".svg", ".avif"}:
                continue

            if img_path.name not in drive_images:
                print(f"⬆️  [SYNC -> DRIVE] Uploading image: {pillar_name}/images/{img_path.name}")
                mimetype = "image/png" if img_path.suffix.lower() == ".png" else "image/jpeg"
                file_metadata = {
                    "name": img_path.name,
                    "parents": [images_folder_id]
                }
                media = MediaFileUpload(str(img_path), mimetype=mimetype, resumable=True)
                service.files().create(body=file_metadata, media_body=media, fields="id").execute()
                uploaded_count += 1

    if uploaded_count > 0:
        print(f"🖼️  Uploaded {uploaded_count} local image(s) to Google Drive.")

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

MACRO_CATEGORIES_MAP = {
    1: "01 - Αστική Ζωή & Καθημερινότητα",
    2: "01 - Αστική Ζωή & Καθημερινότητα",
    8: "01 - Αστική Ζωή & Καθημερινότητα",
    17: "01 - Αστική Ζωή & Καθημερινότητα",
    3: "02 - Συμπεριφορά, Επικοινωνία & Ψυχολογία",
    10: "02 - Συμπεριφορά, Επικοινωνία & Ψυχολογία",
    12: "02 - Συμπεριφορά, Επικοινωνία & Ψυχολογία",
    13: "02 - Συμπεριφορά, Επικοινωνία & Ψυχολογία",
    18: "02 - Συμπεριφορά, Επικοινωνία & Ψυχολογία",
    4: "03 - Στάδια Ζωής & Υιοθεσία",
    9: "03 - Στάδια Ζωής & Υιοθεσία",
    11: "03 - Στάδια Ζωής & Υιοθεσία",
    14: "03 - Στάδια Ζωής & Υιοθεσία",
    15: "03 - Στάδια Ζωής & Υιοθεσία",
    5: "04 - Εκπαίδευση, Φροντίδα & Εξοπλισμός",
    6: "04 - Εκπαίδευση, Φροντίδα & Εξοπλισμός",
    7: "04 - Εκπαίδευση, Φροντίδα & Εξοπλισμός",
    16: "04 - Εκπαίδευση, Φροντίδα & Εξοπλισμός",
}

def map_drive_rel_to_local_rel(rel_path):
    parts = Path(rel_path).parts
    if len(parts) >= 2 and parts[0] == "blog":
        m = re.match(r"^(\d{2})\s+-", parts[1])
        if m:
            num = int(m.group(1))
            if num in MACRO_CATEGORIES_MAP:
                macro_dir = MACRO_CATEGORIES_MAP[num]
                if parts[1] != macro_dir:
                    return str(Path("blog") / macro_dir / Path(*parts[1:]))
    return rel_path

def main():
    print(f"Connecting to Google Drive (Root Folder: {ROOT_FOLDER_ID})...")
    service = get_drive_service()

    # Step 1: Upload any newly committed / local images to Google Drive
    print("Checking for local images to sync to Google Drive...")
    try:
        upload_local_images_to_drive(service)
    except Exception as e:
        print(f"⚠️  Image upload check encountered an error: {e}")

    # Step 2: Scan Drive tree and incrementally pull modified files
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
        local_rel = map_drive_rel_to_local_rel(rel_path)
        dest_path = DOCS_DIR / local_rel
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
            print(f"⬇️  [{action}] {rel_path} -> {dest_path.relative_to(DOCS_DIR)}")
            export_file(service, item_id, mime, dest_path)
            tracked_files[rel_path] = {
                "id": item_id,
                "modifiedTime": modified_time,
                "mimeType": mime
            }
    else:
        print("\n✨ All files are already up-to-date! No downloads needed.")

    # Clean local files in docs/ that were removed on Drive (NEVER remove images or index.md)
    deleted_count = 0
    for root, _, files in os.walk(DOCS_DIR):
        for f in files:
            p = Path(root) / f
            if "images" in p.parts or p.name == "index.md":
                continue  # Never delete images or index.md!
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
        if (DOCS_DIR / tracked_rel) not in active_paths and "images" not in tracked_rel:
            tracked_files.pop(tracked_rel, None)

    # Clean empty directories
    for root, dirs, files in os.walk(DOCS_DIR, topdown=False):
        if not files and not dirs and Path(root) != DOCS_DIR:
            try:
                Path(root).rmdir()
            except Exception:
                pass

    save_state(state)
    print(f"\n📊 Summary: {skipped_count} unchanged (skipped), {len(to_download)} downloaded, {deleted_count} deleted.")
    print("✅ Google Drive sync completed!")

if __name__ == "__main__":
    main()
