import type { MetadataRoute } from 'next';

import { getSiteOrigin } from '@/lib/site-origin';
import { isProductionIndexable } from '@/lib/site-seo';

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin().replace(/\/$/, '');
  const indexable = isProductionIndexable();
  return {
    rules: indexable
      ? {
          userAgent: '*',
          allow: '/',
          disallow: ['/zh/r-ecosystem', '/en/r-ecosystem', '/zh/r-ecosystem/', '/en/r-ecosystem/'],
        }
      : { userAgent: '*', disallow: '/' },
    sitemap: indexable ? `${origin}/sitemap.xml` : undefined,
  };
}
