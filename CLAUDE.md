# Let It Sniff — Project Guide

## Overview
Website for Alex the dog trainer based in Athens, Greece. Greek-language site (bilingual-ready) with a blog article library and services section.

## Project Structure
```
letitsniff/
├── docs/
│   ├── blog/              # 18 content pillars, each with articles (Greek .md files)
│   │   └── [NN] - [Title]/
│   │       ├── 00. Εισαγωγή ... (pillar intro / category metadata)
│   │       └── [NN]. Article title.md
│   └── services/          # Service pages (.md files)
├── site/                  # Next.js app (source)
├── .sync/                 # Google Drive sync scripts
└── CLAUDE.md
```

## Site (`site/`)
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 (CSS-first config in `app/globals.css`)
- **Package manager:** pnpm
- **Deployment:** GitHub Pages (static export via `output: 'export'`)
- **Components:** lucide-react for icons

## Content Structure
- Articles live in `docs/blog/[NN] - [Category Name]/[NN]. Article.md`
- Article metadata is **inline** in the markdown body (no YAML frontmatter):
  - `**Κατηγορία:**` → category name
  - `**Προτεινόμενο URL:**` → SEO slug e.g. `/blog/my-slug`
  - `**Χρόνος ανάγνωσης:**` → reading time
- Pillar intro files (`00. Εισαγωγή...`) contain category metadata including `**Συνδεδεμένη Υπηρεσία:**`
- Services live in `docs/services/[slug].md` with inline metadata (no YAML frontmatter)

## Content Paths (from site/)
- Blog: `../docs/blog/`
- Services: `../docs/services/`

## URL Structure
- `/` — Homepage
- `/blog` — All articles grouped by category
- `/blog/[slug]` — Individual article
- `/ypiresies` — Services index
- `/ypiresies/[slug]` — Individual service page
- `/o-alexandros` — About Alex

## Services (slugs)
- `astiki-symviosi-ypakoi` — Αστική Συμβίωση & Υπακοή
- `antimetopisi-provlimaton-symperiforas` — Αντιμετώπιση Προβλημάτων Συμπεριφοράς
- `ekpaidefsi-koutaviou` — Εκπαίδευση Κουταβιού
- `yiothesia-kai-proti-prosarmogi` — Υιοθεσία & Πρώτη Προσαρμογή

## Dev Commands
```bash
cd site
pnpm dev        # development server
pnpm build      # static export → out/
pnpm lint       # ESLint
```
