/**
 * 截取与 Advisor 首屏一致的 FR5-C 大特写。
 * 默认输出 PNG；站点法兰段主视觉使用 `r-core-cobot-fr5-c-advisor-hero-flange.webp`（可自 PNG 转 WebP 覆盖）。
 *
 * 运行：npx playwright install chromium && node scripts/capture-rcore-advisor-flange-hero.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public/images/robots');
const outPng = path.join(outDir, 'r-core-cobot-fr5-c-advisor-hero-flange.png');
const glbPath = path.join(root, 'public/models/r-core-cobot-fr5-c.glb');
const glbUrl = `file://${glbPath}`;

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1440px; height: 900px; background: #000; overflow: hidden; }
    .layer {
      position: absolute;
      top: calc(-64px - 64vh);
      bottom: -28vh;
      left: -70vw;
      width: 240vw;
      min-height: 100%;
    }
    .shift {
      position: absolute;
      inset: 0;
      transform: translate(calc(2% + 60vw), calc(12% + 42vh)) scale(1);
      transform-origin: 50% 58%;
    }
    model-viewer {
      width: 100%;
      height: 100%;
      min-height: 900px;
      background: #000;
      --progress-bar-height: 0px;
    }
  </style>
</head>
<body>
  <div class="layer"><div class="shift">
    <model-viewer
      src="${glbUrl}"
      camera-orbit="33deg 78deg 360m"
      camera-target="46% 158% auto"
      field-of-view="10.5deg"
      environment-image="neutral"
      environment-intensity="0.82"
      exposure="0.98"
      shadow-intensity="0.9"
      shadow-softness="1.15"
    ></model-viewer>
  </div></div>
</body>
</html>`;

const tmpHtml = path.join(__dirname, '_capture-advisor-flange.html');
fs.writeFileSync(tmpHtml, html.replace('</motion.div>', '</motion.div>').replace('<motion.div', '<div').replace('</motion.div>', '</div>'));

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`file://${tmpHtml}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => {
      const mv = document.querySelector('model-viewer');
      return mv && mv.loaded;
    },
    { timeout: 120_000 },
  );
  await page.waitForTimeout(1000);
  await page.screenshot({ path: outPng, type: 'png' });
  await browser.close();
  console.log('Wrote', outPng);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
