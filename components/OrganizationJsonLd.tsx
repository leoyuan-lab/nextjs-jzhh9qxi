import { SITE_BRAND_ORBIT_LOGO_PATH } from '@/lib/site-seo';

type Props = {
  /** Request origin so JSON-LD absolute URLs match the served host (preview vs prod). */
  origin: string;
};

/**
 * Invisible Organization JSON-LD with `logo` URL — complements on-page nav / raster alts for brand signals.
 */
export function OrganizationJsonLd({ origin }: Props) {
  const base = origin.replace(/\/$/, '');
  const logoUrl = `${base}${SITE_BRAND_ORBIT_LOGO_PATH}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Roooll',
    url: base,
    logo: logoUrl,
  };

  return (
    <script
      id="jsonld-organization-roooll"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
