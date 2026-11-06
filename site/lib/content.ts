import path from "path";
import fs from "fs";
import { marked } from "marked";

function getRootDir(): string {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, "docs", "blog"))) {
    return cwd;
  }
  if (fs.existsSync(path.join(cwd, "..", "docs", "blog"))) {
    return path.join(cwd, "..");
  }
  return cwd;
}

const ROOT_DIR = getRootDir();
const BLOG_DIR = path.join(ROOT_DIR, "docs", "blog");
const PUBLIC_IMAGES_DIR = path.join(ROOT_DIR, "site", "public", "images");
const DRIVE_STATE_FILE = path.join(ROOT_DIR, ".sync", "drive_state.json");

let _driveIdMap: Record<string, string> | null = null;

function getDriveIdToFilenameMap(): Record<string, string> {
  if (_driveIdMap) return _driveIdMap;
  _driveIdMap = {};
  if (fs.existsSync(DRIVE_STATE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DRIVE_STATE_FILE, "utf-8"));
      for (const [relPath, info] of Object.entries(data.files || {})) {
        const fileInfo = info as { id?: string };
        if (fileInfo.id) {
          const filename = path.basename(relPath);
          _driveIdMap[fileInfo.id] = filename;
        }
      }
    } catch {
      // fallback
    }
  }
  return _driveIdMap;
}

export function resolveImageUrl(url: string): string {
  const cleanUrl = url.trim().replace(/^<|>$/g, "");

  // 1. If it's a Google Drive link
  const driveIdMatch = cleanUrl.match(
    /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/i
  );
  if (driveIdMatch) {
    const driveId = driveIdMatch[1];
    const map = getDriveIdToFilenameMap();
    if (map[driveId]) {
      return `/images/${map[driveId]}`;
    }
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  // 2. If it's an external URL (http / https), leave as is
  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }

  // 3. If it's a relative/local image path (e.g. ./images/foo.jpg, images/foo.jpg, foo.jpg)
  const localMatch = cleanUrl.match(/(?:(?:^|\/)?images\/|^)([^\/\)]+\.(?:jpe?g|png|webp|avif|svg))$/i);
  if (localMatch) {
    return `/images/${localMatch[1]}`;
  }

  return cleanUrl;
}

// ─── Image Sync Helper ───────────────────────────────────────────────────────

function findImageDirs(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === "images") {
        results.push(path.join(dir, entry.name));
      } else {
        results.push(...findImageDirs(path.join(dir, entry.name)));
      }
    }
  }
  return results;
}

function syncImages(): void {
  try {
    if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
      fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
    }

    if (!fs.existsSync(BLOG_DIR)) return;

    const imageDirs = findImageDirs(BLOG_DIR);
    for (const imagesPath of imageDirs) {
      const files = fs.readdirSync(imagesPath);
      for (const file of files) {
        if (!/\.(jpe?g|png|webp|avif|svg)$/i.test(file)) continue;
        const src = path.join(imagesPath, file);
        const dest = path.join(PUBLIC_IMAGES_DIR, file);
        if (fs.statSync(src).isFile()) {
          // Copy if destination doesn't exist or is older
          if (
            !fs.existsSync(dest) ||
            fs.statSync(src).mtimeMs > fs.statSync(dest).mtimeMs
          ) {
            fs.copyFileSync(src, dest);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error syncing images to public folder:", err);
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Article {
  slug: string;
  title: string;
  categorySlug: string;
  categoryTitle: string;
  categoryNumber: number;
  readingTime: string;
  excerpt: string;
  htmlContent: string;
  relatedService: string[];
  coverImage?: string;
}

export interface Category {
  slug: string;
  number: number;
  title: string;
  intro: string;
  relatedService: string[];
  articles: Article[];
  coverImage?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const PILLAR_SLUGS: Record<number, string> = {
  1:  "filosofia-let-it-sniff-astiki-volta",
  2:  "zoi-stin-polykatoikia-diacheirisi-agchous",
  3:  "antidrastikotita-fovies-erethismata-polis",
  4:  "koutavi-sto-diamerisma-puppy-hub",
  5:  "epistimi-thetiki-ekpaidefsi-katarripsi-mython",
  6:  "synergatiki-frontida-ktiniatros-grooming",
  7:  "oikogeneia-mora-paidia-polla-katoikidia",
  8:  "taxidia-metakiniseis-stin-athina-diakopes",
  9:  "fyles-imiaima-genetika-enstikta-diamerisma",
  10: "paraxenes-symperifores-kathimerina-ainigmata",
  11: "ilikia-ygeia-ormones-symperifora",
  12: "pos-ekfrazontai-ta-skylia-glossa-somatos",
  13: "fonitiki-ekfrasi-epikoinonia-metaxy-skylon",
  14: "prin-tin-yiothesia-epilogi-skylou-proetoimasia",
  15: "metavasi-meta-tin-yiothesia-aposympiesi-desimo",
  16: "exoplismos-lixoudies-aisthitiriakos-ploutos",
  17: "parka-skylon-dog-walkers-koinoniki-zoi",
  18: "i-psychologia-tou-kidemona-stin-poli",
};

export function categorySlug(num: number): string {
  return PILLAR_SLUGS[num] ?? `pillar-${String(num).padStart(2, "0")}`;
}

function extractTitle(raw: string): string {
  // Match first # heading, strip bold markers and backslash escapes
  const m = raw.match(/^#\s+\**(.+?)\**\s*$/m);
  if (!m) return "Untitled";
  return m[1].replace(/\\\./g, ".").replace(/\\/g, "").trim();
}

function extractField(raw: string, field: string): string {
  const regex = new RegExp(
    `\\*\\*${field}:\\*\\*\\s*([^\\n]+)`,
    "u"
  );
  const m = raw.match(regex);
  return m ? m[1].trim() : "";
}

function extractSlug(raw: string): string {
  const url = extractField(raw, "Προτεινόμενο URL");
  if (url) {
    return url.replace(/^\/blog\//, "").replace(/\/$/, "");
  }
  return "";
}

function extractRelatedServices(raw: string): string[] {
  const field = extractField(raw, "Συνδεδεμένη Υπηρεσία") ||
                extractField(raw, "Συνδεδεμένη Σελίδα");
  if (!field) return [];
  return field
    .split("&")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("/ypiresies/"))
    .map((s) => s.replace("/ypiresies/", ""));
}

function extractImage(raw: string): string | undefined {
  const m = raw.match(/!\[.*?\]\(([^\)]+)\)/i);
  if (!m) return undefined;
  const resolved = resolveImageUrl(m[1]);
  if (resolved.startsWith("/images/")) {
    const filename = resolved.replace("/images/", "");
    if (fs.existsSync(path.join(PUBLIC_IMAGES_DIR, filename))) {
      return resolved;
    }
  } else if (/^https?:\/\//i.test(resolved)) {
    return resolved;
  }
  return undefined;
}

function extractDescriptions(introRaw: string): Record<string, string> {
  const map: Record<string, string> = {};
  const entries = introRaw.split(/>\s*\*\s+/);
  for (const entry of entries) {
    const urlMatch = entry.match(/\*URL:\*\s*([^\n\r]+)/);
    const descMatch = entry.match(/\*Περιγραφή:\*\s*([^\n\r]+)/);
    if (urlMatch && descMatch) {
      const slug = urlMatch[1].trim().replace(/^\/blog\//, "").replace(/\/$/, "");
      map[slug] = descMatch[1].trim();
    }
  }
  return map;
}

function extractExcerptFromBody(cleanedMarkdown: string, length = 160): string {
  const text = cleanedMarkdown
    .replace(/^##+\s+[^\n]+/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/\*\*Με μια ματιά \(TL;DR\)\*\*/gi, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > length ? text.slice(0, length).replace(/\s\S+$/, "") + "…" : text;
}

function cleanMarkdownForDisplay(raw: string, coverImage?: string): string {
  let cleaned = raw;

  // 1. Remove the first H1 header (it is already rendered by the page layout)
  cleaned = cleaned.replace(/^#\s+[^\n]+\n*/m, "");

  // 2. Rewrite all markdown image URLs (resolving Drive links and relative paths to /images/)
  cleaned = cleaned.replace(
    /!\[(.*?)\]\(([^\)]+)\)/g,
    (_, alt, url) => `![${alt}](${resolveImageUrl(url)})`
  );

  // 3. If a cover image exists, remove its occurrence at the top of the post to prevent duplicates
  if (coverImage) {
    const filename = coverImage.split("/").pop();
    if (filename) {
      const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const coverImgRegex = new RegExp(`!\\[[^\\]]*\\]\\([^)]*${escaped}[^)]*\\)\\s*`, "i");
      cleaned = cleaned.replace(coverImgRegex, "");
    }
  }

  // 4. Remove inline metadata lines and separators
  cleaned = cleaned
    .replace(/\*\*Κατηγορία:\*\*[^\n]+\n?/g, "")
    .replace(/\*\*Προτεινόμενο URL:\*\*[^\n]+\n?/g, "")
    .replace(/\*\*Χρόνος ανάγνωσης:\*\*[^\n]+\n?/g, "")
    .replace(/^##\s*\\?---\s*$/gm, "");

  return cleaned.trim();
}

// ─── Loaders ─────────────────────────────────────────────────────────────────

interface PillarDirInfo {
  dirPath: string;
  dirName: string;
  num: number;
}

function getPillarDirectories(blogDir: string): PillarDirInfo[] {
  if (!fs.existsSync(blogDir)) return [];

  const results: PillarDirInfo[] = [];
  const topEntries = fs
    .readdirSync(blogDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{2}\s+-/.test(e.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const top of topEntries) {
    const topPath = path.join(blogDir, top.name);
    // Check if this top folder is a Macro Category containing pillar subdirectories
    const subEntries = fs
      .readdirSync(topPath, { withFileTypes: true })
      .filter((e) => e.isDirectory() && /^\d{2}\s+-/.test(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (subEntries.length > 0) {
      for (const sub of subEntries) {
        const numMatch = sub.name.match(/^(\d{2})/);
        if (!numMatch) continue;
        results.push({
          dirPath: path.join(topPath, sub.name),
          dirName: sub.name,
          num: parseInt(numMatch[1], 10),
        });
      }
    } else {
      const numMatch = top.name.match(/^(\d{2})/);
      if (!numMatch) continue;
      results.push({
        dirPath: topPath,
        dirName: top.name,
        num: parseInt(numMatch[1], 10),
      });
    }
  }

  return results.sort((a, b) => a.num - b.num);
}

function loadCategories(): Category[] {
  syncImages();

  if (!fs.existsSync(BLOG_DIR)) return [];

  const pillarDirs = getPillarDirectories(BLOG_DIR);
  const categories: Category[] = [];

  for (const pInfo of pillarDirs) {
    const num = pInfo.num;
    const dirPath = pInfo.dirPath;
    const dir = pInfo.dirName;

    // Read pillar intro (00. file)
    const files = fs.readdirSync(dirPath).sort();
    const introFile = files.find((f) => /^00\./.test(f));
    let introRaw = "";
    let categoryTitle = dir.replace(/^\d{2}\s+-\s+/, "");
    let relatedService: string[] = [];
    let intro = "";
    let coverImage: string | undefined = undefined;

    const imagesPath = path.join(dirPath, "images");

    let descriptions: Record<string, string> = {};

    if (introFile) {
      introRaw = fs.readFileSync(path.join(dirPath, introFile), "utf-8");
      descriptions = extractDescriptions(introRaw);
      const titleMatch = introRaw.match(/^#\s+\**Πυλώνας \d+:\s*(.+?)\**\s*$/m);
      if (titleMatch) categoryTitle = titleMatch[1].trim();
      relatedService = extractRelatedServices(introRaw);

      // Extract cover image from pillar intro (e.g. ![...](./images/pillar_01_cover.jpg))
      coverImage = extractImage(introRaw);

      // If not in markdown, check if pillar_XX_cover.* exists in images folder
      if (!coverImage && fs.existsSync(imagesPath)) {
        const numPadded = String(num).padStart(2, "0");
        const found = fs.readdirSync(imagesPath).find((f) =>
          /\.(jpe?g|png|webp|avif|svg)$/i.test(f) &&
          new RegExp(`^pillar_${numPadded}`, "i").test(f)
        );
        if (found && fs.existsSync(path.join(PUBLIC_IMAGES_DIR, found))) {
          coverImage = `/images/${found}`;
        }
      }

      // Extract intro paragraph
      const introMatch = introRaw.match(/\*\*Εισαγωγή:\*\*\s*([^\n]+)/);
      if (introMatch) intro = introMatch[1].replace(/\*([^*]+)\*/g, "$1").trim();
    }

    // Read article files (not 00.)
    const articleFiles = files.filter((f) => /^\d{2,}\./.test(f) && !/^00\./.test(f));
    const articles: Article[] = [];

    for (const af of articleFiles) {
      const raw = fs.readFileSync(path.join(dirPath, af), "utf-8");
      const title = extractTitle(raw);
      const slug = extractSlug(raw) || af.replace(/\.md$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const readingTime = extractField(raw, "Χρόνος ανάγνωσης") || "3 λεπτά";

      // Article gets its OWN image from markdown or matching convention in images folder
      let articleCover = extractImage(raw);
      if (!articleCover && fs.existsSync(imagesPath)) {
        const afNumMatch = af.match(/^(\d{2})/);
        if (afNumMatch) {
          const artNum = afNumMatch[1];
          const found = fs.readdirSync(imagesPath).find((f) =>
            /\.(jpe?g|png|webp|avif|svg)$/i.test(f) &&
            (new RegExp(`^(article_${artNum}|${artNum}[._-]|p0?${num}_0?${artNum})`, "i").test(f) ||
            f.toLowerCase().includes(slug))
          );
          if (found && fs.existsSync(path.join(PUBLIC_IMAGES_DIR, found))) {
            articleCover = `/images/${found}`;
          }
        }
      }

      // Clean markdown, stripping H1 and cover image to prevent duplicates on the article page
      const cleaned = cleanMarkdownForDisplay(raw, articleCover);
      const html = marked.parse(cleaned) as string;

      // Prefer handcrafted TOC description from pillar intro, otherwise extract clean text from body
      const tocExcerpt = descriptions[slug];
      const excerpt = tocExcerpt || extractExcerptFromBody(cleaned);

      articles.push({
        slug,
        title,
        categorySlug: categorySlug(num),
        categoryTitle,
        categoryNumber: num,
        readingTime,
        excerpt,
        htmlContent: html,
        relatedService,
        coverImage: articleCover,
      });
    }

    categories.push({
      slug: categorySlug(num),
      number: num,
      title: categoryTitle,
      intro,
      relatedService,
      articles,
      coverImage,
    });
  }

  return categories;
}

// Memoize at module level in production only
let _categories: Category[] | null = null;

export function getAllCategories(): Category[] {
  if (process.env.NODE_ENV === "production" && _categories) {
    return _categories;
  }
  _categories = loadCategories();
  return _categories;
}

export function getAllArticles(): Article[] {
  return getAllCategories().flatMap((c) => c.articles);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  const all = getAllCategories();
  return (
    all.find((c) => c.slug === slug) ||
    all.find((c) => `pillar-${String(c.number).padStart(2, "0")}` === slug)
  );
}

// ─── Thematic Categories (Macro-Nesting from docs/blog/*/index.md) ─────────

export interface ThematicCategory {
  id: string;
  number: number;
  title: string;
  tagline: string;
  pillarNumbers: number[];
}

export type ThematicCluster = ThematicCategory;

export function loadMacroCategories(): ThematicCategory[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const topEntries = fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{2}\s+-/.test(e.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  const macros: ThematicCategory[] = [];

  const idMap: Record<number, string> = {
    1: "astiki-zoi",
    2: "symperifora-psychologia",
    3: "stadia-zois-yiothesia",
    4: "ekpaidefsi-frontida",
  };

  for (const top of topEntries) {
    const topPath = path.join(BLOG_DIR, top.name);
    const subEntries = fs
      .readdirSync(topPath, { withFileTypes: true })
      .filter((e) => e.isDirectory() && /^\d{2}\s+-/.test(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (subEntries.length > 0) {
      const macroNumMatch = top.name.match(/^(\d{2})/);
      const macroNum = macroNumMatch ? parseInt(macroNumMatch[1], 10) : 0;
      const macroTitle = top.name.replace(/^\d{2}\s+-\s+/, "");

      let tagline = "";
      const macroIndex = path.join(topPath, "index.md");
      if (fs.existsSync(macroIndex)) {
        const raw = fs.readFileSync(macroIndex, "utf-8");
        const m = raw.match(/\*\*Εισαγωγή:\*\*\s*([^\n]+)/);
        if (m) tagline = m[1].trim();
      }

      const pillarNumbers = subEntries
        .map((e) => {
          const m = e.name.match(/^(\d{2})/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => n > 0);

      macros.push({
        id: idMap[macroNum] ?? `enotita-${macroNum}`,
        number: macroNum,
        title: macroTitle,
        tagline,
        pillarNumbers,
      });
    }
  }

  if (macros.length > 0) return macros;

  return [
    {
      id: "astiki-zoi",
      number: 1,
      title: "Αστική Ζωή & Καθημερινότητα",
      tagline: "Βόλτα, πολυκατοικία, μετακινήσεις και πάρκα στην πόλη",
      pillarNumbers: [1, 2, 8, 17],
    },
    {
      id: "symperifora-psychologia",
      number: 2,
      title: "Συμπεριφορά, Επικοινωνία & Ψυχολογία",
      tagline: "Αντιδραστικότητα, φόβοι, γλώσσα σώματος και η ψυχολογία του κηδεμόνα",
      pillarNumbers: [3, 10, 12, 13, 18],
    },
    {
      id: "stadia-zois-yiothesia",
      number: 3,
      title: "Στάδια Ζωής & Υιοθεσία",
      tagline: "Από το κουτάβι και την υιοθεσία έως την τρίτη ηλικία και τα ένστικτα φυλών",
      pillarNumbers: [4, 9, 11, 14, 15],
    },
    {
      id: "ekpaidefsi-frontida",
      number: 4,
      title: "Εκπαίδευση, Φροντίδα & Εξοπλισμός",
      tagline: "Θετική προσέγγιση, συνεργατική φροντίδα, παιδιά και επιλογή εξοπλισμού",
      pillarNumbers: [5, 6, 7, 16],
    },
  ];
}

export const THEMATIC_CATEGORIES: ThematicCategory[] = loadMacroCategories();
export const THEMATIC_CLUSTERS = THEMATIC_CATEGORIES;

export function getClusterByPillarNumber(pillarNum: number): ThematicCategory | undefined {
  return THEMATIC_CATEGORIES.find((c) => c.pillarNumbers.includes(pillarNum));
}

export function getCategoriesByClusterId(clusterId: string): Category[] {
  const cat = THEMATIC_CATEGORIES.find((c) => c.id === clusterId);
  if (!cat) return [];
  const all = getAllCategories();
  return cat.pillarNumbers
    .map((num) => all.find((c) => c.number === num))
    .filter((c): c is Category => Boolean(c));
}

// ─── Category color map ───────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<number, string> = {
  1:  "#C4852A",
  2:  "#C4522A",
  3:  "#A83228",
  4:  "#5A7A54",
  5:  "#6B7C3A",
  6:  "#2E7D7A",
  7:  "#9B4D6B",
  8:  "#3A6B9B",
  9:  "#6B4D9B",
  10: "#B85C20",
  11: "#7A2E4A",
  12: "#3D5C38",
  13: "#2E4D7A",
  14: "#9B7A2E",
  15: "#3D7A5C",
  16: "#7A5C2E",
  17: "#2E7A9B",
  18: "#4D3D7A",
};
