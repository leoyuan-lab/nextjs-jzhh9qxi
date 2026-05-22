import type { Metadata } from 'next';
import { getSiteLang } from '@/lib/get-site-lang';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  return pageMetadata(
    'Cobot Accessories Ecosystem',
    'Roooll cobot accessories ecosystem—control cabinets, grippers, and fixtures aligned with r-Series collaborative robotic arms.',
    '/accessories',
    lang,
    siteOrigin,
  );
}

export default function AccessoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
