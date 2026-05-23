import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_SUPPORT } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const copy = getMessages(lang).pages.support.distributors;
  return pageMetadata(
    copy.metaTitle,
    copy.metaDescription,
    '/support/distributors',
    lang,
    siteOrigin,
  );
}

export default async function SupportDistributorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-support-distributors"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_SUPPORT.href, en: BC_NAV_SUPPORT.en },
          { href: '/support/distributors', en: 'Authorized Distributors' },
        ]}
      />
      {children}
    </>
  );
}
