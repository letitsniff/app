#!/usr/bin/env python3
"""
Sync Docs/Print PDFs & Collateral -> Google Drive
-------------------------------------------------
Uploads all collateral PDFs and README from docs/print/ to the 'print'
folder on Google Drive, tracking their IDs and hashes in .sync/drive_state.json.
"""

import os
import sys
import json
import subprocess
import hashlib
import re
from pathlib import Path

WORKSPACE_DIR = Path(__file__).resolve().parent.parent
DOCS_PRINT_DIR = WORKSPACE_DIR / "docs" / "print"
STATE_FILE = WORKSPACE_DIR / ".sync" / "drive_state.json"
ROOT_FOLDER_ID = "1oNgHqLRswU0GSE9e8XFTyf9j-dGlotbi"

sys.path.insert(0, str(WORKSPACE_DIR))
sys.path.insert(0, str(WORKSPACE_DIR / "scripts"))
from sync_images_to_drive import run_gdrive, list_folder_json, get_or_create_folder


def get_file_hash(path: Path) -> str:
    """Compute SHA256 hash of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def sync_print_to_drive(verbose=True):
    if not DOCS_PRINT_DIR.exists():
        if verbose:
            print(f"⚠️ Directory {DOCS_PRINT_DIR} does not exist. Nothing to sync.")
        return 0

    local_files = sorted([f for f in DOCS_PRINT_DIR.iterdir() if f.is_file()])
    if not local_files:
        if verbose:
            print("⚠️ No print files found in docs/print/.")
        return 0

    print_folder_id = get_or_create_folder("print", ROOT_FOLDER_ID, verbose=verbose)
    if not print_folder_id:
        print("❌ Error: Could not resolve or create 'print' folder on Google Drive.", file=sys.stderr)
        return 0

    state = {}
    if STATE_FILE.exists():
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            state = json.load(f)

    tracked_files = state.setdefault("files", {})

    # Fetch live files from Google Drive print folder
    drive_items = list_folder_json(print_folder_id)
    drive_name_to_info = {it.get("name"): it for it in drive_items if it.get("name")}

    uploaded_count = 0
    updated_count = 0
    unchanged_count = 0

    for local_file in local_files:
        fname = local_file.name
        rel_key = f"print/{fname}"
        file_hash = get_file_hash(local_file)

        existing_drive_info = drive_name_to_info.get(fname)
        tracked_info = tracked_files.get(rel_key)

        file_id = None
        if existing_drive_info:
            file_id = existing_drive_info.get("id")
        elif tracked_info:
            file_id = tracked_info.get("id")

        if file_id:
            # Check if updated
            if tracked_info and tracked_info.get("contentHash") == file_hash:
                unchanged_count += 1
                continue

            # Update existing file on Drive in-place
            if verbose:
                print(f"  🔄 Updating: {fname} on Drive (ID: {file_id})...", end=" ", flush=True)

            mime_type = "application/pdf" if local_file.suffix == ".pdf" else "text/markdown"
            res = run_gdrive("mutate", "update", file_id, str(local_file), "--mime-type", mime_type)
            if res.returncode != 0:
                print(f"❌ Error: {res.stderr.strip()}", file=sys.stderr)
                continue

            tracked_files[rel_key] = {
                "id": file_id,
                "contentHash": file_hash,
                "mimeType": mime_type,
                "modifiedTime": (existing_drive_info or {}).get("modifiedTime") or (tracked_info or {}).get("modifiedTime"),
            }
            updated_count += 1
            print("✅ Done")
        else:
            # Upload new file to Drive
            if verbose:
                print(f"  ⬆️  Uploading: {fname} -> Drive print folder...", end=" ", flush=True)

            mime_type = "application/pdf" if local_file.suffix == ".pdf" else "text/markdown"
            res = run_gdrive("mutate", "upload", str(local_file), "--parent", print_folder_id, "--mime-type", mime_type)
            if res.returncode != 0:
                print(f"❌ Error: {res.stderr.strip()}", file=sys.stderr)
                continue

            # Parse ID from output: "Uploaded file: <name> (ID: <id>)"
            m = re.search(r"ID:\s*([a-zA-Z0-9_-]+)", res.stdout)
            new_id = m.group(1) if m else None

            if not new_id:
                # Fallback: re-query folder
                time.sleep(1)
                refreshed = list_folder_json(print_folder_id)
                for it in refreshed:
                    if it.get("name") == fname:
                        new_id = it.get("id")
                        break

            if new_id:
                tracked_files[rel_key] = {
                    "id": new_id,
                    "contentHash": file_hash,
                    "mimeType": mime_type,
                    "modifiedTime": (existing_drive_info or {}).get("modifiedTime"),
                }
                uploaded_count += 1
                print(f"✅ Uploaded (ID: {new_id})")
            else:
                print("⚠️ Warning: Upload succeeded but ID could not be parsed.")

    # Save state
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

    if verbose:
        print(f"📊 Print Collateral Sync: {uploaded_count} uploaded, {updated_count} updated, {unchanged_count} unchanged on Drive.")

    return uploaded_count + updated_count


def main():
    print("🐾 Let It Sniff — Print Collateral Sync to Google Drive")
    print("-------------------------------------------------------")
    sync_print_to_drive(verbose=True)


if __name__ == "__main__":
    main()
