#!/usr/bin/env node
/**
 * 从 `pages.r_core` 深拷贝 `scroll_film` 等到 `pages.r_max`（沉浸页上架用）。
 * 以后 r-core 改了 scroll_film 结构时：先更新 r_core JSON，再运行：
 *   node scripts/sync-r-max-immersive-locales.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function patch(sf, lang) {
  const o = JSON.parse(JSON.stringify(sf));
  if (lang === 'en') {
    o.section_aria =
      'Immersive r-Max cobot story: advantages, detail views, blueprint, and applications';
    o.scenario_caption =
      'From drawing to duty: r-Max cobot arms in manufacturing, stamping, palletizing, and heavy-assembly workcells.';
    o.scenario_image_alt =
      'r-Max collaborative robot cobot product scene, showing high-payload collaborative robotic arm form factor in a typical deployment.';
    o.blueprint_intro_title = 'Blueprint-first integration for heavy payloads.';
    o.tail_title = 'Bring r-Max to your next line—or your next staging cell.';
  } else {
    o.section_aria = 'r-Max 协作机械臂中段沉浸叙事与规格要点';
    o.scenario_caption =
      '从图纸走进场景：r-Max 重载协作机械臂进入制造、冲压、码垛与重载装配等 Cobot 应用单元。';
    o.scenario_image_alt =
      'r-Max 协作机器人 Cobot 产品场景图，展示高负载协作机械臂外观与典型部署环境。';
    o.blueprint_intro_title = '先对齐图纸，再对齐重载现场。';
    o.tail_title = '把 r-Max 带进下一条产线、下一间重载或码垛单元。';
  }
  return o;
}

for (const lang of ['en', 'zh']) {
  const p = path.join(ROOT, 'locales', `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  const core = j.pages.r_core;
  const prev = j.pages.r_max;
  j.pages.r_max = {
    metaTitleFocus: prev.metaTitleFocus,
    metaDescription: prev.metaDescription,
    immersive_glb_alt: j.alt.hero_rmax,
    inquiry: core.inquiry,
    scenario_subnav: {
      brand_top_aria:
        lang === 'en'
          ? 'Roooll brand strip on r-Max immersive page'
          : 'r-Max 沉浸页顶部品牌展示',
      slogan:
        lang === 'en'
          ? 'From blueprint to bench — strength for your next cell.'
          : '从图纸到重载工位，让下一支协作臂先扛起来。',
      tagline: core.scenario_subnav.tagline,
    },
    hero: {
      subtitle:
        lang === 'en' ? 'Heavy payload. Long reach. One safety story.' : '重载、长臂展，同一套安全叙事。',
    },
    scroll_film: patch(core.scroll_film, lang),
  };
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
}

console.log('Synced pages.r_max immersive fields from r_core (en + zh).');
