#!/usr/bin/env python3
"""
Manual one-shot sync trigger for Let It Sniff.
Delegates to .sync/sync_daemon.py using .sync/drive_state.json.
"""

import sys
from pathlib import Path

WORKSPACE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_DIR))
sys.path.insert(0, str(WORKSPACE_DIR / ".sync"))

from sync_daemon import sync_from_drive
from scripts.sync_images_to_drive import sync_images

def main():
    pull_only = "--pull-only" in sys.argv
    push_only = "--push-only" in sys.argv

    if not pull_only:
        print("⬆️  Syncing images to Google Drive...")
        sync_images(verbose=True)

    if not push_only:
        print("⬇️  Syncing articles from Google Drive...")
        sync_from_drive()

    print("✅ Sync complete.")

if __name__ == "__main__":
    main()
