import { getSiteOrigin } from '@/lib/site-origin';

/** Logical path without locale (`/` = home). Matches site router paths under middleware. */
export type BreadcrumbLdSegment = {
  href: string;
  /** English label in structured data only—never rendered as visible UI. */
  en: string;
};

type Props = {
  /** Unique per layout (<script id>); avoid collisions across stacked layouts. */
  id: string;
  /** Physical language prefix aligned with crawled URLs (`/zh/...`, `/en/...`). */
  lang: 'zh' | 'en';
  items: BreadcrumbLdSegment[];
};

function absoluteLocalizedPath(origin: string, lang: 'zh' | 'en', logicalHref: string): string {
  const trimmed = origin.replace(/\/$/, '');
  const pathOnly = logicalHref === '/' ? `/${lang}/` : `/${lang}${logicalHref.startsWith('/') ? logicalHref : `/${logicalHref}`}`;
  return `${trimmed}${pathOnly}`;
}

/**
 * Invisible JSON-LD BreadcrumbList. `item` URLs are absolute and include `/zh/` or `/en/` for parity with live routes.
 */
export function BreadcrumbJsonLd({ id, lang, items }: Props) {
  if (items.length === 0) return null;

  const base = getSiteOrigin().replace(/\/$/, '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.en,
      item: absoluteLocalizedPath(base, lang, c.href),
    })),
  };

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
