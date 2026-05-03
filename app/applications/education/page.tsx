import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function EducationPage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: '教育与科研',
          body: '机器人课程、实验平台与科研级接口支持高校与研究所快速搭建教学演示环境。',
          ctaHome: '返回首页',
        },
        en: {
          title: 'Education & Research',
          body: 'Curricula, lab kits, and API-friendly cobots for universities and research groups building the next cohort of talent.',
          ctaHome: 'Back to Home',
        },
      }}
    />
  );
}
