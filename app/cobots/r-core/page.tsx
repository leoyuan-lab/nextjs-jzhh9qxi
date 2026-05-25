import { RCoreLitePageClient } from '@/components/cobots/RCoreLitePageClient';
import { getSiteLang } from '@/lib/get-site-lang';

export default async function CobotsRCorePage() {
  const lang = await getSiteLang();
  return <RCoreLitePageClient initialLang={lang} />;
}
