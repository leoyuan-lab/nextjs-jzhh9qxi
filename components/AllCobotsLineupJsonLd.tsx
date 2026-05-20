import { assertNoFrInJsonLd, buildAllCobotsItemListLd } from '@/lib/roooll-product-schema';

type Props = {
  lang: 'zh' | 'en';
  origin: string;
};

/**
 * ItemList + 11 Product entries for `/cobots/all-cobots-specs` (models without dedicated detail pages).
 */
export function AllCobotsLineupJsonLd({ lang, origin }: Props) {
  const jsonLd = buildAllCobotsItemListLd(lang, origin);
  assertNoFrInJsonLd(jsonLd);

  return (
    <script
      id="jsonld-product-all-cobots-lineup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
