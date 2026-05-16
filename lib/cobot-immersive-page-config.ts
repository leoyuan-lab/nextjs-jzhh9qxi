/**
 * Shared planning for immersive cobot detail routes (`/cobots/r-core`, `/cobots/r-max`):
 * scroll film + fixed GLB + long narrative.
 *
 * **Single source of truth (勿复制到 r‑max)：**
 * - `app/globals.css` — 所有 `.arm-page-root …` 下的节奏、标题、法兰/蓝图/Application/r family 等（含移动端 `@media`）。
 * - `app/cobots/r-core/RCorePageClient.tsx` — 沉浸壳；r‑max 上架时设 `immersiveProductId="r-max"`（需先有 locales）。
 * - `components/cobots/RCoreLongNarrative.tsx` / `RCoreScrollFilm.tsx` — 经 `messagesPageKey` 读 `pages.r_core | pages.r_max`。
 * - `lib/immersive-series-messages.ts` — `scroll_film` 命名空间与校验。
 * - `lib/rcore-scroll-cameras.ts` — 卷轴机位（r‑max GLB 不同再参数化）。
 *
 * ## r‑max 接入清单
 *
 * 1. **Locales** — `pages.r_max` 增加与 `r_core` 同结构的 `scroll_film`、`hero`、`immersive_glb_alt`、`scenario_subnav` 等（`readScrollFilmNamespace` 会校验）。
 * 2. **`app/cobots/r-max/page.tsx`** — 与 r‑core 一样挂载 `RCorePageClient`，传入 `immersiveProductId="r-max"`。
 * 3. **`app/cobots/r-max/layout.tsx`** — 对齐 r‑core：`ArmRouteShell`、`ModelViewerScript`、`GlbPreloadLinks`（r‑max hero GLB）、`productSocialMetadata` + `rMaxOgProductImagePath()`。
 * 4. **`data/products.ts` + 材质/相机** — GLB 已可用 `rMaxHeroGlbSrc()`；机位与 `applyAdvisorFlangeMaterial` 仅 r‑core 默认开启，r‑max 另调时改 `RCorePageClient`。
 *
 * 之后在 **r‑core** 做的结构性/样式调整：优先改共享路径（`globals.css`、`RCorePageClient`、`RCoreLongNarrative`、`RCoreScrollFilm` 等）与 `locales` 的 `r_core`。`pages.r_max.scroll_film` 需与 `r_core` 同结构时，可运行 `node scripts/sync-r-max-immersive-locales.mjs` 从 r_core 深拷贝后再改 r‑Max 专用文案。
 *
 * OG product stills should use `robotVariantWebpHdFilename(catalogVariantId)` where possible.
 */

import { ROBOT_IMG_BASE, cobotGlbModels, robotVariantWebpHdFilename } from '@/data/products';

export const COBOT_IMMERSIVE_ROUTES = {
  rCore: '/cobots/r-core',
  rMax: '/cobots/r-max',
} as const;

/** Primary catalog variant driving r-core marketing stills + OG share image. */
export const R_CORE_OG_VARIANT_ID = 'fr5-c' as const;

/** Planned r-max hero variant for OG / lineup (adjust when art direction is final). */
export const R_MAX_OG_VARIANT_ID = 'fr20-std' as const;

export function rCoreOgProductImagePath(): string {
  return `${ROBOT_IMG_BASE}/${robotVariantWebpHdFilename(R_CORE_OG_VARIANT_ID)}`;
}

/** Call when r-max immersive page ships; keep path aligned with `robotVariantWebpHdFilename`. */
export function rMaxOgProductImagePath(): string {
  return `${ROBOT_IMG_BASE}/${robotVariantWebpHdFilename(R_MAX_OG_VARIANT_ID)}`;
}

export function rCoreHeroGlbSrc(): string {
  return cobotGlbModels.rCoreFr5C;
}

export function rMaxHeroGlbSrc(): string {
  return cobotGlbModels.rMaxFr20;
}

/** Measured from exported `*-hd.webp` masters (2722×1536 typical; FR3-C / FR30 may be 2730 wide). */
export const R_CORE_OG_IMAGE_SIZE = { width: 2722, height: 1536 } as const;
