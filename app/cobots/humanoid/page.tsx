import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function CobotsHumanoidPage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: '人形机器人（具身智能）',
          body: '面向科研、服务与下一阶段具身智能应用的人形平台与软件生态正在规划中。',
          ctaHome: '返回首页',
        },
        en: {
          title: 'Humanoid (Embodied AI)',
          body: 'Humanoid platforms and embodied-AI tooling for research, service, and next-wave deployments—currently on our roadmap.',
          ctaHome: 'Back to Home',
        },
      }}
    />
  );
}
