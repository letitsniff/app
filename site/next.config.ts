import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

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
    const scriptPath = path.join(rootDir, "site", "scripts", "optimize-images.mjs");
    if (fs.existsSync(scriptPath)) {
      execFileSync(process.execPath, [scriptPath], {
        stdio: "inherit",
        env: { ...process.env, ROOT_DIR: rootDir },
      });
      return;
    }

    const blogDir = path.join(rootDir, "docs", "blog");
    const servicesImagesDir = path.join(rootDir, "docs", "services", "images");
    const siteImagesDir = path.join(rootDir, "docs", "images");
    const publicImagesDir = path.join(rootDir, "site", "public", "images");

    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
    }

    const copyFrom = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (!/\.(jpe?g|png|webp|avif|svg)$/i.test(file)) continue;
        const src = path.join(dir, file);
        const dest = path.join(publicImagesDir, file);
        if (
          !fs.existsSync(dest) ||
          fs.statSync(src).mtimeMs > fs.statSync(dest).mtimeMs
        ) {
          fs.copyFileSync(src, dest);
        }
      }
    };

    const copyImagesRecursively = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (entry.name === "images") {
            copyFrom(path.join(dir, entry.name));
          } else {
            copyImagesRecursively(path.join(dir, entry.name));
          }
        }
      }
    };

    if (fs.existsSync(blogDir)) {
      copyImagesRecursively(blogDir);
    }
    copyFrom(servicesImagesDir);
    copyFrom(siteImagesDir);
  } catch (err) {
    console.error("Error syncing and optimizing blog images in next.config.ts:", err);
  }
}

// Ensure images are copied and optimized to public/ before Next.js compiles or starts dev server
syncBlogImages();

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
