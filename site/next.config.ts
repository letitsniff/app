import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

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

function syncBlogImages(): void {
  try {
    const rootDir = getRootDir();
    const blogDir = path.join(rootDir, "docs", "blog");
    const publicImagesDir = path.join(rootDir, "site", "public", "images");

    if (!fs.existsSync(blogDir)) return;
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
    }

    const dirs = fs.readdirSync(blogDir, { withFileTypes: true });
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;
      const imagesPath = path.join(blogDir, dir.name, "images");
      if (!fs.existsSync(imagesPath)) continue;

      const files = fs.readdirSync(imagesPath);
      for (const file of files) {
        if (!/\.(jpe?g|png|webp|avif|svg)$/i.test(file)) continue;
        const src = path.join(imagesPath, file);
        const dest = path.join(publicImagesDir, file);
        if (
          !fs.existsSync(dest) ||
          fs.statSync(src).mtimeMs > fs.statSync(dest).mtimeMs
        ) {
          fs.copyFileSync(src, dest);
        }
      }
    }
  } catch (err) {
    console.error("Error syncing blog images in next.config.ts:", err);
  }
}

// Ensure images are copied to public/ before Next.js compiles or starts dev server
syncBlogImages();

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
