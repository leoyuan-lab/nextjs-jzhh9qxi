import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function NewsPage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: '新闻资讯',
          body: '新品发布、展会活动与工程博客将在此汇总，欢迎订阅以保持同步。',
          ctaHome: '返回首页',
        },
        en: {
          title: 'Newsroom',
          body: 'Launches, trade shows, and engineering stories—subscribe as we fill the feed.',
          ctaHome: 'Back to Home',
        },
      }}
    />
  );
}
