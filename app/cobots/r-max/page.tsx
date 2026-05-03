import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function CobotsRMaxPage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: 'r-Max（强力负载型）',
          body: '高负载协作机器人系列——面向汽车制造、大件搬运及重载装配等场景的能力正在扩展中。',
          ctaHome: '返回首页',
          ctaInquiry: '咨询方案',
        },
        en: {
          title: 'r-Max (High Payload)',
          body: 'Our high-payload cobot roadmap for automotive, heavy material handling, and demanding assembly—in active expansion.',
          ctaHome: 'Back to Home',
          ctaInquiry: 'Talk to us',
        },
      }}
    />
  );
}
