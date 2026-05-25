import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { NewsArticleClient } from '@/components/news/NewsArticleClient';
import { NewsArticleJsonLd } from '@/components/news/NewsArticleJsonLd';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { NEWS_SLUGS, newsArticleBySlug, newsArticlePathname } from '@/data/news';
import { newsImageAlt, newsText } from '@/lib/news-copy';
import { BC_HOME, BC_NAV_ABOUT } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata, productSocialMetadata } from '@/lib/site-seo';
import { R_CORE_LITE_OG_IMAGE_SIZE } from '@/lib/rcore-lite-page-config';

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return NEWS_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = newsArticleBySlug(params.slug);
  if (!article) return {};

  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const pathname = newsArticlePathname(article.slug);
  const titleFocus = newsText(article.title, lang);
  const description = newsText(article.excerpt, lang);
  const ogAlt = newsImageAlt(article, lang);

  return {
    ...pageMetadata(titleFocus, description, pathname, lang, siteOrigin),
    ...productSocialMetadata(
      titleFocus,
      description,
      siteOrigin,
      article.imagePath,
      ogAlt,
      R_CORE_LITE_OG_IMAGE_SIZE,
    ),
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const article = newsArticleBySlug(params.slug);
  if (!article) notFound();

  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();

  return (
    <>
      <NewsArticleJsonLd article={article} lang={lang} origin={siteOrigin} />
      <BreadcrumbJsonLd
        lang={lang}
        id={`jsonld-bc-news-${article.slug}`}
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_ABOUT.href, en: BC_NAV_ABOUT.en },
          { href: '/news', en: 'Newsroom' },
          { href: newsArticlePathname(article.slug), en: newsText(article.title, 'en') },
        ]}
      />
      <NewsArticleClient
        initialLang={lang}
        article={article}
        shareUrl={`${siteOrigin}/${lang}/news/${article.slug}`}
      />
    </>
  );
}
