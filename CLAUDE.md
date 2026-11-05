# Let It Sniff — Project Guide

## Overview
Website for Alex the dog trainer based in Athens, Greece. Greek-language site (bilingual-ready) with a blog article library and services section.
- **Production URL:** `https://letitsniff.gr` (and `https://www.letitsniff.gr`)
- **Hosting:** GitHub Pages (`output: 'export'`)
- **Repository:** `letitsniff/app` (Branch: `main`)

## Project Structure
```
letitsniff/
├── docs/
│   ├── blog/              # 18 content pillars, each with articles (Greek .md files)
│   │   └── [NN] - [Title]/
│   │       ├── 00. Εισαγωγή ... (pillar intro / category metadata)
│   │       ├── [NN]. Article title.md
│   │       └── images/    # Local article & cover images
│   └── services/          # Service pages (.md files with inline metadata)
├── site/                  # Next.js app (source)
│   ├── app/               # Next.js App Router pages
│   ├── components/        # UI components
│   ├── lib/               # Content loaders & metadata parsers
│   └── public/            # Static assets & synced images
├── scripts/               # CI automation scripts
│   └── sync_from_drive_ci.py  # Incremental Drive -> docs/ sync
├── .sync/                 # Sync metadata and local daemon
│   ├── drive_state.json   # Incremental sync cache for CI
│   ├── sync_daemon.py     # Local background one-way sync daemon
│   └── sync.py            # Local manual sync script
├── .github/workflows/
│   ├── sync-from-drive.yml # Hourly & webhook sync from Drive
│   └── deploy.yml         # Next.js build & GitHub Pages deploy
└── CLAUDE.md
```

## Site (`site/`)
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 (CSS-first config in `app/globals.css`)
- **Package manager:** pnpm
- **Deployment:** GitHub Pages (static export via `output: 'export'`)
- **URL Handling:** `trailingSlash: true` in `next.config.ts` (ensures `folder/index.html` structure for static hosting)
- **Images:** `images.unoptimized: true`

## Content Structure & Rules
- **Strictly No YAML Frontmatter:** Never use `---` frontmatter blocks. All metadata must be inline markdown.
- Articles live in `docs/blog/[NN] - [Category Name]/[NN]. Article.md`.
- Inline article metadata format:
  - `**Κατηγορία:**` → category name
  - `**Προτεινόμενο URL:**` → SEO slug e.g. `/blog/my-slug`
  - `**Χρόνος ανάγνωσης:**` → reading time e.g. `3 λεπτά`
- Pillar intro files (`00. Εισαγωγή...`) contain category metadata:
  - `**Συνδεδεμένη Υπηρεσία:**` → e.g. `/ypiresies/astiki-symviosi-ypakoi`
  - `**Εισαγωγή:**` → short category summary
- Services live in `docs/services/[slug].md` with inline metadata:
  - `**Τίτλος:**`, `**Υπότιτλος:**`, `**Tagline:**`, `**Εικονίδιο:**`, `**Σειρά:**`

## Google Drive Synchronization Architecture
Synchronization is **strictly one-way** (Google Drive / Google Docs ➔ GitHub Repository `docs/` ➔ Live Site). Changes are never pushed from git to Google Drive.
- **Root Folder ID:** `1oNgHqLRswU0GSE9e8XFTyf9j-dGlotbi` (`letitsniff.gr - Πυλώνες Περιεχομένου`)
- **CI Sync Workflow (`.github/workflows/sync-from-drive.yml`):**
  - **Triggers:**
    - Schedule: runs hourly (`cron: '0 * * * *'`).
    - Webhook: `repository_dispatch: [sync-drive]` (triggered by Alex's 1-click button in Google Docs).
    - Manual: `workflow_dispatch`.
  - **Incremental Sync (`scripts/sync_from_drive_ci.py`):**
    - Checks Drive `modifiedTime` against `.sync/drive_state.json`.
    - Only downloads/exports files that were newly added or modified on Drive.
    - If no files changed, finishes in ~4 seconds and skips committing/deploying.
    - Automatically cleans deleted files and empty folders.
    - Sanitizes markdown exports by removing inline base64 image strings.
    - When changes are detected: commits changes, pushes to `main`, and dispatches `.github/workflows/deploy.yml`.
- **Local Sync Daemon (`.sync/sync_daemon.py`):**
  - Runs locally for development sync if needed.
  - Strictly one-way (Drive ➔ `docs/`).

## URL & Route Structure
- `/` — Homepage
- `/blog/` — All articles grouped by category
- `/blog/[slug]/` — Individual article page
- `/ypiresies/` — Services index
- `/ypiresies/[slug]/` — Individual service page
- `/o-alexandros/` — About Alex

## Dev & Operational Commands

### Development
```bash
cd site
pnpm dev        # Run local Next.js development server
pnpm build      # Test static export build (generates out/)
pnpm lint       # ESLint check
```

### Google Drive Sync & CI
```bash
# Run CI sync workflow manually via GitHub CLI
gh workflow run sync-from-drive.yml

# Check workflow runs
gh run list --workflow="sync-from-drive.yml"
gh run list --workflow="deploy.yml"

# Run local one-way sync
python3 .sync/sync.py --pull-only
```
