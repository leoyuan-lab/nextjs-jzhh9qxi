import { getSiteLang } from '@/lib/get-site-lang';
import { CobotImmersivePageClient } from '@/components/cobots/CobotImmersivePageClient';

export default async function CobotsRLitePage() {
  const lang = await getSiteLang();
  return <CobotImmersivePageClient initialLang={lang} immersiveProductId="r-lite" />;
}
