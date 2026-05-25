import { ALL_VARIANT_PUBLIC_SLUGS, variantDetailPathname } from '@/lib/variant-public-slug';

/** Per-model spec deep links under `/cobots/all-cobots-specs/{slug}`. */
export const ALL_COBOTS_VARIANT_DETAIL_PATHS: readonly string[] = ALL_VARIANT_PUBLIC_SLUGS.map(
  (slug) => variantDetailPathname(slug),
);

/**
 * Indexable paths for app/sitemap.ts. Keep in sync when adding new app routes (page files).
 * Includes every /cobots/* and /applications/* marketing route.
 */
export const SITEMAP_PATHS: readonly string[] = [
  '/',
  '/about/story',
  '/applications/education',
  '/applications/manufacturing',
  '/applications/medical-lab',
  '/applications/retail-service',
  '/contact',
  '/legal/privacy',
  '/accessories',
  '/accessories/controllers',
  '/cobots/humanoid',
  '/cobots/r-core',
  '/cobots/r-lite',
  '/cobots/r-ultra',
  '/news',
  '/selector/advisor',
  '/cobots/all-cobots-specs',
  ...ALL_COBOTS_VARIANT_DETAIL_PATHS,
  '/selector/comparison',
  '/support/resources',
  '/support/service',
  '/support/distributors',
];
