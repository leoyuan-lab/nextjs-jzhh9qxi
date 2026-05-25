import type { NewsArticle } from '@/data/news';
import { newsText } from '@/lib/news-copy';
import { getSiteOriginForClient } from '@/lib/site-origin-fallback';

type Props = {
  article: NewsArticle;
  lang: 'zh' | 'en';
  origin?: string;
};

export function NewsArticleJsonLd({ article, lang, origin }: Props) {
  const base = (origin ?? getSiteOriginForClient()).replace(/\/$/, '');
  const pageUrl = `${base}/${lang}/news/${article.slug}`;
  const imageUrl = `${base}${article.imagePath.startsWith('/') ? article.imagePath : `/${article.imagePath}`}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: newsText(article.title, lang),
    description: newsText(article.excerpt, lang),
    image: [imageUrl],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: lang === 'zh' ? 'zh-CN' : 'en-US',
    author: {
      '@type': 'Organization',
      name: 'Roooll',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Roooll',
      logo: {
        '@type': 'ImageObject',
        url: `${base}/images/brand/roooll-orbit-logo.webp`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };

  return (
    <script
      id={`jsonld-news-${article.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
