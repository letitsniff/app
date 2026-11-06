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

function syncImages(): void {
  try {
    if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
      fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
    }

    if (!fs.existsSync(BLOG_DIR)) return;

    const dirs = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const imagesPath = path.join(BLOG_DIR, dir.name, "images");
        if (fs.existsSync(imagesPath)) {
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

function categorySlug(num: number): string {
  return `pillar-${String(num).padStart(2, "0")}`;
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

function loadCategories(): Category[] {
  syncImages();

  if (!fs.existsSync(BLOG_DIR)) return [];

  const dirs = fs
    .readdirSync(BLOG_DIR)
    .filter((d) => /^\d{2}\s+-/.test(d))
    .sort();

  const categories: Category[] = [];

  for (const dir of dirs) {
    const numMatch = dir.match(/^(\d{2})/);
    if (!numMatch) continue;
    const num = parseInt(numMatch[1], 10);
    const dirPath = path.join(BLOG_DIR, dir);

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
  return getAllCategories().find((c) => c.slug === slug);
}

// ─── Thematic Clusters (Macro-Nesting) ───────────────────────────────────────

export interface ThematicCluster {
  id: string;
  title: string;
  tagline: string;
  pillarNumbers: number[];
}

export const THEMATIC_CLUSTERS: ThematicCluster[] = [
  {
    id: "astiki-zoi",
    title: "Αστική Ζωή & Καθημερινότητα",
    tagline: "Βόλτα, πολυκατοικία, μετακινήσεις και πάρκα στην πόλη",
    pillarNumbers: [1, 2, 8, 17],
  },
  {
    id: "symperifora-psychologia",
    title: "Συμπεριφορά, Επικοινωνία & Ψυχολογία",
    tagline: "Αντιδραστικότητα, φόβοι, γλώσσα σώματος και η ψυχολογία του κηδεμόνα",
    pillarNumbers: [3, 10, 12, 13, 18],
  },
  {
    id: "stadia-zois-yiothesia",
    title: "Στάδια Ζωής & Υιοθεσία",
    tagline: "Από το κουτάβι και την υιοθεσία έως την τρίτη ηλικία και τα ένστικτα φυλών",
    pillarNumbers: [4, 14, 15, 9, 11],
  },
  {
    id: "ekpaidefsi-frontida",
    title: "Εκπαίδευση, Φροντίδα & Εξοπλισμός",
    tagline: "Θετική προσέγγιση, συνεργατική φροντίδα, παιδιά και επιλογή εξοπλισμού",
    pillarNumbers: [5, 6, 7, 16],
  },
];

export function getClusterByPillarNumber(pillarNum: number): ThematicCluster | undefined {
  return THEMATIC_CLUSTERS.find((c) => c.pillarNumbers.includes(pillarNum));
}

export function getCategoriesByClusterId(clusterId: string): Category[] {
  const cluster = THEMATIC_CLUSTERS.find((c) => c.id === clusterId);
  if (!cluster) return [];
  const all = getAllCategories();
  return cluster.pillarNumbers
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
