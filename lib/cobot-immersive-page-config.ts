/**
 * Shared planning for immersive cobot detail routes (`/cobots/r-lite`, `/cobots/r-ultra`):
 * scroll film + fixed GLB + long narrative.
 *
 * **Single source of truth:**
 * - `app/globals.css` — `.arm-page-root` rhythm, flange/blueprint/application/r family, etc.
 * - `components/cobots/CobotImmersivePageClient.tsx` — immersive shell.
 * - `components/cobots/RCoreLongNarrative.tsx` / `RCoreScrollFilm.tsx` — `pages.r_lite | pages.r_ultra`.
 * - `lib/immersive-series-messages.ts` — `scroll_film` namespace + validation.
 * - `lib/rcore-scroll-cameras.ts` — scroll camera keys (retune per GLB when needed).
 *
 * OG product stills use `robotVariantWebpHdFilename(catalogVariantId)`.
 */

import { ROBOT_IMG_BASE, cobotGlbModels, robotVariantWebpHdFilename } from '@/data/products';

export const COBOT_IMMERSIVE_ROUTES = {
  rLite: '/cobots/r-lite',
  rUltra: '/cobots/r-ultra',
} as const;

/** Primary catalog variant driving r-lite marketing stills + OG share image. */
export const R_LITE_OG_VARIANT_ID = 'fr3-c' as const;

/** r-ultra hero variant for OG / lineup. */
export const R_ULTRA_OG_VARIANT_ID = 'fr30-std' as const;

export function rLiteOgProductImagePath(): string {
  return `${ROBOT_IMG_BASE}/${robotVariantWebpHdFilename(R_LITE_OG_VARIANT_ID)}`;
}

export function rUltraOgProductImagePath(): string {
  return `${ROBOT_IMG_BASE}/${robotVariantWebpHdFilename(R_ULTRA_OG_VARIANT_ID)}`;
}

export function rLiteHeroGlbSrc(): string {
  return cobotGlbModels.rLiteFr3C;
}

export function rUltraHeroGlbSrc(): string {
  return cobotGlbModels.rUltraFr30;
}

/** Measured from exported `*-hd.webp` masters (2730×1536 typical). */
export const R_IMMERSIVE_OG_IMAGE_SIZE = { width: 2730, height: 1536 } as const;
