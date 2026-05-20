import { LegalDocument } from '@/components/LegalDocument';
import { getMessages } from '@/lib/messages';

export default function PrivacyPage() {
  const zh = getMessages('zh').pages.privacy;
  const en = getMessages('en').pages.privacy;
  return (
    <LegalDocument
      zh={{
        title: zh.title,
        updated: zh.updated,
        intro: zh.intro,
        sections: zh.sections,
        backHome: zh.backHome,
      }}
      en={{
        title: en.title,
        updated: en.updated,
        intro: en.intro,
        sections: en.sections,
        backHome: en.backHome,
      }}
    />
  );
}
