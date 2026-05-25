import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_ABOUT } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const page = getMessages(lang).pages.newsroom;
  return pageMetadata(page.metaTitleFocus, page.metaDescription, '/news', lang, siteOrigin);
}

export default async function NewsLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-news"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_ABOUT.href, en: BC_NAV_ABOUT.en },
          { href: '/news', en: 'Newsroom' },
        ]}
      />
      {children}
    </>
  );
}
