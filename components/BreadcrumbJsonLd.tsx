/** One breadcrumb segment; Schema.org item names use `en` (stable for crawlers). */
export type BreadcrumbLdSegment = {
  href: string;
  /** English label in structured data only—never rendered as visible UI. */
  en: string;
};

type Props = {
  /** Unique per layout (<script id>); avoid collisions across stacked layouts. */
  id: string;
  items: BreadcrumbLdSegment[];
};

/**
 * Invisible JSON-LD BreadcrumbList. Emitted inline for crawlers only (no nav UI).
 * Google supports JSON-LD in the `<body>`; App Router avoids multiple `beforeInteractive` Script limits this way.
 */
export function BreadcrumbJsonLd({ id, items }: Props) {
  if (items.length === 0) return null;

  const base =
    typeof process.env.NEXT_PUBLIC_SITE_URL === 'string'
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
      : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => {
      const row: Record<string, unknown> = {
        '@type': 'ListItem',
        position: i + 1,
        name: c.en,
      };
      if (base) {
        row.item = `${base}${c.href.startsWith('/') ? c.href : `/${c.href}`}`;
      }
      return row;
    }),
  };

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
