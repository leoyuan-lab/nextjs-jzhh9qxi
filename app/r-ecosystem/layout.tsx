import type { Metadata } from 'next';

import { getSiteLang } from '@/lib/get-site-lang';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { draftRouteRobots, languageAlternates } from '@/lib/site-seo';

/** R-ecosystem routes are staged — keep out of search indexes until the hub launches. */
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  return {
    robots: draftRouteRobots(),
    alternates: languageAlternates('/r-ecosystem', lang, siteOrigin),
  };
}

export default function REcosystemSegmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
