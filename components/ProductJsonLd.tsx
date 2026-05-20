import { rSeriesData } from '@/data/products';
import {
  assertNoFrInJsonLd,
  buildFamilyProductLd,
} from '@/lib/roooll-product-schema';

type FamilyId = 'r-lite' | 'r-ultra' | 'r-core' | 'r-reach' | 'r-max';

type Props = {
  familyId: FamilyId;
  lang: 'zh' | 'en';
  origin: string;
  pagePath: `/cobots/${FamilyId}`;
  description: string;
  imagePathname: string;
};

const SCRIPT_ID: Record<FamilyId, string> = {
  'r-lite': 'jsonld-product-r-lite',
  'r-ultra': 'jsonld-product-r-ultra',
  'r-core': 'jsonld-product-r-core',
  'r-reach': 'jsonld-product-r-reach',
  'r-max': 'jsonld-product-r-max',
};

/**
 * Product JSON-LD for an r‑family route (immersive or future product pages).
 * Names and SKUs use Roooll r‑series labels only — no FR catalog codes in output.
 */
export function ProductJsonLd({ familyId, lang, origin, pagePath, description, imagePathname }: Props) {
  const family = rSeriesData.find((f) => f.id === familyId);
  if (!family) return null;

  const jsonLd = buildFamilyProductLd(family, lang, origin, pagePath, description, imagePathname);
  assertNoFrInJsonLd(jsonLd);

  return (
    <script
      id={SCRIPT_ID[familyId]}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
