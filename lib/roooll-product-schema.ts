import {
  descriptionSnippet,
  robotFamilyForVariant,
  robotVariantById,
  robotVariantWebpFilename,
  rSeriesData,
  type RobotFamily,
  type RobotVariant,
} from '@/data/products';

/** Remove industrial FR-style tokens from visitor-facing copy (JSON-LD, schema names). */
export function stripFrModelCodes(text: string): string {
  return text
    .replace(/fr\d{1,2}(?:-[a-z0-9]+)*/gi, '')
    .replace(/\bFR\d{1,2}(?:-[A-Z0-9]+)*/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([，。；、])/g, '$1')
    .trim();
}

/** Variant line label without FR tokens or parenthetical OEM notes. */
export function rooollVariantShortLabel(variantName: string): string {
  let s = variantName
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim();
  s = s.replace(/\bstandard\b/gi, '').replace(/\s+/g, ' ').trim();
  return stripFrModelCodes(s);
}

/** Public Product name: r-Lite / r-Core … + optional variant line (no FR). */
export function robotVariantSchemaProductName(variantId: string, lang: 'zh' | 'en'): string {
  const v = robotVariantById[variantId];
  const fam = robotFamilyForVariant(variantId);
  const short = rooollVariantShortLabel(v.name);
  if (lang === 'zh') {
    return short ? `${fam.displayName} 协作机器人 — ${short}` : `${fam.displayName} 协作机器人`;
  }
  return short
    ? `${fam.displayName} Collaborative Robot — ${short}`
    : `${fam.displayName} Collaborative Robot`;
}

/** Stable Roooll SKU for schema (family + suffix, no `fr` prefix). */
export function robotVariantSchemaSku(familyId: string, variantId: string): string {
  const suffix = variantId.replace(/^fr\d+-?/i, '').replace(/^fr\d+$/i, 'series') || 'std';
  return `roooll-${familyId}-${suffix}`;
}

export function robotVariantSchemaDescription(variantId: string, lang: 'zh' | 'en'): string {
  const v = robotVariantById[variantId];
  const raw = lang === 'zh' ? v.description.zh : v.description.en;
  const purpose = stripFrModelCodes(descriptionSnippet(raw, lang));
  const name = robotVariantSchemaProductName(variantId, lang);
  if (lang === 'zh') {
    return `${name}：负载 ${stripFrModelCodes(v.payload)}，工作半径 ${v.reach}，重复定位精度 ${v.repeatability}。${purpose}`;
  }
  return `${name}: payload ${stripFrModelCodes(v.payload)}, reach ${v.reach}, repeatability ${v.repeatability}. ${purpose}`;
}

export function buildVariantProductLd(
  variantId: string,
  lang: 'zh' | 'en',
  origin: string,
  pageUrl: string,
) {
  const v = robotVariantById[variantId];
  const fam = robotFamilyForVariant(variantId);
  const base = origin.replace(/\/$/, '');
  const imagePath = `/images/robots/${robotVariantWebpFilename(variantId)}`;
  const imageUrl = new URL(imagePath, `${base}/`).href;

  return {
    '@type': 'Product',
    name: robotVariantSchemaProductName(variantId, lang),
    description: robotVariantSchemaDescription(variantId, lang),
    image: imageUrl,
    url: pageUrl,
    sku: robotVariantSchemaSku(fam.id, variantId),
    brand: { '@type': 'Brand', name: 'Roooll' },
    manufacturer: { '@type': 'Organization', name: 'Roooll' },
    category: lang === 'zh' ? '协作机器人' : 'Collaborative Robot',
    offers: {
      '@type': 'Offer',
      sku: robotVariantSchemaSku(fam.id, variantId),
      availability: 'https://schema.org/InStock',
      url: pageUrl,
      seller: { '@type': 'Organization', name: 'Roooll' },
    },
  };
}

export function buildFamilyProductLd(
  family: RobotFamily,
  lang: 'zh' | 'en',
  origin: string,
  pagePath: string,
  pageDescription: string,
  imagePathname: string,
) {
  const base = origin.replace(/\/$/, '');
  const pageUrl = new URL(`/${lang}${pagePath}`, `${base}/`).href;
  const imageUrl = new URL(
    imagePathname.startsWith('/') ? imagePathname : `/${imagePathname}`,
    `${base}/`,
  ).href;
  const cleanPageDesc = stripFrModelCodes(pageDescription);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name:
      lang === 'zh'
        ? `${family.displayName} 协作机器人系列`
        : `${family.displayName} Collaborative Robot Line`,
    description: cleanPageDesc,
    image: imageUrl,
    url: pageUrl,
    brand: { '@type': 'Brand', name: 'Roooll' },
    manufacturer: { '@type': 'Organization', name: 'Roooll' },
    category: lang === 'zh' ? '协作机器人' : 'Collaborative Robot',
    isVariantOf: {
      '@type': 'ProductGroup',
      name: lang === 'zh' ? 'Roooll r 系列' : 'Roooll r-Series',
      brand: { '@type': 'Brand', name: 'Roooll' },
    },
    offers: family.variants.map((variant: RobotVariant) => ({
      '@type': 'Offer',
      sku: robotVariantSchemaSku(family.id, variant.id),
      name: robotVariantSchemaProductName(variant.id, lang),
      availability: 'https://schema.org/InStock',
      url: pageUrl,
    })),
  };
}

/** All lineup variants (11 models) for `/cobots/all-cobots-specs`. */
export function allLineupVariantIds(): string[] {
  return rSeriesData.flatMap((f) => f.variants.map((v) => v.id));
}

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
    itemListElement: ids.map((variantId, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: buildVariantProductLd(variantId, lang, origin, pageUrl),
    })),
  };
}

/** Guard: JSON-LD must not leak FR catalog tokens in string values. */
export function assertNoFrInJsonLd(json: unknown): void {
  if (process.env.NODE_ENV === 'production') return;
  const s = JSON.stringify(json);
  if (/\bFR\d/i.test(s) || /\bfr\d{1,2}-/i.test(s)) {
    console.warn('[product-jsonld] FR token leaked into schema output');
  }
}
