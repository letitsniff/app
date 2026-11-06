"""
Path mapper between Google Drive and Local Git repository.
Google Drive and Local Git repository share the exact same 1:1 nested structure:
blog/[Macro Category]/[Pillar]/[Article].md
"""

def map_drive_rel_to_local_rel(rel_path: str) -> str:
    """Returns local relative path (1:1 with Drive path)."""
    return str(rel_path).replace("\\", "/")

def map_local_rel_to_drive_rel(rel_path: str) -> str:
    """Returns Drive relative path (1:1 with local path)."""
    return str(rel_path).replace("\\", "/")
