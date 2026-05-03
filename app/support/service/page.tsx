import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function SupportServicePage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: '全球服务支持',
          body: '全球备件、远程诊断与现场工程师网络覆盖主要制造区域，支持合同化 SLA 与升级路径。',
          ctaHome: '返回首页',
        },
        en: {
          title: 'Global Service Support',
          body: 'Spares, remote diagnostics, and field engineers across major manufacturing hubs—with contract SLAs.',
          ctaHome: 'Back to Home',
        },
      }}
    />
  );
}
