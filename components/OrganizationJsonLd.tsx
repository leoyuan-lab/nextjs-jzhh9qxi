import { SITE_BRAND_ORBIT_LOGO_PATH } from '@/lib/site-seo';
import { getMessages, type AppLocale } from '@/lib/messages';

type Props = {
  origin: string;
  lang: AppLocale;
};

/**
 * Invisible Organization JSON-LD — entity signals for search and generative engines.
 */
export function OrganizationJsonLd({ origin, lang }: Props) {
  const base = origin.replace(/\/$/, '');
  const logoUrl = `${base}${SITE_BRAND_ORBIT_LOGO_PATH}`;
  const org = getMessages(lang).organization;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: 'Roooll',
    url: base,
    logo: logoUrl,
    description: org.description,
    email: org.contactEmail,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: org.contactType,
        email: org.contactEmail,
        availableLanguage: ['English', 'Chinese'],
        areaServed: org.areaServed,
      },
    ],
    knowsAbout: org.knowsAbout,
  };

  return (
    <script
      id="jsonld-organization-roooll"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
