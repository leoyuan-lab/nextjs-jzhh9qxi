import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function ContactPage() {
  return (
    <div>
      <SeoBriefLanding
        copy={{
          zh: {
            title: '联系我们',
            body: '销售、渠道合作与售后支持请通过下方邮箱联络；紧急项目也可通过站点「咨询」入口发起工单。',
            ctaHome: '返回首页',
          },
          en: {
            title: 'Contact Us',
            body: 'Sales, partnerships, and follow-the-sun service—reach us by email or use the Inquiry entry point sitewide.',
            ctaHome: 'Back to Home',
          },
        }}
      />
      <div className="seo-contact-mail">
        <a href="mailto:info@roooll.com">info@roooll.com</a>
      </div>
    </div>
  );
}
