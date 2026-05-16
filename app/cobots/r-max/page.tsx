import { getSiteLang } from '@/lib/get-site-lang';
import { RCorePageClient } from '../r-core/RCorePageClient';

export default async function CobotsRMaxPage() {
  const lang = await getSiteLang();
  return <RCorePageClient initialLang={lang} immersiveProductId="r-max" />;
}
