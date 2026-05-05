import { SeoBriefLanding } from '@/components/SeoBriefLanding';
import { getMessages } from '@/lib/messages';

export default function IntegratedToolsPage() {
  const zh = getMessages('zh').pages.r_ecosystem_integrated_tools;
  const en = getMessages('en').pages.r_ecosystem_integrated_tools;
  return (
    <SeoBriefLanding
      copy={{
        zh: { title: zh.h1, body: zh.body, ctaHome: zh.ctaHome },
        en: { title: en.h1, body: en.body, ctaHome: en.ctaHome },
      }}
    />
  );
}
