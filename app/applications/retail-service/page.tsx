import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function RetailServicePage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: '零售与服务',
          body: '面向门店迎宾、分拣补货及服务增值场景的协作自动化方案可随时与我们销售团队接洽。',
          ctaHome: '返回首页',
        },
        en: {
          title: 'Retail & Service',
          body: 'Cobots for storefronts, client engagement, replenishment, and repeatable service tasks—contact our team for playbooks.',
          ctaHome: 'Back to Home',
        },
      }}
    />
  );
}
