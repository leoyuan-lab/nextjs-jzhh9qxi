'use client';

import Link from 'next/link';
import { useSiteLang } from '@/lib/site-lang-context';

type CopyBlock = {
  zh: { title: string; body: string; ctaHome: string; ctaInquiry?: string };
  en: { title: string; body: string; ctaHome: string; ctaInquiry?: string };
};

export function SeoBriefLanding({ copy }: { copy: CopyBlock }) {
  const lang = useSiteLang();
  const t = lang === 'en' ? copy.en : copy.zh;
  const openInquiry = () => window.dispatchEvent(new Event('apple-inquiry-open'));

  return (
    <div className="seo-brief-root">
      <div className="seo-brief-inner">
        <h1>{t.title}</h1>
        <p>{t.body}</p>
        <div className="seo-brief-actions">
          <Link href="/" className="seo-brief-link">
            {t.ctaHome}
          </Link>
          <button type="button" className="seo-brief-inquiry" onClick={openInquiry}>
            {t.ctaInquiry ?? (lang === 'zh' ? '咨询' : 'Inquiry')}
          </button>
        </div>
      </div>
    </div>
  );
}
