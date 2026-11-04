import path from "path";
import fs from "fs";
import { marked } from "marked";

const SERVICES_DIR = path.join(process.cwd(), "..", "docs", "services");

export interface Service {
  slug: string;
  title: string;
  titleEn: string;
  tagline: string;
  description: string;
  htmlContent: string;
  icon: string; // emoji or icon name
  price?: string;
  duration?: string;
  pillars: number[]; // linked pillar numbers
}

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { data: {}, content: raw };
  const data: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) data[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return { data, content: m[2] };
}

function loadServices(): Service[] {
  if (!fs.existsSync(SERVICES_DIR)) return [];
  const files = fs.readdirSync(SERVICES_DIR).filter((f) => f.endsWith(".md")).sort();
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(SERVICES_DIR, f), "utf-8");
    const { data, content } = parseFrontmatter(raw);
    const slug = f.replace(".md", "");
    const html = marked.parse(content) as string;
    return {
      slug,
      title: data.title || slug,
      titleEn: data.titleEn || "",
      tagline: data.tagline || "",
      description: data.description || "",
      icon: data.icon || "🐾",
      price: data.price,
      duration: data.duration,
      pillars: data.pillars ? data.pillars.split(",").map(Number) : [],
      htmlContent: html,
    };
  });
}

let _services: Service[] | null = null;
export function getAllServices(): Service[] {
  if (!_services) _services = loadServices();
  return _services;
}

export function getServiceBySlug(slug: string): Service | undefined {
  return getAllServices().find((s) => s.slug === slug);
}
