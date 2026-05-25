import { NewsroomPageClient } from '@/components/news/NewsroomPageClient';
import { getSiteLang } from '@/lib/get-site-lang';

export default async function NewsPage() {
  const lang = await getSiteLang();
  return <NewsroomPageClient initialLang={lang} />;
}
