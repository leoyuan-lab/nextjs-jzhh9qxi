/**
 * `/cobots/r-max` — placeholder product shell. When the immersive page matches r-core, reuse
 * `productSocialMetadata` + `rMaxOgProductImagePath()` from `lib/cobot-immersive-page-config.ts`.
 */
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const page = getMessages(lang).pages.r_max;
  return pageMetadata(page.metaTitleFocus, page.metaDescription, '/cobots/r-max', lang, siteOrigin);
}

export default async function CobotsRMaxLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-cobots-r-max"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/r-max', en: 'r-Max (High Payload)' },
        ]}
      />
      {children}
    </>
  );
}
