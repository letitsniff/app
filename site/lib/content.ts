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
  const m = raw.match(/!\[.*?\]\([^\)]*?([^/\)]+\.(?:jpg|jpeg|png|webp|avif|svg))\)/i);
  if (!m) return undefined;
  const filename = m[1];
  if (fs.existsSync(path.join(PUBLIC_IMAGES_DIR, filename))) {
    return `/images/${filename}`;
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

  // 2. If a cover image exists, remove its occurrence at the top of the post to prevent duplicates
  if (coverImage) {
    const filename = coverImage.split("/").pop();
    if (filename) {
      const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const coverImgRegex = new RegExp(`!\\[[^\\]]*\\]\\([^)]*${escaped}[^)]*\\)\\s*`, "i");
      cleaned = cleaned.replace(coverImgRegex, "");
    }
  }

  // 3. Remove inline metadata lines and separators
  cleaned = cleaned
    .replace(/\*\*Κατηγορία:\*\*[^\n]+\n?/g, "")
    .replace(/\*\*Προτεινόμενο URL:\*\*[^\n]+\n?/g, "")
    .replace(/\*\*Χρόνος ανάγνωσης:\*\*[^\n]+\n?/g, "")
    .replace(/^##\s*\\?---\s*$/gm, "");

  // 4. Rewrite relative markdown image URLs to point to /images/
  cleaned = cleaned.replace(
    /!\[(.*?)\]\(\.?\/?images\/([^)]+)\)/g,
    "![$1](/images/$2)"
  );

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
