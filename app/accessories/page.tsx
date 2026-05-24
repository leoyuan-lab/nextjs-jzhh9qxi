import { AccessoriesHubOverview } from '@/components/accessories/AccessoriesHubOverview';
import { AccessoriesHubSubnav } from '@/components/accessories/AccessoriesHubSubnav';
import { AccessoriesJsonLd } from '@/components/accessories/AccessoriesJsonLd';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';

export default async function AccessoriesPage() {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const base = getMessages(lang).pages.accessories;
  const nav = getMessages(lang).nav.accessories;
  const laneCopy = {
    expandSpecs: base.expandSpecs,
    inquiry: base.inquiry,
    lanes: base.lanes,
  };
  const subnavCopy = {
    overview: nav.overview,
    subnavAria: base.subnavAria,
    lanes: base.lanes,
  };

  return (
    <>
      <AccessoriesJsonLd lang={lang} origin={siteOrigin} />
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-accessories"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: '/accessories', en: 'Cobot Accessories Ecosystem' },
        ]}
      />
      <div id="accessories-top" className="accessories-hub-intro accessories-hub-intro-hero roooll-page-hero-top">
        <h1 className="roooll-page-hero-title">{base.introTitle}</h1>
        <p>{base.introBody}</p>
      </div>
      <AccessoriesHubSubnav copy={subnavCopy} variant="hub" />
      <AccessoriesHubOverview
        laneCopy={laneCopy}
        copy={{
          categories: base.categories,
          featured: base.featured,
          comingSoon: base.comingSoon,
        }}
      />
    </>
  );
}
