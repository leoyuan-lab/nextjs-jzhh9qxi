import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function AboutStoryPage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: '品牌故事',
          body: '我们以精密机械与易用软件交会的方式，让协作机器人走进每一次工艺迭代——完整品牌叙事即将发布。',
          ctaHome: '返回首页',
        },
        en: {
          title: 'Our Story',
          body: 'Mechanical precision meets approachable software—learn how r‑Series cobots came to life. Full narrative landing soon.',
          ctaHome: 'Back to Home',
        },
      }}
    />
  );
}
