import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AllCobotsVariantSeoContent } from '@/components/selector/AllCobotsVariantSeoContent';
import { VariantProductJsonLd } from '@/components/VariantProductJsonLd';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';
import {
  robotVariantMetaDescription,
  robotVariantSchemaProductName,
  rooollVariantShortLabel,
} from '@/lib/roooll-product-schema';
import { robotFamilyForVariant, robotVariantById } from '@/data/products';
import {
  ALL_VARIANT_PUBLIC_SLUGS,
  variantDetailPathname,
  variantIdFromPublicUrlToken,
} from '@/lib/variant-public-slug';

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return ALL_VARIANT_PUBLIC_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const variantId = variantIdFromPublicUrlToken(slug);
  if (!variantId) return {};

  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const pathname = variantDetailPathname(slug);
  const titleFocus = robotVariantSchemaProductName(variantId, lang);
  const description = robotVariantMetaDescription(variantId, lang);

  return pageMetadata(titleFocus, description, pathname, lang, siteOrigin);
}

function breadcrumbEnLabel(variantId: string): string {
  const variant = robotVariantById[variantId];
  const family = robotFamilyForVariant(variantId);
  const short = rooollVariantShortLabel(variant.name);
  return short ? `${family.displayName} · ${short}` : family.displayName;
}

export default async function AllCobotsVariantDetailPage({ params }: PageProps) {
  const { slug } = params;
  const variantId = variantIdFromPublicUrlToken(slug);
  if (!variantId) notFound();

  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const detailPath = variantDetailPathname(slug);

  return (
    <>
      <VariantProductJsonLd variantId={variantId} lang={lang} origin={siteOrigin} />
      <BreadcrumbJsonLd
        lang={lang}
        id={`jsonld-bc-cobots-all-specs-${slug}`}
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/all-cobots-specs', en: 'r-series cobots & Specs' },
          { href: detailPath, en: breadcrumbEnLabel(variantId) },
        ]}
      />
      <AllCobotsVariantSeoContent variantId={variantId} lang={lang} />
    </>
  );
}
