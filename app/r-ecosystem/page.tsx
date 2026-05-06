import type { Metadata } from 'next';
import Image from 'next/image';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { SeoBriefLanding } from '@/components/SeoBriefLanding';
import { BC_HOME, BC_NAV_R_ECOSYSTEM } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const p = getMessages(lang).pages.r_ecosystem.hub;
  return pageMetadata(p.metaTitleFocus, p.metaDescription, '/r-ecosystem', lang, siteOrigin);
}

export default async function REcosystemHubPage() {
  const lang = await getSiteLang();
  const zhMsgs = getMessages('zh');
  const enMsgs = getMessages('en');
  const zh = zhMsgs.pages.r_ecosystem.hub;
  const en = enMsgs.pages.r_ecosystem.hub;
  const activeAlt = getMessages(lang).alt;
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
      <section className="ecosystem-visual-grid" aria-label="ecosystem visuals">
        <div className="ecosystem-visual-card">
          <Image
            src="/images/robots/r-core-cobot-fr5-c.png"
            alt={activeAlt.ecosystem_os}
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain"
          />
        </div>
        <div className="ecosystem-visual-card">
          <Image
            src="/images/robots/r-max-cobot-fr20-std.png"
            alt={activeAlt.ecosystem_insight}
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain"
          />
        </div>
      </section>
    </>
  );
}
