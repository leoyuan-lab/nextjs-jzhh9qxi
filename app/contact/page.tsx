import { SeoBriefLanding } from '@/components/SeoBriefLanding';
import { getMessages } from '@/lib/messages';

export default function ContactPage() {
  const zh = getMessages('zh').pages.contact;
  const en = getMessages('en').pages.contact;
  return (
    <div>
      <SeoBriefLanding
        copy={{
          zh: {
            title: zh.title,
            body: zh.body,
            ctaHome: zh.ctaHome,
          },
          en: {
            title: en.title,
            body: en.body,
            ctaHome: en.ctaHome,
          },
        }}
      />
      <div className="seo-contact-mail">
        <a href="mailto:info@roooll.com">info@roooll.com</a>
      </div>
    </div>
  );
}
