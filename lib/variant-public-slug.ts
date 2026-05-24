import { rSeriesData } from '@/data/products';

/** Visitor-facing compare / share tokens — never expose internal `fr*` ids in URLs. */
const VARIANT_PUBLIC_SLUG_BY_ID: Record<string, string> = {
  'fr3-std': 'r-lite',
  'fr3-c': 'r-lite-c',
  'fr3-wms': 'r-lite-wms',
  'fr3-wml': 'r-lite-wml',
  'fr5-std': 'r-core',
  'fr5-c': 'r-core-c',
  'fr5-wml': 'r-core-wml',
  'fr10-std': 'r-reach',
  'fr16-std': 'r-max-16',
  'fr20-std': 'r-max-20',
  'fr30-std': 'r-ultra',
};

const PUBLIC_SLUG_TO_VARIANT_ID = Object.fromEntries(
  Object.entries(VARIANT_PUBLIC_SLUG_BY_ID).map(([id, slug]) => [slug, id]),
) as Record<string, string>;

/** All catalog variant ids (same order as lineup). */
export const ALL_VARIANT_IDS = rSeriesData.flatMap((family) => family.variants.map((v) => v.id));

export function variantPublicSlug(variantId: string): string {
  const slug = VARIANT_PUBLIC_SLUG_BY_ID[variantId];
  if (!slug) throw new Error(`Missing public slug for variant id: ${variantId}`);
  return slug;
}

/** Resolve a public slug token to internal variant id. Unknown tokens return null. */
export function variantIdFromPublicUrlToken(token: string): string | null {
  const trimmed = token.trim().toLowerCase();
  if (!trimmed) return null;
  return PUBLIC_SLUG_TO_VARIANT_ID[trimmed] ?? null;
}

/** All visitor-facing slugs (11 lineup models), stable sitemap / static-params order. */
export const ALL_VARIANT_PUBLIC_SLUGS: readonly string[] = ALL_VARIANT_IDS.map((id) =>
  variantPublicSlug(id),
);

const ALL_COBOTS_SPECS_BASE = '/cobots/all-cobots-specs';

/** Logical path for a variant detail deep link (no locale prefix). */
export function variantDetailPathname(slug: string): `${typeof ALL_COBOTS_SPECS_BASE}/${string}` {
  return `${ALL_COBOTS_SPECS_BASE}/${slug}`;
}

export function variantDetailPathnameForVariantId(variantId: string): string {
  return variantDetailPathname(variantPublicSlug(variantId));
}
