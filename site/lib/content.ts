import path from "path";
import fs from "fs";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "..", "docs", "blog");

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
}

export interface Category {
  slug: string;
  number: number;
  title: string;
  intro: string;
  relatedService: string[];
  articles: Article[];
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

function makeExcerpt(html: string, length = 160): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > length ? text.slice(0, length).replace(/\s\S+$/, "") + "…" : text;
}

function cleanMarkdownForDisplay(raw: string): string {
  // Remove the metadata lines at the top (Κατηγορία, Προτεινόμενο URL, Χρόνος) and the separator
  return raw
    .replace(/\*\*Κατηγορία:\*\*[^\n]+\n?/g, "")
    .replace(/\*\*Προτεινόμενο URL:\*\*[^\n]+\n?/g, "")
    .replace(/\*\*Χρόνος ανάγνωσης:\*\*[^\n]+\n?/g, "")
    .replace(/^##\s*---\s*$/m, "")
    .trim();
}

// ─── Loaders ─────────────────────────────────────────────────────────────────

function loadCategories(): Category[] {
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

    if (introFile) {
      introRaw = fs.readFileSync(path.join(dirPath, introFile), "utf-8");
      const titleMatch = introRaw.match(/^#\s+\**Πυλώνας \d+:\s*(.+?)\**\s*$/m);
      if (titleMatch) categoryTitle = titleMatch[1].trim();
      relatedService = extractRelatedServices(introRaw);

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
      const cleaned = cleanMarkdownForDisplay(raw);
      const html = marked.parse(cleaned) as string;
      const excerpt = makeExcerpt(html);

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
      });
    }

    categories.push({
      slug: categorySlug(num),
      number: num,
      title: categoryTitle,
      intro,
      relatedService,
      articles,
    });
  }

  return categories;
}

// Memoize at module level (runs once per build)
let _categories: Category[] | null = null;

export function getAllCategories(): Category[] {
  if (!_categories) _categories = loadCategories();
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
