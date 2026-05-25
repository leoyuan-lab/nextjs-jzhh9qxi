import { ROBOT_IMG_BASE, robotVariantWebpHdFilename } from '@/data/products';

/** Hero still + default spec wheel variant for `/cobots/r-core`. */
export const R_CORE_LITE_PRIMARY_VARIANT_ID = 'fr5-std' as const;

export const R_CORE_LITE_VARIANT_IDS = ['fr5-std', 'fr5-c', 'fr5-wml'] as const;

export type RCoreLiteVariantId = (typeof R_CORE_LITE_VARIANT_IDS)[number];

/** Explicit HD hero asset for `/cobots/r-core`. */
export const R_CORE_LITE_HERO_HD_PATH = `${ROBOT_IMG_BASE}/${robotVariantWebpHdFilename(R_CORE_LITE_PRIMARY_VARIANT_ID)}`;

export function rCoreLiteHeroImagePath(): string {
  return R_CORE_LITE_HERO_HD_PATH;
}

/** Matches `r-core-cobot-fr5-std-hd.webp` pixel dimensions (OG / Twitter). */
export const R_CORE_LITE_OG_IMAGE_SIZE = { width: 2722, height: 1536 } as const;
