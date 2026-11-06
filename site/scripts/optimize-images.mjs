import fs from "fs";
import path from "path";
import sharp from "sharp";

function getRootDir() {
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
const SERVICES_IMAGES_DIR = path.join(ROOT_DIR, "docs", "services", "images");
const SITE_IMAGES_DIR = path.join(ROOT_DIR, "docs", "images");
const PUBLIC_IMAGES_DIR = path.join(ROOT_DIR, "site", "public", "images");

async function optimizeImages() {
  const startTime = Date.now();
  console.log("📸 [Image Optimizer] Starting build-time image optimization...");

  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  }

  const manifestPath = path.join(PUBLIC_IMAGES_DIR, ".manifest.json");
  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {
      manifest = {};
    }
  }

  const tasks = [];

  // Helper to collect tasks from an images directory
  function collectFromDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (!/\.(jpe?g|png)$/i.test(file)) continue;

      const srcPath = path.join(dirPath, file);
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);

      const destOrig = path.join(PUBLIC_IMAGES_DIR, file);
      const destCard = path.join(PUBLIC_IMAGES_DIR, `${baseName}-card.webp`);
      const destHero = path.join(PUBLIC_IMAGES_DIR, `${baseName}-hero.webp`);

      tasks.push({
        file,
        srcPath,
        destOrig,
        destCard,
        destHero,
      });
    }
  }

  // 1. Blog pillar images (scans recursively)
  function collectBlogImages(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === "images") {
        collectFromDir(path.join(dir, entry.name));
      } else {
        collectBlogImages(path.join(dir, entry.name));
      }
    }
  }
  collectBlogImages(BLOG_DIR);

  // 2. Services images
  collectFromDir(SERVICES_IMAGES_DIR);

  // 3. Site-wide images (hero, etc.)
  collectFromDir(SITE_IMAGES_DIR);

  console.log(`🔍 [Image Optimizer] Found ${tasks.length} master images across docs.`);

  let processedCount = 0;
  let skippedCount = 0;
  let savedBytes = 0;

  // Process with concurrency limit of 8 for optimal CPU utilization
  const CONCURRENCY = 8;
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const chunk = tasks.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (task) => {
        const srcStat = fs.statSync(task.srcPath);
        const origExists = fs.existsSync(task.destOrig);
        const cardExists = fs.existsSync(task.destCard);
        const heroExists = fs.existsSync(task.destHero);

        const cardFresh = cardExists && fs.statSync(task.destCard).mtimeMs >= srcStat.mtimeMs;
        const heroFresh = heroExists && fs.statSync(task.destHero).mtimeMs >= srcStat.mtimeMs;
        const cached = manifest[task.file];

        const isFresh =
          origExists &&
          cardExists &&
          heroExists &&
          ((cached && cached.size === srcStat.size) || (cardFresh && heroFresh));

        if (isFresh) {
          if (!cached || cached.size !== srcStat.size) {
            manifest[task.file] = { size: srcStat.size };
          }
          skippedCount++;
          return;
        }

        // 1. Copy original master file if missing or outdated
        if (!origExists || srcStat.mtimeMs > fs.statSync(task.destOrig).mtimeMs || (cached && cached.size !== srcStat.size)) {
          fs.copyFileSync(task.srcPath, task.destOrig);
        }

        // 2. Check and generate derivatives using sharp
        try {
          const inputBuffer = fs.readFileSync(task.srcPath);

          if (!cardFresh || (cached && cached.size !== srcStat.size)) {
            await sharp(inputBuffer, { failOn: "none" })
              .resize({ width: 720, withoutEnlargement: true })
              .webp({ quality: 80, effort: 4 })
              .toFile(task.destCard);
          }

          if (!heroFresh || (cached && cached.size !== srcStat.size)) {
            await sharp(inputBuffer, { failOn: "none" })
              .resize({ width: 1400, withoutEnlargement: true })
              .webp({ quality: 82, effort: 4 })
              .toFile(task.destHero);
          }

          manifest[task.file] = { size: srcStat.size };
          processedCount++;
          const origSize = srcStat.size;
          const cardSize = fs.statSync(task.destCard).size;
          savedBytes += origSize - cardSize;
        } catch (err) {
          console.error(`❌ Error processing image ${task.file}:`, err);
        }
      })
    );
  }

  try {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write image manifest:", err);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(
    `✨ [Image Optimizer] Done in ${duration}s. Processed: ${processedCount}, Up-to-date: ${skippedCount}. Estimated card savings: ${(
      savedBytes /
      (1024 * 1024)
    ).toFixed(1)} MB.`
  );
}

optimizeImages().catch((err) => {
  console.error("❌ Fatal error in image optimizer:", err);
  process.exit(1);
});
