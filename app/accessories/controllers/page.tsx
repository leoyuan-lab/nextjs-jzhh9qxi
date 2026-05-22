import { AccessoriesLaneJsonLd } from '@/components/accessories/AccessoriesLaneJsonLd';
import { AccessoryLaneSection } from '@/components/accessories/AccessoryLaneSection';
import { AccessoriesHubSubnav } from '@/components/accessories/AccessoriesHubSubnav';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_ACCESSORIES } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';
import type { Metadata } from 'next';
import { controllerSpecs } from '@/data/products';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const meta = getMessages(lang).pages.accessories.controllersPage;
  return pageMetadata(meta.metaTitleFocus, meta.metaDescription, '/accessories/controllers', lang, siteOrigin);
}

export default async function AccessoriesControllersPage() {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const base = getMessages(lang).pages.accessories;
  const nav = getMessages(lang).nav.accessories;
  const page = base.controllersPage;
  const laneCopy = {
    expandSpecs: base.expandSpecs,
    inquiry: base.inquiry,
    lanes: {
      ...base.lanes,
      controllers: {
        ...base.lanes.controllers,
        note:
          lang === 'zh' ? controllerSpecs.noteIntegrated.zh : controllerSpecs.noteIntegrated.en,
      },
    },
  };
  const subnavCopy = {
    overview: nav.overview,
    subnavAria: base.subnavAria,
    lanes: base.lanes,
  };

  return (
    <>
      <AccessoriesLaneJsonLd lang={lang} origin={siteOrigin} lane="controllers" />
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-accessories-controllers"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_ACCESSORIES.href, en: BC_NAV_ACCESSORIES.en },
          { href: '/accessories/controllers', en: 'External Control Cabinets' },
        ]}
      />
      <div id="accessories-top" className="accessories-hub-intro accessories-spoke-intro">
        <p className="accessories-spoke-eyebrow">{page.eyebrow}</p>
        <h1 id="accessories-controllers-title">{page.title}</h1>
        <p>{page.intro}</p>
      </div>
      <AccessoriesHubSubnav copy={subnavCopy} current="controllers" variant="spoke" />
      <div className="accessories-hub-lanes accessories-spoke-lanes">
        <AccessoryLaneSection lane="controllers" lang={lang} copy={laneCopy} showHeader={false} />
      </div>
    </>
  );
}
