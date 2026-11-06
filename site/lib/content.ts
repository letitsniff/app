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

// ─── Greek to ASCII Slugifier ────────────────────────────────────────────────

export function slugifyGreek(text: string): string {
  let s = text.toLowerCase();
  s = s.replace(/ου/g, "ou").replace(/ού/g, "ou");
  s = s.replace(/αυ(?=[θκξπστφχψ]|\s|$)/g, "af").replace(/αυ/g, "av");
  s = s.replace(/ευ(?=[θκξπστφχψ]|\s|$)/g, "ef").replace(/ευ/g, "ev");
  s = s.replace(/μπ/g, "mp").replace(/ντ/g, "nt").replace(/γκ/g, "gk");

  const map: Record<string, string> = {
    "α": "a", "ά": "a", "β": "v", "γ": "g", "δ": "d", "ε": "e", "έ": "e",
    "ζ": "z", "η": "i", "ή": "i", "θ": "th", "ι": "i", "ί": "i", "ϊ": "i", "ΐ": "i",
    "κ": "k", "λ": "l", "μ": "m", "ν": "n", "ξ": "x", "ο": "o", "ό": "o",
    "π": "p", "ρ": "r", "σ": "s", "ς": "s", "τ": "t", "υ": "y", "ύ": "y", "ϋ": "y", "ΰ": "y",
    "φ": "f", "χ": "ch", "ψ": "ps", "ω": "o", "ώ": "o"
  };

  return s
    .replace(/[α-ωά-ώϊΐϋΰ]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Article {
  slug: string;
  title: string;
  categorySlug: string;
  categoryTitle: string;
  categoryNumber: number;
  categoryColor: string;
  macroNumber?: number;
  legacyNumber?: number;
  readingTime: string;
  excerpt: string;
  htmlContent: string;
  relatedService: string[];
  coverImage?: string;
}

export interface Category {
  slug: string;
  number: number;
  legacyNumber?: number;
  macroNumber: number;
  macroTitle: string;
  title: string;
  intro: string;
  relatedService: string[];
  articles: Article[];
  coverImage?: string;
  color: string;
}

// ─── Dynamic Helpers ─────────────────────────────────────────────────────────

export function categorySlug(numOrTitle: number | string): string {
  const all = getAllCategories();
  if (typeof numOrTitle === "number") {
    const found = all.find((c) => c.number === numOrTitle);
    return found ? found.slug : `pillar-${String(numOrTitle).padStart(2, "0")}`;
  }
  const found = all.find((c) => c.title === numOrTitle);
  return found ? found.slug : slugifyGreek(numOrTitle);
}

/**
 * Dynamic map for backwards compatibility: reads color directly from category documents.
 */
export const CATEGORY_COLORS: Record<string | number, string> = new Proxy(
  {},
  {
    get(_target, prop: string) {
      if (typeof prop !== "string") return "#C4852A";
      const categories = getAllCategories();
      const found = categories.find(
        (c) => c.slug === prop || String(c.number) === prop
      );
      if (found) return found.color;
      return "#C4852A";
    },
  }
);

function extractTitle(raw: string): string {
  const m = raw.match(/^#\s+\**(.+?)\**\s*$/m);
  if (!m) return "Untitled";
  return m[1].replace(/\\\./g, ".").replace(/\\/g, "").trim();
}

function extractField(raw: string, field: string): string {
  const regex = new RegExp(`\\*\\*${field}:\\*\\*\\s*([^\\n]+)`, "u");
  const m = raw.match(regex);
  return m ? m[1].trim() : "";
}

function extractSlug(raw: string): string {
  const directSlug = extractField(raw, "Slug");
  if (directSlug) return directSlug.trim().toLowerCase();

  const url = extractField(raw, "Προτεινόμενο URL");
  if (url) {
    return url
      .replace(/^https?:\/\/[^\/]+/i, "")
      .replace(/^\/blog\/enotita\//, "")
      .replace(/^\/blog[/#]?/, "")
      .replace(/^#/, "")
      .replace(/\/$/, "")
      .trim();
  }
  return "";
}

function extractColor(raw: string): string {
  const c = extractField(raw, "Χρώμα") || extractField(raw, "Color");
  if (c && /^#?[a-fA-F0-9]{3,8}$/.test(c.trim())) {
    return c.trim().startsWith("#") ? c.trim() : `#${c.trim()}`;
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

  // 1. Remove the first H1 header (rendered by page layout)
  cleaned = cleaned.replace(/^#\s+[^\n]+\n*/m, "");

  // 2. Rewrite all markdown image URLs
  cleaned = cleaned.replace(
    /!\[(.*?)\]\(([^\)]+)\)/g,
    (_, alt, url) => `![${alt}](${resolveImageUrl(url)})`
  );

  // 3. Prevent duplicate cover image at top
  if (coverImage) {
    const filename = coverImage.split("/").pop();
    if (filename) {
      const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const coverImgRegex = new RegExp(`!\\[[^\\]]*\\]\\([^)]*${escaped}[^)]*\\)\\s*`, "i");
      cleaned = cleaned.replace(coverImgRegex, "");
    }
  }

  // 4. Remove inline metadata lines
  cleaned = cleaned
    .replace(/\*\*Κατηγορία:\*\*[^\n]+\n?/g, "")
    .replace(/\*\*Προτεινόμενο URL:\*\*[^\n]+\n?/g, "")
    .replace(/\*\*Χρόνος ανάγνωσης:\*\*[^\n]+\n?/g, "")
    .replace(/\*\*Χρώμα:\*\*[^\n]+\n?/g, "")
    .replace(/\*\*Color:\*\*[^\n]+\n?/g, "")
    .replace(/\*\*Slug:\*\*[^\n]+\n?/g, "")
    .replace(/^##\s*\\?---\s*$/gm, "");

  return cleaned.trim();
}

// ─── Loaders ─────────────────────────────────────────────────────────────────

interface PillarDirInfo {
  dirPath: string;
  dirName: string;
  num: number;
  macroNum: number;
  macroTitle: string;
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
    const macroNumMatch = top.name.match(/^(\d{2})/);
    const macroNum = macroNumMatch ? parseInt(macroNumMatch[1], 10) : 0;
    const macroTitle = top.name.replace(/^\d{2}\s+-\s+/, "");

    // Check if this top folder is a Macro Category containing pillar subdirectories
    const subEntries = fs
      .readdirSync(topPath, { withFileTypes: true })
      .filter((e) => e.isDirectory() && /^\d{2}\s+-/.test(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (subEntries.length > 0) {
      for (const sub of subEntries) {
        const numMatch = sub.name.match(/^(\d{2})/);
        if (!numMatch) continue;
        const subNum = parseInt(numMatch[1], 10);
        results.push({
          dirPath: path.join(topPath, sub.name),
          dirName: sub.name,
          num: subNum,
          macroNum,
          macroTitle,
        });
      }
    } else {
      const numMatch = top.name.match(/^(\d{2})/);
      if (!numMatch) continue;
      const num = parseInt(numMatch[1], 10);
      results.push({
        dirPath: topPath,
        dirName: top.name,
        num,
        macroNum: 0,
        macroTitle: "",
      });
    }
  }

  return results.sort((a, b) => {
    if (a.macroNum !== b.macroNum) return a.macroNum - b.macroNum;
    return a.num - b.num;
  });
}

function loadCategories(): Category[] {
  syncImages();

  if (!fs.existsSync(BLOG_DIR)) return [];

  const pillarDirs = getPillarDirectories(BLOG_DIR);
  const categories: Category[] = [];

  for (let idx = 0; idx < pillarDirs.length; idx++) {
    const pInfo = pillarDirs[idx];
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
    let categorySlugFromDoc = "";
    let colorFromDoc = "";

    const imagesPath = path.join(dirPath, "images");
    let descriptions: Record<string, string> = {};

    if (introFile) {
      introRaw = fs.readFileSync(path.join(dirPath, introFile), "utf-8");
      descriptions = extractDescriptions(introRaw);
      const titleMatch = introRaw.match(/^#\s+\**Πυλώνας \d+:\s*(.+?)\**\s*$/m);
      if (titleMatch) categoryTitle = titleMatch[1].trim();
      relatedService = extractRelatedServices(introRaw);
      categorySlugFromDoc = extractSlug(introRaw);
      colorFromDoc = extractColor(introRaw);

      // Extract cover image from pillar intro (e.g. ![...](./images/pillar_01_cover.jpg))
      coverImage = extractImage(introRaw);

      // If not in markdown, check if pillar_XX_cover.* exists in images folder
      if (!coverImage && fs.existsSync(imagesPath)) {
        const found = fs.readdirSync(imagesPath).find((f) =>
          /\.(jpe?g|png|webp|avif|svg)$/i.test(f) &&
          /^(pillar|cover)/i.test(f)
        );
        if (found && fs.existsSync(path.join(PUBLIC_IMAGES_DIR, found))) {
          coverImage = `/images/${found}`;
        }
      }

      // Extract intro paragraph
      const introMatch = introRaw.match(/\*\*Εισαγωγή:\*\*\s*([^\n]+)/);
      if (introMatch) intro = introMatch[1].replace(/\*([^*]+)\*/g, "$1").trim();
    }

    const slug = categorySlugFromDoc || slugifyGreek(categoryTitle);
    const color = colorFromDoc || "#C4852A";

    // Read article files (not 00.)
    const articleFiles = files.filter((f) => /^\d{2,}\./.test(f) && !/^00\./.test(f));
    const articles: Article[] = [];

    for (const af of articleFiles) {
      const raw = fs.readFileSync(path.join(dirPath, af), "utf-8");
      const title = extractTitle(raw);
      const artSlug = extractSlug(raw) || af.replace(/\.md$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const readingTime = extractField(raw, "Χρόνος ανάγνωσης") || "3 λεπτά";

      let articleCover = extractImage(raw);
      if (!articleCover && fs.existsSync(imagesPath)) {
        const afNumMatch = af.match(/^(\d{2})/);
        if (afNumMatch) {
          const artNum = afNumMatch[1];
          const found = fs.readdirSync(imagesPath).find((f) =>
            /\.(jpe?g|png|webp|avif|svg)$/i.test(f) &&
            (new RegExp(`^(article_${artNum}|${artNum}[._-]|p0?${num}_0?${artNum})`, "i").test(f) ||
            f.toLowerCase().includes(artSlug))
          );
          if (found && fs.existsSync(path.join(PUBLIC_IMAGES_DIR, found))) {
            articleCover = `/images/${found}`;
          }
        }
      }

      const cleaned = cleanMarkdownForDisplay(raw, articleCover);
      const html = marked.parse(cleaned) as string;

      const tocExcerpt = descriptions[artSlug];
      const excerpt = tocExcerpt || extractExcerptFromBody(cleaned);

      articles.push({
        slug: artSlug,
        title,
        categorySlug: slug,
        categoryTitle,
        categoryNumber: num,
        categoryColor: color,
        macroNumber: pInfo.macroNum,
        readingTime,
        excerpt,
        htmlContent: html,
        relatedService,
        coverImage: articleCover,
      });
    }

    categories.push({
      slug,
      number: num,
      macroNumber: pInfo.macroNum,
      macroTitle: pInfo.macroTitle,
      title: categoryTitle,
      intro,
      relatedService,
      articles,
      coverImage,
      color,
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
  const clean = slug.toLowerCase().replace(/\/$/, "");
  return (
    all.find((c) => c.slug === clean) ||
    all.find((c) => c.slug.replace(/^i-/, "") === clean.replace(/^i-/, "")) ||
    all.find((c) => `pillar-${String(c.number).padStart(2, "0")}` === clean) ||
    all.find((c) => `enotita-${c.macroNumber}-${c.number}` === clean) ||
    all.find((c) => String(c.number) === clean)
  );
}

// ─── Thematic Categories (Macro-Nesting from docs/blog/*/index.md) ─────────

export interface ThematicCategory {
  id: string;
  number: number;
  title: string;
  tagline: string;
  color?: string;
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

  for (const top of topEntries) {
    const topPath = path.join(BLOG_DIR, top.name);
    const subEntries = fs
      .readdirSync(topPath, { withFileTypes: true })
      .filter((e) => e.isDirectory() && /^\d{2}\s+-/.test(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    const macroNumMatch = top.name.match(/^(\d{2})/);
    const macroNum = macroNumMatch ? parseInt(macroNumMatch[1], 10) : 0;
    const macroTitle = top.name.replace(/^\d{2}\s+-\s+/, "");

    let tagline = "";
    let macroSlug = "";
    let macroColor = "";
    const macroIndex = path.join(topPath, "index.md");
    if (fs.existsSync(macroIndex)) {
      const raw = fs.readFileSync(macroIndex, "utf-8");
      const m = raw.match(/\*\*Εισαγωγή:\*\*\s*([^\n]+)/);
      if (m) tagline = m[1].replace(/\*([^*]+)\*/g, "$1").trim();
      macroSlug = extractSlug(raw);
      macroColor = extractColor(raw);
    }

    const pillarNumbers = subEntries
      .map((e) => {
        const m = e.name.match(/^(\d{2})/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => n > 0);

    macros.push({
      id: macroSlug || slugifyGreek(macroTitle),
      number: macroNum,
      title: macroTitle,
      tagline,
      color: macroColor || "#C4852A",
      pillarNumbers,
    });
  }

  return macros;
}

export const THEMATIC_CATEGORIES: ThematicCategory[] = loadMacroCategories();
export const THEMATIC_CLUSTERS = THEMATIC_CATEGORIES;

export function getClusterByPillarNumber(pillarNum: number, macroNum?: number): ThematicCategory | undefined {
  if (macroNum !== undefined) {
    return THEMATIC_CATEGORIES.find((c) => c.number === macroNum);
  }
  return THEMATIC_CATEGORIES.find((c) => c.pillarNumbers.includes(pillarNum));
}

export function getClusterByCategory(category: Category): ThematicCategory | undefined {
  return THEMATIC_CATEGORIES.find((c) => c.number === category.macroNumber);
}

export function getCategoriesByClusterId(clusterId: string): Category[] {
  const cat = THEMATIC_CATEGORIES.find((c) => c.id === clusterId);
  if (!cat) return [];
  const all = getAllCategories();
  return all.filter((c) => c.macroNumber === cat.number);
}
