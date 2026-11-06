import path from "path";
import fs from "fs";
import { marked } from "marked";
import { resolveImageUrl } from "./content";

function getRootDir(): string {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, "docs", "services"))) {
    return cwd;
  }
  if (fs.existsSync(path.join(cwd, "..", "docs", "services"))) {
    return path.join(cwd, "..");
  }
  return cwd;
}

const ROOT_DIR = getRootDir();
const SERVICES_DIR = path.join(ROOT_DIR, "docs", "services");

export interface Service {
  slug: string;
  title: string;
  titleEn: string;
  tagline: string;
  description: string;
  htmlContent: string;
  icon: string; // emoji or icon name
  image?: string;
  price?: string;
  duration?: string;
  pillars: number[]; // linked pillar numbers
}

function extractField(raw: string, fieldNames: string[]): string {
  for (const name of fieldNames) {
    const regex = new RegExp(`\\*\\*${name}:\\*\\*\\s*([^\\n]+)`, "u");
    const m = raw.match(regex);
    if (m) return m[1].trim();
  }
  return "";
}

function extractTitle(raw: string, defaultSlug: string): string {
  const m = raw.match(/^#\s+\**(.+?)\**\s*$/m);
  if (m) return m[1].replace(/\\/g, "").trim();
  const f = extractField(raw, ["Τίτλος", "Title", "title"]);
  return f || defaultSlug;
}

function cleanServiceContent(raw: string): string {
  let clean = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  clean = clean.replace(/^#\s+[^\n]+\n?/, "");
  const fields = [
    "Τίτλος \\(Αγγλικά\\)", "TitleEn", "titleEn",
    "Tagline", "tagline",
    "Περιγραφή", "Description", "description",
    "Icon", "icon", "Εικονίδιο",
    "Εικόνα", "Image", "image",
    "Τιμή", "Price", "price",
    "Διάρκεια", "Duration", "duration",
    "Πυλώνες", "Pillars", "pillars",
  ];
  for (const f of fields) {
    const regex = new RegExp(`\\*\\*${f}:\\*\\*[^\\n]+\\n?`, "g");
    clean = clean.replace(regex, "");
  }
  return clean.trim();
}

function parseServiceMetadata(raw: string, slug: string): Service {
  // Support legacy YAML frontmatter if present
  const yamlData: Record<string, string> = {};
  const fmM = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fmM) {
    for (const line of fmM[1].split("\n")) {
      const kv = line.match(/^(\w+):\s*(.+)$/);
      if (kv) yamlData[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
    }
  }

  const title = yamlData.title || extractTitle(raw, slug);
  const titleEn = yamlData.titleEn || extractField(raw, ["Τίτλος (Αγγλικά)", "TitleEn", "titleEn"]);
  const tagline = yamlData.tagline || extractField(raw, ["Tagline", "tagline"]);
  const description = yamlData.description || extractField(raw, ["Περιγραφή", "Description", "description"]);
  const icon = yamlData.icon || extractField(raw, ["Icon", "icon", "Εικονίδιο"]) || "🐾";
  const imageField = yamlData.image || extractField(raw, ["Εικόνα", "Image", "image"]);
  let image = imageField ? resolveImageUrl(imageField) : undefined;
  if (!image) {
    const serviceImgPath = path.join(ROOT_DIR, "docs", "services", "images", `${slug}.jpg`);
    if (fs.existsSync(serviceImgPath)) {
      image = `/images/${slug}.jpg`;
    }
  }
  const price = yamlData.price || extractField(raw, ["Τιμή", "Price", "price"]) || undefined;
  const duration = yamlData.duration || extractField(raw, ["Διάρκεια", "Duration", "duration"]) || undefined;
  const pillarsRaw = yamlData.pillars || extractField(raw, ["Πυλώνες", "Pillars", "pillars"]);
  const pillars = pillarsRaw
    ? pillarsRaw.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n))
    : [];

  const cleanedContent = cleanServiceContent(raw);
  const htmlContent = marked.parse(cleanedContent) as string;

  return {
    slug,
    title,
    titleEn,
    tagline,
    description,
    icon,
    image,
    price,
    duration,
    pillars,
    htmlContent,
  };
}

function loadServices(): Service[] {
  if (!fs.existsSync(SERVICES_DIR)) return [];
  const files = fs.readdirSync(SERVICES_DIR).filter((f) => f.endsWith(".md")).sort();
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(SERVICES_DIR, f), "utf-8");
    const slug = f.replace(".md", "");
    return parseServiceMetadata(raw, slug);
  });
}

let _services: Service[] | null = null;
export function getAllServices(): Service[] {
  if (process.env.NODE_ENV === "production" && _services) {
    return _services;
  }
  _services = loadServices();
  return _services;
}

export function getServiceBySlug(slug: string): Service | undefined {
  return getAllServices().find((s) => s.slug === slug);
}
