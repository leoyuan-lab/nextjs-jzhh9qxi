import {
  accessoryCatalogItems,
  buildAccessoriesPageJsonLd,
} from '@/lib/accessories-catalog';
import { assertNoFrInJsonLd } from '@/lib/roooll-product-schema';

export function AccessoriesJsonLd({
  lang,
  origin,
}: {
  lang: 'zh' | 'en';
  origin: string;
}) {
  const jsonLd = buildAccessoriesPageJsonLd(lang, origin, accessoryCatalogItems());
  assertNoFrInJsonLd(jsonLd);

  return (
    <script
      id="jsonld-accessories-catalog"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
