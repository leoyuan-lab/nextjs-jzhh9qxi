import {
  allLineupVariantIds,
  buildVariantProductLd,
} from '@/lib/roooll-product-schema';
import { variantDetailPathnameForVariantId } from '@/lib/variant-public-slug';

/** ItemList + 11 Product entries — each variant links to its detail URL. */
export function buildAllCobotsItemListLd(lang: 'zh' | 'en', origin: string) {
  const base = origin.replace(/\/$/, '');
  const pageUrl = new URL(`/${lang}/cobots/all-cobots-specs`, `${base}/`).href;
  const ids = allLineupVariantIds();

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'zh' ? 'Roooll r 系列全系协作机器人' : 'Roooll r-Series collaborative cobot lineup',
    description:
      lang === 'zh'
        ? 'r-Lite、r-Core、r-Reach、r-Max、r-Ultra 全系机型规格一览。'
        : 'Full r-Lite, r-Core, r-Reach, r-Max, and r-Ultra collaborative robot lineup and specifications.',
    url: pageUrl,
    numberOfItems: ids.length,
    itemListElement: ids.map((variantId, index) => {
      const variantPageUrl = new URL(
        `/${lang}${variantDetailPathnameForVariantId(variantId)}`,
        `${base}/`,
      ).href;
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: buildVariantProductLd(variantId, lang, origin, variantPageUrl),
      };
    }),
  };
}
