import {
  robotSpecDisplayText,
  robotVariantById,
  robotFamilyForVariant,
  specLabels,
} from '@/data/products';
import {
  robotVariantSchemaProductName,
  rooollVariantShortLabel,
  stripFrModelCodes,
} from '@/lib/roooll-product-schema';

type Props = {
  variantId: string;
  lang: 'zh' | 'en';
};

/** Crawlable variant copy for `/cobots/all-cobots-specs/{slug}` — visually hidden; modal UI unchanged. */
export function AllCobotsVariantSeoContent({ variantId, lang }: Props) {
  const variant = robotVariantById[variantId];
  const family = robotFamilyForVariant(variantId);
  const short = rooollVariantShortLabel(variant.name);
  const title = robotVariantSchemaProductName(variantId, lang);
  const description = stripFrModelCodes(lang === 'zh' ? variant.description.zh : variant.description.en);

  return (
    <article className="sr-only" aria-label={title}>
      <h1>{title}</h1>
      <p>
        {family.displayName}
        {short ? ` · ${short}` : ''}
      </p>
      {description ? <p>{description}</p> : null}
      <dl>
        <dt>{specLabels.payload[lang]}</dt>
        <dd>{robotSpecDisplayText(variant.payload, lang)}</dd>
        <dt>{specLabels.reach[lang]}</dt>
        <dd>{robotSpecDisplayText(variant.reach, lang)}</dd>
        <dt>{specLabels.repeatability[lang]}</dt>
        <dd>{robotSpecDisplayText(variant.repeatability, lang)}</dd>
        <dt>{specLabels.weight[lang]}</dt>
        <dd>{robotSpecDisplayText(variant.weight, lang)}</dd>
        <dt>{specLabels.ip[lang]}</dt>
        <dd>{robotSpecDisplayText(variant.ipRating, lang)}</dd>
      </dl>
    </article>
  );
}
