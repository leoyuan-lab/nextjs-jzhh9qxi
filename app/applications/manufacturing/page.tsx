import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function ManufacturingPage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: '智能制造',
          body: '高节拍、多品种的装配、检测与物流工位可由 r 系列协作臂快速部署并保持柔性与可追溯性。',
          ctaHome: '返回首页',
        },
        en: {
          title: 'Smart Manufacturing',
          body: 'High-mix production, inspection, handling, and line-side logistics—implemented with repeatable cobot tooling.',
          ctaHome: 'Back to Home',
        },
      }}
    />
  );
}
