import {
  accessoryItemsByLane,
  buildAccessoriesLaneJsonLd,
  type AccessoryLaneId,
} from '@/lib/accessories-catalog';
import { assertNoFrInJsonLd } from '@/lib/roooll-product-schema';

export function AccessoriesLaneJsonLd({
  lang,
  origin,
  lane,
}: {
  lang: 'zh' | 'en';
  origin: string;
  lane: AccessoryLaneId;
}) {
  const items = accessoryItemsByLane(lane);
  const jsonLd = buildAccessoriesLaneJsonLd(lang, origin, lane, items);
  assertNoFrInJsonLd(jsonLd);

  return (
    <script
      id={`jsonld-accessories-${lane}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
