import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function SupportAcademyPage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: '技术学院',
          body: '分层培训课程、认证考试大纲与实验指导将帮助工程师从部署到维护全链路掌握协作臂。',
          ctaHome: '返回首页',
        },
        en: {
          title: 'Technical Academy',
          body: 'Structured courses, certification outlines, and lab guides for operators—from first power-on to advanced tuning.',
          ctaHome: 'Back to Home',
        },
      }}
    />
  );
}
