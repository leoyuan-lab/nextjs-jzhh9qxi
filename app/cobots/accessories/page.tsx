import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function CobotsAccessoriesPage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: '协作机器人配件生态',
          body: '末端工具、线缆、底座与安全周边等全系配件清单与兼容性说明即将上线。',
          ctaHome: '返回首页',
        },
        en: {
          title: 'Cobot Accessories',
          body: 'Grippers, cabling, mounts, and safety peripherals—catalog and compatibility matrices are arriving soon.',
          ctaHome: 'Back to Home',
        },
      }}
    />
  );
}
