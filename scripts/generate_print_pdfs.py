#!/usr/bin/env python3
"""
Let It Sniff — Print PDF Generation Script
-------------------------------------------
Renders all collateral materials (Business Card, Trifold Brochure, Flyer A5,
Brand Stickers) from vector HTML/SVG sources into production-ready PDFs.
Outputs all generated PDFs into `docs/print/`.
"""

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

# Directories
PROJECT_ROOT = Path(__file__).resolve().parent.parent
PRINT_SRC_DIR = PROJECT_ROOT / "print"
OUTPUT_DIR = PROJECT_ROOT / "docs" / "print"


def find_chrome_binary():
    """Locate Google Chrome or Chromium executable on the host system."""
    candidates = [
        "google-chrome",
        "google-chrome-stable",
        "/home/vasilis/.local/bin/google-chrome",
        "chromium",
        "chromium-browser",
        "/snap/bin/chromium",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "chrome",
    ]
    for candidate in candidates:
        found = shutil.which(candidate)
        if found and os.access(found, os.X_OK):
            return found
        if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
            return candidate
    return None


def render_html_to_pdf(chrome_bin, html_path, output_pdf_path):
    """Render an HTML file to PDF using headless Chrome."""
    file_url = f"file://{html_path.resolve()}"
    cmd = [
        chrome_bin,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={output_pdf_path.resolve()}",
        file_url,
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Chrome failed to render {html_path}:\n{result.stderr}")
    if not output_pdf_path.is_file():
        raise RuntimeError(f"Expected output PDF was not created: {output_pdf_path}")


def create_sticker_single_html(svg_path, size_mm, width_mm=None, height_mm=None):
    """Generate temporary HTML wrapper to render an individual sticker at exact millimetric cut size."""
    w = width_mm or size_mm
    h = height_mm or size_mm
    return f"""<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="utf-8">
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      width: {w}mm;
      height: {h}mm;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      overflow: hidden;
    }}
    img {{
      width: {w}mm;
      height: {h}mm;
      display: block;
      object-fit: contain;
    }}
    @page {{
      size: {w}mm {h}mm;
      margin: 0;
    }}
  </style>
</head>
<body>
  <img src="file://{svg_path.resolve()}" alt="Sticker">
</body>
</html>"""


def get_file_size_display(path: Path) -> str:
    """Format file size in KB or MB."""
    bytes_size = path.stat().st_size
    if bytes_size >= 1024 * 1024:
        return f"{bytes_size / (1024 * 1024):.2f} MB"
    return f"{bytes_size / 1024:.1f} KB"


def main():
    print("🐾 [Let It Sniff] Starting Print Collateral PDF Generation...")

    chrome_bin = find_chrome_binary()
    if not chrome_bin:
        print("❌ Error: No Chrome or Chromium binary found on this system.", file=sys.stderr)
        print("Please install google-chrome or chromium.", file=sys.stderr)
        sys.exit(1)

    print(f"✓ Using Browser Engine: {chrome_bin}")

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"✓ Output Directory: {OUTPUT_DIR.relative_to(PROJECT_ROOT)}/")

    items = [
        {
            "name": "Business Card (85x55mm, 2-sided)",
            "src": PRINT_SRC_DIR / "business-card" / "index.html",
            "out": OUTPUT_DIR / "letitsniff_business_card.pdf",
            "type": "html",
        },
        {
            "name": "Trifold Brochure (A4 Landscape, 6 panels)",
            "src": PRINT_SRC_DIR / "brochure" / "index.html",
            "out": OUTPUT_DIR / "letitsniff_brochure_trifold.pdf",
            "type": "html",
        },
        {
            "name": "Flyer A5 (148x210mm, 2-sided)",
            "src": PRINT_SRC_DIR / "flyer" / "index.html",
            "out": OUTPUT_DIR / "letitsniff_flyer_a5.pdf",
            "type": "html",
        },
        {
            "name": "Stickers Sheet (A4 Multi-up)",
            "src": PRINT_SRC_DIR / "stickers" / "index.html",
            "out": OUTPUT_DIR / "letitsniff_stickers_sheet_a4.pdf",
            "type": "html",
        },
        {
            "name": "Sticker: Classic Brand Round (60x60mm)",
            "src": PRINT_SRC_DIR / "stickers" / "sticker_classic_round.svg",
            "out": OUTPUT_DIR / "letitsniff_sticker_classic_round.pdf",
            "type": "sticker",
            "size_mm": 60,
        },
        {
            "name": "Sticker: Statement Round (60x60mm)",
            "src": PRINT_SRC_DIR / "stickers" / "sticker_statement_round.svg",
            "out": OUTPUT_DIR / "letitsniff_sticker_statement_round.pdf",
            "type": "sticker",
            "size_mm": 60,
        },
        {
            "name": "Sticker: Die-Cut Muzzle Silhouette (70x54mm)",
            "src": PRINT_SRC_DIR / "stickers" / "sticker_diecut_muzzle.svg",
            "out": OUTPUT_DIR / "letitsniff_sticker_diecut_muzzle.pdf",
            "type": "sticker_rect",
            "width_mm": 70,
            "height_mm": 54,
        },
    ]

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_dir_path = Path(tmpdir)
        for item in items:
            out_file = item["out"]
            print(f"  Rendering: {item['name']}...", end=" ", flush=True)

            if item["type"] == "html":
                render_html_to_pdf(chrome_bin, item["src"], out_file)
            elif item["type"] == "sticker":
                tmp_html = tmp_dir_path / f"{item['out'].stem}.html"
                tmp_html.write_text(create_sticker_single_html(item["src"], item["size_mm"]), encoding="utf-8")
                render_html_to_pdf(chrome_bin, tmp_html, out_file)
            elif item["type"] == "sticker_rect":
                tmp_html = tmp_dir_path / f"{item['out'].stem}.html"
                tmp_html.write_text(create_sticker_single_html(item["src"], 60, item["width_mm"], item["height_mm"]), encoding="utf-8")
                render_html_to_pdf(chrome_bin, tmp_html, out_file)

            size_str = get_file_size_display(out_file)
            print(f"✓ Done ({size_str}) -> {out_file.name}")

    # Generate a descriptive README in docs/print/
    readme_path = OUTPUT_DIR / "README.md"
    readme_content = """# 🐾 Έντυπο Υλικό Let It Sniff (Εκτυπώσιμα PDF)

Σε αυτόν τον φάκελο βρίσκονται όλα τα έτοιμα, εκτυπώσιμα PDF αρχεία υψηλής ανάλυσης για τον **Αλέξανδρο Τσιόλη (Let It Sniff)**:

## 📄 Διαθέσιμα Αρχεία PDF

1. **`letitsniff_business_card.pdf`**
   - **Είδος:** Επαγγελματική Κάρτα (Διπλής Όψης)
   - **Διαστάσεις:** 85 × 55 mm
   - **Χαρτί:** 350gsm Velvet ή άκοπο Kraft/ματ
   - **Περιεχόμενο:** Εμπρός: Logo, Αλέξανδρος Τσιόλης, Εκπαίδευση Χωρίς Καταναγκασμό. Πίσω: 4 βασικοί τομείς, QR code, επικοινωνία.

2. **`letitsniff_brochure_trifold.pdf`**
   - **Είδος:** Ενημερωτικό Τρίπτυχο Brochure (6 Πάνελ DL)
   - **Διαστάσεις:** A4 Ανοιχτό (297 × 210 mm landscape) με 2 διπλώματα
   - **Χαρτί:** 170–200gsm Velvet
   - **Περιεχόμενο:** Ανάλυση φιλοσοφίας «Χωρίς Καταναγκασμό», τα 4 προγράμματα εκπαίδευσης, βήματα συνεργασίας, QR code βιβλιοθήκης.

3. **`letitsniff_flyer_a5.pdf`**
   - **Είδος:** Διαφημιστικό Φυλλάδιο A5 (Διπλής Όψης)
   - **Διαστάσεις:** A5 (148 × 210 mm portrait)
   - **Χαρτί:** 150–170gsm Velvet / Ματ
   - **Περιεχόμενο:** Εμπρός: Checklist προκλήσεων βόλτας/διαμερίσματος. Πίσω: Grid 4 υπηρεσιών, QR code και κουτί επικοινωνίας.

4. **`letitsniff_stickers_sheet_a4.pdf`**
   - **Είδος:** Φύλλο Αυτοκολλήτων A4 (Multi-up)
   - **Χαρτί:** Αυτοκόλλητο χαρτί ή βινύλιο A4

5. **Ανεξάρτητα Διανυσματικά Αυτοκόλλητα (Μεμονωμένα PDF):**
   - `letitsniff_sticker_classic_round.pdf` (Στρογγυλό 60×60mm)
   - `letitsniff_sticker_statement_round.pdf` (Στρογγυλό 60×60mm «Άφησέ τον να μυρίσει»)
   - `letitsniff_sticker_diecut_muzzle.pdf` (Κοπτικό περιμετρικό 70×54mm)

---

## 🛠️ Επανέκδοση των PDF
Για να αναδημιουργήσετε τα PDF ανά πάσα στιγμή:
```bash
python3 scripts/generate_print_pdfs.py
```
ή από τον φάκελο `site/`:
```bash
pnpm print:pdf
```
"""
    readme_path.write_text(readme_content, encoding="utf-8")
    print(f"✓ Updated README at {readme_path.relative_to(PROJECT_ROOT)}")
    print("\n✨ All collateral PDFs have been successfully generated into docs/print/!")


if __name__ == "__main__":
    main()
