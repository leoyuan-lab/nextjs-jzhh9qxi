'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import { RooollBrandMark } from '@/components/RooollBrandMark';
import { NewsArticleShare } from '@/components/news/NewsArticleShare';
import { NewsroomSubnav } from '@/components/news/NewsroomSubnav';
import { NEWS_ARTICLES, type NewsArticle } from '@/data/news';
import {
  newsBodyParagraphs,
  newsCategoryLabel,
  newsImageAlt,
  newsText,
} from '@/lib/news-copy';
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';

function formatNewsDate(iso: string, lang: AppLocale): string {
  const date = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export type NewsArticleClientProps = {
  initialLang: AppLocale;
  article: NewsArticle;
  shareUrl: string;
};

export function NewsArticleClient({ initialLang, article, shareUrl }: NewsArticleClientProps) {
  const lang: AppLocale = initialLang === 'en' ? 'en' : 'zh';
  const ui = getMessages(lang).pages.newsroom;
  const title = newsText(article.title, lang);
  const excerpt = newsText(article.excerpt, lang);
  const body = newsText(article.body, lang);
  const paragraphs = newsBodyParagraphs(body);
  const listHref = `/${lang}/news`;

  const relatedArticles = useMemo(
    () => NEWS_ARTICLES.filter((item) => item.slug !== article.slug),
    [article.slug],
  );

  return (
    <article className="newsroom-article-root">
      <NewsroomSubnav
        title={ui.subnavTitle}
        ariaLabel={ui.subnavAria}
        newsroomHref={listHref}
      />

      <div className="newsroom-article-page">
        <header className="newsroom-article-header">
          <p className="newsroom-article-meta">
            <span className="newsroom-article-meta__category">
              {newsCategoryLabel(article.category, lang)}
            </span>
            <time className="newsroom-article-meta__date" dateTime={article.publishedAt}>
              {formatNewsDate(article.publishedAt, lang)}
            </time>
          </p>
          <h1 className="newsroom-article-title">{title}</h1>
          <p className="newsroom-article-dek">{excerpt}</p>
          <NewsArticleShare
            url={shareUrl}
            title={title}
            linkAria={ui.shareLinkAria}
            emailAria={ui.shareEmailAria}
            copiedLabel={ui.shareCopied}
          />
        </header>
      </div>

      <div className="newsroom-article-figure-band">
        <figure className="newsroom-article-figure">
          <Image
            src={article.imagePath}
            alt={newsImageAlt(article, lang)}
            width={2722}
            height={1536}
            priority
            unoptimized
            sizes="(min-width: 735px) 980px, 100vw"
            className="newsroom-article-figure__img"
          />
        </figure>
      </div>

      <div className="newsroom-article-page">
        {paragraphs.length > 0 ? (
          <div className="newsroom-article-body">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {relatedArticles.length > 0 ? (
          <section className="newsroom-article-more" aria-labelledby="newsroom-article-more-title">
            <h2 id="newsroom-article-more-title" className="newsroom-article-more__title">
              {ui.moreNewsTitle}
            </h2>
            <ul className="newsroom-article-more__list">
              {relatedArticles.map((item) => (
                <li key={item.slug}>
                  <Link href={`/${lang}/news/${item.slug}`} className="newsroom-article-more__item">
                    <div className="newsroom-article-more__media">
                      <Image
                        src={item.imagePath}
                        alt={newsImageAlt(item, lang)}
                        fill
                        unoptimized
                        sizes="120px"
                        className="newsroom-article-more__img"
                      />
                    </div>
                    <div className="newsroom-article-more__copy">
                      <p className="newsroom-article-more__meta">
                        {newsCategoryLabel(item.category, lang)}
                        <span aria-hidden> · </span>
                        <time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt, lang)}</time>
                      </p>
                      <p className="newsroom-article-more__headline">{newsText(item.title, lang)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <section className="newsroom-article-cta" aria-labelledby="newsroom-article-cta-title">
        <div className="newsroom-article-cta__inner">
          <RooollBrandMark width={52} decorative color="#1d1d1f" title={ui.markAria} />
          <h2 id="newsroom-article-cta-title" className="newsroom-article-cta__title">
            {ui.ctaTitle}
          </h2>
          <p className="newsroom-article-cta__subtitle">{ui.ctaSubtitle}</p>
          <Link href={listHref} className="newsroom-article-cta__btn">
            {ui.ctaButton}
          </Link>
        </div>
      </section>
    </article>
  );
}
