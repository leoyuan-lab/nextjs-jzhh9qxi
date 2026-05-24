import {
  assertNoFrInJsonLd,
  buildVariantProductLd,
} from '@/lib/roooll-product-schema';
import { variantDetailPathnameForVariantId } from '@/lib/variant-public-slug';

type Props = {
  variantId: string;
  lang: 'zh' | 'en';
  origin: string;
};

/** Product JSON-LD for a single lineup variant detail URL. */
export function VariantProductJsonLd({ variantId, lang, origin }: Props) {
  const base = origin.replace(/\/$/, '');
  const pagePath = variantDetailPathnameForVariantId(variantId);
  const pageUrl = new URL(`/${lang}${pagePath}`, `${base}/`).href;
  const jsonLd = {
    '@context': 'https://schema.org',
    ...buildVariantProductLd(variantId, lang, origin, pageUrl),
  };
  assertNoFrInJsonLd(jsonLd);

  const scriptId = `jsonld-product-variant-${variantId.replace(/[^a-z0-9]+/gi, '-')}`;

  return (
    <script
      id={scriptId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
