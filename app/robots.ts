import type { MetadataRoute } from 'next';

import { getSiteOrigin } from '@/lib/site-origin';

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin().replace(/\/$/, '');
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${origin}/sitemap.xml`,
  };
}
