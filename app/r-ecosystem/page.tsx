import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { SeoBriefLanding } from '@/components/SeoBriefLanding';
import { BC_HOME, BC_NAV_R_ECOSYSTEM } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const p = getMessages(lang).pages.r_ecosystem.hub;
  return pageMetadata(p.metaTitleFocus, p.metaDescription, '/r-ecosystem');
}

export default async function REcosystemHubPage() {
  const lang = await getSiteLang();
  const zh = getMessages('zh').pages.r_ecosystem.hub;
  const en = getMessages('en').pages.r_ecosystem.hub;
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-r-ecosystem-hub"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_R_ECOSYSTEM.href, en: BC_NAV_R_ECOSYSTEM.en },
        ]}
      />
      <SeoBriefLanding
        copy={{
          zh: { title: zh.h1, body: zh.body, ctaHome: zh.ctaHome },
          en: { title: en.h1, body: en.body, ctaHome: en.ctaHome },
        }}
      />
    </>
  );
}
