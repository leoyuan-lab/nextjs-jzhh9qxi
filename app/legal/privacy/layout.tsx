import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const p = getMessages(lang).pages.privacy;
  return pageMetadata(p.metaTitleFocus, p.metaDescription, '/legal/privacy', lang, siteOrigin);
}

export default async function PrivacyLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-legal-privacy"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: '/legal/privacy', en: 'Privacy Policy' },
        ]}
      />
      {children}
    </>
  );
}
