import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function SupportResourcesPage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: '资源中心（下载）',
          body: 'CAD、手册、认证与软件包的集中下载入口正在整理上线，您也可先通过邮件索取所需资料。',
          ctaHome: '返回首页',
        },
        en: {
          title: 'Resource Center (Downloads)',
          body: 'Centralized CAD, manuals, certifications, and software bundles—email us for early access while we finish the portal.',
          ctaHome: 'Back to Home',
        },
      }}
    />
  );
}
