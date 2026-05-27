import type { Metadata } from 'next';
import { ApplicationRouteShell } from '@/components/applications/ApplicationRouteShell';
import { ApplicationsHubClient } from '@/components/applications/ApplicationsHubClient';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_APPLICATIONS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const page = getMessages(lang).pages.applications_hub;
  return pageMetadata(
    page.metaTitleFocus,
    page.metaDescription,
    '/applications',
    lang,
    siteOrigin,
  );
}

export default async function ApplicationsHubPage() {
  const lang = await getSiteLang();

  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-applications-hub"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_APPLICATIONS.href, en: BC_NAV_APPLICATIONS.en },
        ]}
      />
      <ApplicationRouteShell>
        <ApplicationsHubClient />
      </ApplicationRouteShell>
    </>
  );
}
