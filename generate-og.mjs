import puppeteer from 'puppeteer';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, 'assets', 'screenshots', 'og-image.png');

const iconBase64 = readFileSync(join(__dirname, 'assets', 'icon.png')).toString('base64');
const iconDataUri = `data:image/png;base64,${iconBase64}`;

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1200px;
    height: 630px;
    background: #0d0d0d;
    font-family: "Geist", ui-sans-serif, system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  /* Subtle radial glow */
  body::before {
    content: '';
    position: absolute;
    width: 800px;
    height: 500px;
    background: radial-gradient(ellipse at center, rgba(124,106,247,0.18) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* Grid lines */
  body::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(42,42,42,0.4) 1px, transparent 1px),
      linear-gradient(90deg, rgba(42,42,42,0.4) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
  }

  .inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .icon {
    width: 88px;
    height: 88px;
    object-fit: contain;
  }

  .wordmark {
    font-size: 64px;
    font-weight: 700;
    color: #e8e4dc;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .tagline {
    font-size: 24px;
    font-weight: 400;
    color: #9e9a94;
    letter-spacing: -0.01em;
    text-align: center;
  }

  .badge {
    margin-top: 4px;
    background: rgba(124,106,247,0.15);
    border: 1px solid rgba(124,106,247,0.35);
    border-radius: 99px;
    padding: 6px 18px;
    font-size: 14px;
    font-weight: 500;
    color: #7c6af7;
    letter-spacing: 0.01em;
  }
</style>
</head>
<body>
  <div class="inner">
    <img class="icon" src="${iconDataUri}">
    <div class="wordmark">Cairn</div>
    <div class="tagline">Local-first project management with AI built in</div>
    <div class="badge">No account &nbsp;·&nbsp; No cloud &nbsp;·&nbsp; No subscription</div>
  </div>
</body>
</html>`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0' });

// Wait for Geist font to load
await new Promise(r => setTimeout(r, 1500));

const screenshot = await page.screenshot({ type: 'png' });
writeFileSync(OUTPUT, screenshot);
await browser.close();

console.log(`OG image written to ${OUTPUT}`);
