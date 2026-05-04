import type { MetadataRoute } from 'next';

import { getSiteOrigin } from '@/lib/site-origin';
import { SITEMAP_PATHS } from '@/lib/site-paths';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin().replace(/\/$/, '');
  const now = new Date();
  const locales = ['zh', 'en'] as const;

  return SITEMAP_PATHS.flatMap((path) =>
    locales.map((locale) => {
      const localizedPath = `/${locale}${path === '/' ? '/' : path}`;
      const url = new URL(localizedPath, `${origin}/`).href;
      const isTopPriorityPath =
        path.startsWith('/cobots/') || path.startsWith('/applications/');
      const priority = path === '/' ? 1 : isTopPriorityPath ? 0.9 : 0.72;
      return {
        url,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority,
      };
    }),
  );
}
