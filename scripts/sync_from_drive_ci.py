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

def get_or_create_folder_ci(service, name, parent_id):
    items = list_folder_contents(service, parent_id)
    for it in items:
        if it.get("name") == name and it.get("mimeType") == "application/vnd.google-apps.folder":
            return it.get("id")
    folder_metadata = {
        "name": name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_id]
    }
    folder = service.files().create(body=folder_metadata, fields="id").execute()
    return folder.get("id")

def resolve_drive_folder_ci(service, rel_dir):
    parts = Path(rel_dir).parts
    current_id = ROOT_FOLDER_ID
    for part in parts:
        current_id = get_or_create_folder_ci(service, part, current_id)
        if not current_id:
            return None
    return current_id

def upload_local_images_to_drive(service):
    """
    Finds any local images in docs/blog/**/images/* and uploads
    any missing images to Google Drive.
    """
    from googleapiclient.http import MediaFileUpload

    local_blog_dir = DOCS_DIR / "blog"
    if not local_blog_dir.exists():
        return

    uploaded_count = 0

    for images_dir in sorted(local_blog_dir.glob("**/images")):
        rel_dir = str(images_dir.relative_to(DOCS_DIR))
        images_folder_id = resolve_drive_folder_ci(service, rel_dir)
        if not images_folder_id:
            continue

        drive_images = {}
        for it in list_folder_contents(service, images_folder_id):
            name = it.get("name")
            if not name:
                continue
            if name in drive_images:
                curr = drive_images[name]
                if (it.get("modifiedTime", ""), it.get("id", "")) <= (curr.get("modifiedTime", ""), curr.get("id", "")):
                    continue
            drive_images[name] = it

        for img_path in sorted(images_dir.iterdir()):
            if not img_path.is_file():
                continue
            if img_path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".svg", ".avif"}:
                continue

            if img_path.name not in drive_images:
                print(f"⬆️  [SYNC -> DRIVE] Uploading image: {rel_dir}/{img_path.name}")
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

sys.path.insert(0, str(WORKSPACE_DIR / ".sync"))
from path_mapper import map_drive_rel_to_local_rel, map_local_rel_to_drive_rel

def reconcile_drive_names(service):
    """Renames any old terms ('θετική εκπαίδευση', 'sniffari') on Google Drive to match new repo standard."""
    renames = [
        ("01 - Επιστήμη, Θετική Εκπαίδευση & Κατάρριψη Μύθων", "01 - Επιστήμη, Σύγχρονη Εκπαίδευση & Κατάρριψη Μύθων"),
        ("01. Θετική εκπαίδευση με σαφή όρια", "01. Εκπαίδευση χωρίς καταναγκασμό με σαφή όρια"),
        ("01. Θετική εκπαίδευση με σαφή όρια.md", "01. Εκπαίδευση χωρίς καταναγκασμό με σαφή όρια.md"),
        ("03. Θετική εκπαίδευση φίμωτρου", "03. Εκπαίδευση φίμωτρου χωρίς πίεση"),
        ("03. Θετική εκπαίδευση φίμωτρου.md", "03. Εκπαίδευση φίμωτρου χωρίς πίεση.md"),
        ("01. Τι είναι το Sniffari και πώς η όσφρηση εμπλουτίζει τη βόλτα του σκύλου", "01. Βόλτα όσφρησης και πώς εμπλουτίζει τη βόλτα του σκύλου"),
        ("01. Τι είναι το Sniffari και πώς η όσφρηση εμπλουτίζει τη βόλτα του σκύλου.md", "01. Βόλτα όσφρησης και πώς εμπλουτίζει τη βόλτα του σκύλου.md"),
        ("p01_01_sniffari.jpg", "p01_01_volta_osfrisis.jpg"),
        ("001 - Τι είναι το Sniffari και πώς η όσφρηση εμπλουτίζει τη βόλτα του σκύλου", "001 - Βόλτα όσφρησης και πώς εμπλουτίζει τη βόλτα του σκύλου"),
        ("081 - Τι είναι η Θετική Εκπαίδευση Σκύλων (και γιατί ΔΕΝ σημαίνει «αφήνω τον σκύλο ασ", "081 - Τι είναι η Εκπαίδευση Χωρίς Καταναγκασμό (και γιατί ΔΕΝ σημαίνει «αφήνω τον σκύλο ασ"),
        ("089 - Εκπαίδευση φίμωτρου με θετικό τρόπο Ένα χρήσιμο εργαλείο ασφάλειας", "089 - Εκπαίδευση φίμωτρου χωρίς πίεση Ένα χρήσιμο εργαλείο ασφάλειας"),
    ]
    for old_name, new_name in renames:
        escaped_old = old_name.replace("'", "\\'")
        query = f"name = '{escaped_old}' and trashed = false"
        try:
            res = service.files().list(q=query, fields="files(id, name)").execute()
            for f in res.get("files", []):
                try:
                    service.files().update(fileId=f["id"], body={"name": new_name}).execute()
                    print(f"🔄 Renamed on Google Drive: '{old_name}' -> '{new_name}' (ID: {f['id']})")
                except Exception as e:
                    print(f"⚠️ Could not rename '{old_name}' on Drive: {e}")
        except Exception as e:
            print(f"⚠️ Error querying '{old_name}' on Drive: {e}")

def main():
    print(f"Connecting to Google Drive (Root Folder: {ROOT_FOLDER_ID})...")
    service = get_drive_service()

    # Step 0: Reconcile any old names on Drive
    print("Reconciling Drive names with repo standard...")
    try:
        reconcile_drive_names(service)
    except Exception as e:
        print(f"⚠️ Drive name reconciliation encountered an error: {e}")

    # Step 1: Upload any newly committed / local images to Google Drive
    print("Checking for local images to sync to Google Drive...")
    try:
        upload_local_images_to_drive(service)
    except Exception as e:
        print(f"⚠️  Image upload check encountered an error: {e}")

    # Step 2: Scan Drive tree and incrementally pull modified files
    print("Scanning Google Drive structure...")
    raw_drive_files = scan_drive_recursive(service, ROOT_FOLDER_ID)
    print(f"Found {len(raw_drive_files)} files on Google Drive.")

    # Deduplicate files sharing the same relative path by keeping the newest modifiedTime
    deduped_files = {}
    for rel_path, item_id, mime, original_name, modified_time in raw_drive_files:
        if rel_path in deduped_files:
            _, _, _, _, existing_mod, existing_id = deduped_files[rel_path]
            if (modified_time, item_id) <= (existing_mod, existing_id):
                continue
        deduped_files[rel_path] = (rel_path, item_id, mime, original_name, modified_time, item_id)

    drive_files = [
        (rel, i_id, mime, orig, mtime)
        for rel, i_id, mime, orig, mtime, _ in deduped_files.values()
    ]
    if len(drive_files) < len(raw_drive_files):
        print(f"Deduplicated to {len(drive_files)} unique relative paths.")

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

    # Clean local files in docs/ that were removed on Drive (NEVER remove images, index.md, site copy, or print collateral)
    deleted_count = 0
    for root, _, files in os.walk(DOCS_DIR):
        for f in files:
            p = Path(root) / f
            if "images" in p.parts or p.name == "index.md" or "site" in p.parts or "print" in p.parts:
                continue  # Never delete images, index.md, site copy, or print collateral!
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
        if (DOCS_DIR / tracked_rel) not in active_paths and "images" not in tracked_rel and not tracked_rel.startswith("site/") and not tracked_rel.startswith("print/"):
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
