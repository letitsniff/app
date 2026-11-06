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
  - `**Κατηγορία:**` → complete pillar directory name, e.g. `04 - Κουτάβι στο Διαμέρισμα (Puppy Hub)`
  - `**Προτεινόμενο URL:**` → SEO slug e.g. `/blog/my-slug`
  - `**Χρόνος ανάγνωσης:**` → reading time e.g. `3 λεπτά`
- Pillar intro files (`00. Εισαγωγή...`) contain category metadata:
  - `**Συνδεδεμένη Υπηρεσία:**` → e.g. `/ypiresies/astiki-symviosi-ypakoi`
  - `**Εισαγωγή:**` → short category summary
- Services live in `docs/services/[slug].md` with inline metadata:
  - `**Τίτλος:**`, `**Υπότιτλος:**`, `**Tagline:**`, `**Εικονίδιο:**`, `**Σειρά:**`

## Creating and Fixing Blog Articles

### 1. Inspect before writing
- Read this guide, the target pillar's `00. Εισαγωγή...` index, and one or two existing articles in that pillar.
- Check `git status` and preserve existing work. Keep content tasks in `docs/blog/`; do not change the site parser just to accommodate malformed Markdown.
- Treat the pillar index as the topic and URL checklist. Compare it with actual article files before deciding what is missing. Do not assume every pillar has six articles or hard-code the library's article count.
- For a request to complete a pillar, write every missing indexed article as a full guide, not a stub, outline, or duplicate of a neighboring article.
- **Sync precaution:** Drive is an upstream, one-way source. Later Drive edits or sync reconciliation may overwrite repository edits to synced files. Do not run sync as part of article editing, alter sync state, or claim that local edits update Drive. Flag any needed upstream reconciliation to the user; writing to Drive or publishing requires explicit authorization.

### 2. Preserve identity and keep the index aligned
- Use `docs/blog/[PP] - [Category]/[AA]. [Short Greek title].md`, with two-digit pillar and article numbers. `00.` is reserved for the pillar index.
- Keep existing filenames, numbers, and URLs when correcting an article. A clearer headline does not require a new URL. Rename or change a published URL only when explicitly requested, with link and routing implications addressed.
- For a missing indexed article, use its existing number and URL exactly. For an explicitly requested new topic, add the next unused article number and a unique lowercase ASCII, hyphen-separated slug.
- Match the article headline to its index entry, apart from the zero-padded article number. If you correct a misleading headline or claim, update the index title and description too.
- The article's `**Κατηγορία:**` value must match the complete pillar directory name, including its number and ` - ` separator.
- Keep one entry per article. The index description is the preferred blog-card excerpt, so write a useful reader-facing summary rather than repeating the title or making SEO promises.

**Index entry template, inside the existing pillar index:**

```markdown
> * **1\. [Greek article title]**
>   *URL:* /blog/existing-or-approved-slug
>   *Περιγραφή:* [One concise, accurate Greek summary.]
```

- Preserve the blockquote list and the exact italic labels `*URL:*` and `*Περιγραφή:*`. Plain `URL:` / `Περιγραφή:` are not recognized by the current excerpt parser.
- Keep each title, URL, description, and metadata value on its own physical line. Do not wrap a metadata value over several lines or turn its raw URL into a Markdown link.
- Preserve the index's `**Εισαγωγή:**` and related-page metadata. Use `**Συνδεδεμένη Υπηρεσία:**` for service routes or the existing `**Συνδεδεμένη Σελίδα:**` for other pages. Multiple routes are separated by ` & `.
- The loader recognizes only `/ypiresies/[slug]` values for related-service cards; verify every referenced service exists. Do not invent service or category-page routes; confirm targets against the site and `docs/services/`.

### 3. Write a complete Greek guide
- Write natural, clear Greek for dog guardians in Athens. Use a calm, supportive voice, practical examples, and consistent terminology such as `κηδεμόνας`.
- Explain an English technical term in Greek on first use. Avoid keyword stuffing, sensational headlines, guilt, and claims about Alex's credentials or personal cases that are not documented.
- Aim for roughly 200–500 words for a focused guide, extending only when the topic needs it. Completeness matters more than word count; do not pad every article with interchangeable text.
- Include a short explanation, concrete steps, what to avoid, and relevant limits or signs that professional help is needed. If the title promises a numbered list, deliver that number of useful items.
- End with at least one relevant internal link to an existing article or one created in the same batch. Add source links where factual claims need support.
- Estimate reading time from visible body words, excluding metadata, image syntax, and URL targets: `max(2, ceil(words / 180))` minutes. Recalculate after substantial edits; do not label every article `3 λεπτά`.

**Article template, replacing every placeholder before saving:**

```markdown
# **01\. [Greek article title matching the index]**

**Κατηγορία:** 04 - Κουτάβι στο Διαμέρισμα (Puppy Hub)
**Προτεινόμενο URL:** /blog/existing-or-approved-slug
**Χρόνος ανάγνωσης:** 2 λεπτά

**Με μια ματιά (TL;DR)**

> * [Useful takeaway.]
> * [Useful takeaway.]
> * [Important qualification or safety point.]

## **[What is happening and why]**

[Topic-specific explanation without diagnosing the individual dog.]

## **[Practical steps]**

1. **[Action]:** [Explain how to do it safely.]
2. **[Action]:** [Explain when to progress, pause, or simplify.]

## **[What to avoid / When to seek help]**

[Relevant limitations, warning signs, and next steps.]

**Πηγή:** [Source title](https://example.org/verified-source)

**Διαβάστε επίσης:** [Related Greek title](/blog/verified-related-slug).
```

- The three article metadata fields must each appear exactly once, with their exact bold labels. Never add YAML frontmatter.
- Use one H1 only. The page layout renders the title and hero image; do not repeat them later in the article body.
- Use meaningful H2/H3 headings, blank lines between paragraphs, and correctly nested lists. Do not add fake separator headings such as `## \---`.
- Save UTF-8 Markdown with a final newline. Avoid unnecessary backslash escapes, raw HTML, embedded base64 images, and leftover placeholders.
- Section headings can vary with the topic. Omit the source line when there is no source being cited, never leave the example URL in a real article.

### 4. Evidence, welfare, and safety
- Use reward-based training, environmental management, gradual exposure, choice, and rest. Do not recommend pain, intimidation, forced exposure, withholding water, or deliberate panic as training.
- Distinguish possibilities from diagnoses. Body-language signals need context; reactivity does not rule out a bite, and silence or eating a treat does not prove comfort.
- Remove unsupported absolutes from titles, summaries, and body text together. Examples: fixed sniffing-versus-running equivalences, guaranteed cortisol reduction, universal sleep quotas, guaranteed safe equipment, and the 3-3-3 adoption rule presented as scientific deadlines.
- Do not predict temperament from breed alone or blame a guardian's anxiety as the sole cause of a dog's behavior.
- Verify medical, scientific, numerical, legal, and transport claims against suitable sources. Prefer veterinary organizations, original research where applicable, government guidance, and the actual transport operator. Cite only sources you have read that support the claim; do not invent studies or references.
- For changing rules, state when the official source was checked and tell readers to reconfirm before travel. One operator's policy is not a rule for every company.
- Do not diagnose, prescribe, give drug doses, suggest human medicines, or advise delaying necessary care for training. Include topic-specific veterinary escalation for sudden changes, pain, suspected poisoning, breathing difficulty, heat illness, or swallowed objects.
- For bites, resource guarding, children, and inter-animal conflict, prioritize separation, supervision, and professional assessment. Do not tell readers to test tolerance, take guarded food, force introductions, or put hands between fighting dogs.
- General guidance is not a substitute for individualized veterinary or behavioral care. Make the limits useful and specific rather than adding the same long disclaimer everywhere.

### 5. Images
- Preserve existing illustrations and their references when fixing text. Do not generate or replace images unless the task includes image work.
- Store article images in the pillar's `images/` directory. Follow existing names such as `p04_01_puppy_potty_training.jpg`; pillar covers use `pillar_04_cover.jpg`.
- Filenames must be unique across the entire blog: the loader copies assets into the shared `site/public/images/` directory by basename.
- When generating an illustration, inspect nearby images and match the established editorial style. Depict safe handling consistent with the article; do not illustrate force or unsafe child–dog contact as recommended practice.
- Save and inspect the actual image before referencing it. If no image is available, omit the image line rather than adding a broken link or claiming an image exists.
- Place an article image immediately below its H1, before metadata, using meaningful Greek alt text:

```markdown
![Εκπαίδευση τουαλέτας κουταβιού σε διαμέρισμα](./images/p04_01_puppy_potty_training.jpg)
```

- Keep source assets in `docs/blog/.../images/`; do not edit only the copied public asset or generated `site/out/` files.

### 6. Validate before finishing
For article creation or corrections:

1. Compare the changed pillars' indexes and files: each intended entry has exactly one corresponding article, with matching number, title, and URL, plus an accurate index description. Check slug uniqueness across all pillars.
2. Check metadata labels and values, one H1 per file, complete content, reading time, list formatting, final newlines, and absence of placeholders or YAML.
3. Verify every internal link and relative image path. Links to articles being created must resolve by the end of the batch.
4. Check the real loader in `site/lib/content.ts`, not just a custom Markdown regex. Confirm correct categories, handcrafted excerpts, related services, and no visible metadata or duplicated H1/hero in rendered output.
5. From the repository root, run `cd site && pnpm build`. Confirm the changed articles are listed on `/blog/` and exported to `site/out/blog/[slug]/index.html`; check their rendered headings and link targets.
6. Run `git diff --check` and review `git status` and the diff for unintended changes. Include newly created files in your review even though unstaged `git diff` does not show untracked files.
7. If site code changed, also follow `site/AGENTS.md` and run the relevant lint/type/test checks. For a `CLAUDE.md`-only edit, verify the instructions and diff; rebuilding the site is unnecessary.

Report what was created or fixed and which checks passed, failed, or could not run. Do not claim images were generated, Drive was updated, or changes were deployed unless those actions were explicitly requested and actually completed.

## Blog Illustration Generation Workflow

When generating editorial illustrations for blog articles and pillars, follow this standardized, end-to-end automated process:

### 1. Art Direction & Style Specifications
Every generated image must maintain a cohesive visual identity across the entire blog library:
- **Style:** Minimalist vector illustration, modern flat design, clean lines, bold organic & geometric shapes.
- **Editorial Aesthetic:** Modern infographic editorial layout, magazine-ready clarity, conceptual design (symbolic storytelling rather than literal clip-art).
- **Aspect Ratio:** 16:9 landscape format (`AspectRatio: "16:9"`).
- **Welfare & Safety Consistency:** Never illustrate aversive tools, physical force, choking, punitive measures, or unsafe child-dog interactions as recommended practice.
- **Strictly Avoid:** Photorealism, 3D renders, glossy textures, visual clutter, watermarks, and gibberish/AI text artifacts.

### 2. Color Palette & Pillar Themes
Every pillar uses a designated primary accent tone from `CATEGORY_COLORS` (`site/lib/content.ts`), paired with a warm, welcoming supporting palette:
- **Base Background:** Warm cream (`#FAF7F2` or `#F8F5EE`).
- **Warm Accents:** Golden amber/ochre (`#E29538` / `#C4852A`) and soft terracotta (`#C4522A`).
- **Neutral Outlines/Accents:** Clean charcoal/slate (`#2B2D42` / `#2C3539`).
- **Pillar Primary Color Matrix (`CATEGORY_COLORS`):**
  - **Pillar 01:** `#C4852A` — Η Φιλοσοφία Let It Sniff & Αστική Βόλτα (Warm Amber)
  - **Pillar 02:** `#C4522A` — Ζωή στην Πολυκατοικία & Διαχείριση Άγχους (Terracotta)
  - **Pillar 03:** `#A83228` — Αντιδραστικότητα, Φοβίες & Ερεθίσματα της Πόλης (Brick Red)
  - **Pillar 04:** `#5A7A54` — Κουτάβι στο Διαμέρισμα (Puppy Hub) (Sage Green)
  - **Pillar 05:** `#6B7C3A` — Επιστήμη, Θετική Εκπαίδευση & Κατάρριψη Μύθων (Olive / Moss Green)
  - **Pillar 06:** `#2E7D7A` — Συνεργατική Φροντίδα, Κτηνίατρος & Grooming (Teal)
  - **Pillar 07:** `#9B4D6B` — Οικογένεια, Μωρά, Παιδιά & Πολλά Κατοικίδια (Plum / Berry)
  - **Pillar 08:** `#3A6B9B` — Ταξίδια, Μετακινήσεις στην Αθήνα & Διακοπές (Steel Blue)
  - **Pillar 09:** `#6B4D9B` — Φυλές, Ημίαιμα & Γενετικά Ένστικτα στο Διαμέρισμα (Purple / Indigo)
  - **Pillar 10:** `#B85C20` — Παράξενες Συμπεριφορές & Καθημερινά Αινίγματα (Rust / Sienna)
  - **Pillar 11:** `#7A2E4A` — Ηλικία, Υγεία, Ορμόνες & Συμπεριφορά (Maroon / Burgundy)
  - **Pillar 12:** `#3D5C38` — Πώς Εκφράζονται τα Σκυλιά (Γλώσσα Σώματος) (Forest Green)
  - **Pillar 13:** `#2E4D7A` — Φωνητική Έκφραση & Επικοινωνία Μεταξύ Σκύλων (Deep Slate Blue)
  - **Pillar 14:** `#9B7A2E` — Πριν την Υιοθεσία (Επιλογή Σκύλου & Προετοιμασία) (Mustard / Khaki)
  - **Pillar 15:** `#3D7A5C` — Η Μετάβαση μετά την Υιοθεσία (Αποσυμπίεση & Δέσιμο) (Emerald Sea Green)
  - **Pillar 16:** `#7A5C2E` — Εξοπλισμός, Λιχουδιές & Αισθητηριακός Πλούτος (Earthy Ochre)
  - **Pillar 17:** `#2E7A9B` — Πάρκα Σκύλων, Dog Walkers & Κοινωνική Ζωή (Sky / Ocean Teal)
  - **Pillar 18:** `#4D3D7A` — Η Ψυχολογία του Κηδεμόνα στην Πόλη (Deep Violet)

### 3. File Naming & Directory Organization
- Source image directory: `docs/blog/[NN] - [Pillar Name]/images/`
- Unique basenames: Every image filename must be globally unique across all pillars because Next.js content loader flattens them into `site/public/images/`.
- **Article illustrations:** `p[PP]_[AA]_[short_descriptive_slug].jpg` (e.g. `p04_01_puppy_potty_training.jpg`).
- **Pillar cover images:** `pillar_[PP]_cover.jpg` (e.g. `pillar_01_cover.jpg`).

### 4. Subagent Execution & Batching
1. **Spawn dedicated subagents:** Use one `image-generator` subagent per article, passing the specific article title, summary/content, pillar primary color, and style prompt.
2. **Batch concurrency:** Launch in batches of 2–3 subagents to manage resources cleanly and avoid sudden burst limits.
3. **Artifact retrieval:** Subagents write generated images into the conversation artifact/brain directory (`<brain>/<basename>_<timestamp>.jpg`). Copy them using a Python script or shell command into `docs/blog/[NN] - [Pillar Name]/images/<target_name>.jpg`.
4. **Clean paths in shell/scripts:** Always handle Greek pillar folder names safely (e.g., via `glob.glob("docs/blog/05*")[0]`).

### 5. Markdown Article & Pillar Cover Integration
- **Article illustrations:** Embed the illustration immediately under the H1 heading and before metadata in each `[AA]. Article.md`:

```markdown
# **01\. Title of the article**

![Descriptive Greek alt text](./images/p05_01_positive_reinforcement_boundaries.jpg)

**Κατηγορία:** 05 - Επιστήμη, Θετική Εκπαίδευση & Κατάρριψη Μύθων  
**Προτεινόμενο URL:** /blog/my-slug  
**Χρόνος ανάγνωσης:** 2 λεπτά
```

- **Pillar cover images:** Each pillar must also have its own dedicated cover illustration embedded immediately below the H1 in its intro index file (`00. Εισαγωγή & Πίνακας Περιεχομένων - Πυλώνας [PP].md`):

```markdown
# **Πυλώνας 02: Ζωή στην Πολυκατοικία & Διαχείριση Άγχους**

![Ζωή στην Πολυκατοικία & Διαχείριση Άγχους](./images/pillar_02_cover.jpg)

**Εισαγωγή:** ...
```
The Next.js content loader (`site/lib/content.ts`) extracts this cover to display on category cards on `/blog/` and hero headers.

- Always use meaningful Greek alt text describing the illustration.
- Ensure blank lines precede and follow the image tag.

### 6. Build, Verification & Image Sync
After modifying Markdown files and adding images:
1. Run `cd site && pnpm build`.
2. The custom content loader in `site/lib/content.ts` will:
   - Synchronize all files from `docs/blog/*/images/*` into `site/public/images/`.
   - Extract the top image link to populate article heroes and social card metadata.
3. Verify that Next.js static export finishes cleanly with 0 errors (all routes generated).

### 7. Version Control & Continuous Deployment
1. Stage modified articles and copied images:
   ```bash
   git add "docs/blog/[NN] - [Pillar Name]" site/public/images/p[PP]*
   ```
2. Commit with descriptive semantic message:
   ```bash
   git commit -m "feat(blog): add illustrations for articles 01-06 in pillar [PP]"
   ```
3. Push directly to `main`:
   ```bash
   git push origin main
   ```
   Pushing to `main` automatically triggers `.github/workflows/deploy.yml` on GitHub Actions to deploy to production (`https://letitsniff.gr`).

### 8. Handling API Rate Limits & Quotas
- If an image generator subagent encounters `429 RESOURCE_EXHAUSTED` (e.g., on `gemini-3.1-flash-image`):
  1. Do not enter an aggressive retry loop.
  2. Commit and push all completed images and updated articles up to that point.
  3. Record the reset timestamp reported by the API error message.
  4. Notify the user or schedule resumption via `/schedule` after the reset window expires.

## Google Drive Synchronization Architecture
- **Markdown Articles (One-Way):** Google Drive / Google Docs ➔ GitHub Repository `docs/` ➔ Live Site. Articles are never pushed from git to Google Drive, preserving Google Docs as Alex's primary content editor.
- **Article Images (Git ➔ Drive):** Generated and committed images in `docs/blog/[Pillar]/images/*` are automatically synced and uploaded to the matching `images` folder inside that pillar on Google Drive.
- **Root Folder ID:** `1oNgHqLRswU0GSE9e8XFTyf9j-dGlotbi` (`letitsniff.gr - Πυλώνες Περιεχομένου`)
- **CI Sync Workflow (`.github/workflows/sync-from-drive.yml`):**
  - **Triggers:**
    - Schedule: runs hourly (`cron: '0 * * * *'`).
    - Webhook: `repository_dispatch: [sync-drive]` (triggered by Alex's 1-click button in Google Docs).
    - Manual: `workflow_dispatch`.
  - **Incremental Sync & Image Upload (`scripts/sync_from_drive_ci.py`):**
    - Uploads any newly committed local images to Google Drive.
    - Checks Drive `modifiedTime` against `.sync/drive_state.json`.
    - Only downloads/exports files that were newly added or modified on Drive.
    - If no files changed, finishes in ~4 seconds and skips committing/deploying.
    - Automatically cleans deleted files while protecting all local images.
    - Sanitizes markdown exports by removing inline base64 image strings.
    - When changes are detected: commits changes, pushes to `main`, and dispatches `.github/workflows/deploy.yml`.
- **Local Scripts & Daemon:**
  - `systemctl --user status letitsniff-sync`: Native systemd user background service actively syncing laptop <-> Google Drive.
  - `journalctl --user -u letitsniff-sync -f`: Live logs of the sync service.
  - `python3 scripts/sync_images_to_drive.py`: Standalone upload script for article images.
  - `.sync/sync_daemon.py`: Python daemon script executed by the systemd service.

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
