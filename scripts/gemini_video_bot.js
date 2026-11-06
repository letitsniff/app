#!/usr/bin/env node
/**
 * Automated Gemini Video Generator for Let It Sniff Posts.
 * 
 * Features:
 * - Iterates through docs/posts/<folder>
 * - Checks for existing video.mp4 (skips if present)
 * - Opens new tab for each video
 * - Random delays between actions to mimic human interaction
 * - Selects Create video + Portrait 9:16
 * - Submits prompt from prompt.md
 * - Waits and reloads tab for video completion
 * - Downloads video and saves directly to docs/posts/<folder>/video.mp4
 * - Closes tab when done
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const WORKSPACE = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(WORKSPACE, 'docs', 'posts');
const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads');
const CDP_BASE = 'http://localhost:9222';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randDelay(minMs, maxMs) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return sleep(ms);
}

async function evalInTab(ws, expression, awaitPromise = false) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result?.result?.value);
        }
      } catch (e) {
        // ignore other messages
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({
      id,
      method: 'Runtime.evaluate',
      params: { expression, returnByValue: true, awaitPromise }
    }));
  });
}

async function sendCdp(ws, method, params = {}) {
  return new Promise((resolve) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      } catch (e) {}
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function getLatestDownloadMp4(sinceTimestamp) {
  const files = fs.readdirSync(DOWNLOADS_DIR)
    .filter(f => f.endsWith('.mp4') && f.includes('gemini_generated_video'))
    .map(f => {
      const full = path.join(DOWNLOADS_DIR, f);
      const stat = fs.statSync(full);
      return { file: full, mtime: stat.mtimeMs, size: stat.size };
    })
    .filter(item => item.mtime >= sinceTimestamp && item.size > 100000)
    .sort((a, b) => b.mtime - a.mtime);

  return files.length > 0 ? files[0] : null;
}

async function processPost(folderName, singleRun = false) {
  const folderPath = path.join(POSTS_DIR, folderName);
  const targetVideo = path.join(folderPath, 'video.mp4');
  const promptFile = path.join(folderPath, 'prompt.md');

  if (fs.existsSync(targetVideo)) {
    console.log(`⏩ [${folderName}] video.mp4 already exists. Skipping.`);
    return true;
  }

  if (!fs.existsSync(promptFile)) {
    console.log(`⚠️ [${folderName}] prompt.md not found. Skipping.`);
    return false;
  }

  // Extract prompt text
  const promptMd = fs.readFileSync(promptFile, 'utf-8');
  const m = promptMd.match(/```text\s*\n([\s\S]*?)\n```/);
  if (!m) {
    console.log(`⚠️ [${folderName}] Could not parse prompt codeblock.`);
    return false;
  }
  const promptText = m[1].trim();

  console.log(`\n======================================================`);
  console.log(`🚀 Starting generation for: ${folderName}`);
  console.log(`📝 Prompt (${promptText.length} chars): ${promptText.slice(0, 100)}...`);

  const startTime = Date.now();

  // 1. Open new tab
  console.log(`🌐 Opening new Gemini tab...`);
  const createRes = await fetch(`${CDP_BASE}/json/new?https://gemini.google.com/app`, { method: 'PUT' });
  const newTab = await createRes.json();
  const tabId = newTab.id;
  const wsUrl = newTab.webSocketDebuggerUrl;

  await randDelay(4000, 6000);

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  try {
    // 2. Click Plus button (Upload & tools)
    console.log(`👉 Clicking '+' (Upload & tools)...`);
    await evalInTab(ws, `
      (() => {
        const btn = document.querySelector("button[aria-label*='Upload & tools'], button[aria-label*='Tools'], button[aria-label*='Add']");
        if (btn) btn.click();
        return !!btn;
      })()
    `);
    await randDelay(800, 1500);

    // 3. Click 'Create video'
    console.log(`👉 Clicking 'Create video'...`);
    await evalInTab(ws, `
      (() => {
        const vBtn = Array.from(document.querySelectorAll("button, [role=menuitemcheckbox], mat-list-item")).find(el => el.innerText.includes("Create video"));
        if (vBtn) vBtn.click();
        return !!vBtn;
      })()
    `);
    await randDelay(1000, 2000);

    // 4. Select Portrait (9:16)
    console.log(`👉 Setting Aspect Ratio to Portrait (9:16)...`);
    await evalInTab(ws, `
      (() => {
        const aspectBtn = document.querySelector("button[aria-label*='Aspect ratio']");
        if (aspectBtn) aspectBtn.click();
        return !!aspectBtn;
      })()
    `);
    await randDelay(500, 1000);

    await evalInTab(ws, `
      (() => {
        const portrait = Array.from(document.querySelectorAll("[role=menuitemradio], [role=menuitem], .mat-mdc-menu-item")).find(i => i.innerText.includes("Portrait") || i.innerText.includes("9:16"));
        if (portrait) portrait.click();
        return !!portrait;
      })()
    `);
    await randDelay(800, 1500);

    // 5. Insert Prompt
    console.log(`✍️ Inserting prompt into Quill editor...`);
    await evalInTab(ws, `
      (() => {
        const editor = document.querySelector(".ql-editor");
        if (!editor) return false;
        editor.focus();
        document.execCommand("selectAll", false, null);
        document.execCommand("insertText", false, ${JSON.stringify(promptText)});
        return true;
      })()
    `);
    await randDelay(1200, 2200);

    // 6. Click Send
    console.log(`🚀 Clicking Send message...`);
    const sent = await evalInTab(ws, `
      (() => {
        const sendBtn = document.querySelector("button[aria-label='Send message']");
        if (sendBtn) {
          sendBtn.click();
          return true;
        }
        return false;
      })()
    `);
    if (!sent) {
      console.log(`❌ Failed to click Send message.`);
      return false;
    }

    // 7. Initial wait & check for immediate error / limit
    await randDelay(4000, 7000);
    const initialCheck = await evalInTab(ws, `
      (() => {
        const resp = document.querySelector("model-response");
        return resp ? resp.innerText.trim() : "";
      })()
    `);
    console.log(`ℹ️ Initial response: ${initialCheck.slice(0, 120)}...`);

    if (initialCheck.includes("limit resets")) {
      console.log(`⚠️ QUOTA LIMIT HIT: ${initialCheck}`);
      return "LIMIT_HIT";
    }

    // 8. Polling loop with refresh as instructed by user
    console.log(`⏳ Waiting for video rendering (~60-90s initial render wait)...`);
    await randDelay(65000, 80000);

    let videoFound = false;
    let attempts = 0;
    const maxAttempts = 8; // poll for up to ~4-5 minutes

    while (!videoFound && attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 [Attempt ${attempts}/${maxAttempts}] Reloading page to reveal video...`);
      await sendCdp(ws, 'Page.reload', { ignoreCache: true });
      await randDelay(5000, 8000);

      const check = await evalInTab(ws, `
        (() => {
          const video = document.querySelector("video");
          const dlBtn = document.querySelector("button[aria-label*='Download video']");
          const resp = document.querySelector("model-response");
          return {
            hasVideo: !!video,
            src: video ? video.src : null,
            hasDlBtn: !!dlBtn,
            text: resp ? resp.innerText.trim().slice(0, 100) : ""
          };
        })()
      `);

      console.log(`🔍 Check result: video=${check?.hasVideo}, dlBtn=${check?.hasDlBtn}, text=${check?.text}`);

      if (check?.hasVideo || check?.hasDlBtn) {
        console.log(`🎉 Video rendered successfully! Initiating download...`);
        videoFound = true;

        // Click Download video button
        await evalInTab(ws, `
          (() => {
            const dlBtn = document.querySelector("button[aria-label*='Download video']");
            if (dlBtn) dlBtn.click();
          })()
        `);

        // Wait for file in ~/Downloads
        console.log(`📥 Waiting for download to complete in ~/Downloads...`);
        let downloaded = null;
        for (let w = 0; w < 15; w++) {
          await sleep(2000);
          downloaded = getLatestDownloadMp4(startTime);
          if (downloaded) break;
        }

        if (downloaded) {
          console.log(`✅ Download complete: ${downloaded.file} (${downloaded.size} bytes)`);
          fs.copyFileSync(downloaded.file, targetVideo);
          console.log(`💾 Saved to: ${targetVideo}`);

          // Auto-commit on every video
          try {
            const { execSync } = require('child_process');
            execSync(`git add "docs/posts/${folderName}/video.mp4"`);
            execSync(`git commit -m "feat(posts): add video for ${folderName.replace(/"/g, '\\"')}"`);
            console.log(`📌 Git committed video for: ${folderName}`);
          } catch (gitErr) {
            console.log(`⚠️ Git commit error:`, gitErr.message);
          }

          return true;
        } else {
          console.log(`⚠️ Download click triggered, but file not detected yet in Downloads.`);
          return false;
        }
      }

      await randDelay(15000, 25000);
    }

    if (!videoFound) {
      console.log(`❌ Timeout waiting for video in: ${folderName}`);
      return false;
    }

  } finally {
    // Close tab
    try {
      ws.close();
      await fetch(`${CDP_BASE}/json/close/${tabId}`);
      console.log(`🔒 Closed tab ${tabId}`);
    } catch (e) {}
  }

  return true;
}

async function main() {
  const folders = fs.readdirSync(POSTS_DIR)
    .filter(f => fs.statSync(path.join(POSTS_DIR, f)).isDirectory())
    .sort();

  console.log(`Found ${folders.length} post folders.`);

  // Check how many already have videos
  const completed = folders.filter(f => fs.existsSync(path.join(POSTS_DIR, f, 'video.mp4'))).length;
  console.log(`Status: ${completed}/${folders.length} videos completed.`);

  for (const folder of folders) {
    const targetVideo = path.join(POSTS_DIR, folder, 'video.mp4');
    if (fs.existsSync(targetVideo)) {
      continue;
    }

    const res = await processPost(folder);
    if (res === "LIMIT_HIT") {
      console.log(`🛑 Stopping automated batch because Gemini video quota is reached.`);
      break;
    }

    // Delay between videos (20-40 seconds)
    console.log(`☕ Cooling down before next video...`);
    await randDelay(20000, 40000);
  }

  console.log(`\n🎉 Bot run finished!`);
}

// Allow running for single post via arg: node gemini_video_bot.js "002 - ..."
const singleArg = process.argv[2];
if (singleArg) {
  processPost(singleArg, true).then(() => process.exit(0));
} else {
  main().then(() => process.exit(0));
}
