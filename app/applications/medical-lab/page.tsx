import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function MedicalLabPage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: '医疗与实验室',
          body: '试剂搬运、分析仪上下料与高洁净环境下的重复作业可以由协作自动化安全承接。',
          ctaHome: '返回首页',
        },
        en: {
          title: 'Medical & Lab',
          body: 'Sample handling, analyzer tending, and repetitive bench workflows with cobots built for disciplined environments.',
          ctaHome: 'Back to Home',
        },
      }}
    />
  );
}
