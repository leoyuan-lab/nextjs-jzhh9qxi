import type { MultiLang } from '@/data/products';
import type { NewsArticle, NewsCategoryId } from '@/data/news';
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';

export function newsText(value: MultiLang, lang: AppLocale): string {
  return lang === 'en' ? value.en : value.zh;
}

export function newsCategoryLabel(category: NewsCategoryId, lang: AppLocale): string {
  return getMessages(lang).pages.newsroom.categories[category];
}

export function newsImageAlt(article: NewsArticle, lang: AppLocale): string {
  const alt = getMessages(lang).alt;
  const key = article.imageAltKey;
  if (key === 'hero_rcore' && alt.hero_rcore) return alt.hero_rcore;
  if (key === 'hero_rlite' && alt.hero_rlite) return alt.hero_rlite;
  if (key === 'hero_rultra' && alt.hero_rultra) return alt.hero_rultra;
  if (key === 'hero_site' && alt.hero_site) return alt.hero_site;
  return alt.variant_images.r_core_fr5_std;
}

export function newsBodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}
