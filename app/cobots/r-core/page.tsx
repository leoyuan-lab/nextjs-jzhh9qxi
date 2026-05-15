import { getSiteLang } from '@/lib/get-site-lang';
import { RCorePageClient } from './RCorePageClient';

export default async function CobotsRCorePage() {
  const lang = await getSiteLang();
  return <RCorePageClient initialLang={lang} />;
}
