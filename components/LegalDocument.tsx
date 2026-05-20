'use client';

import Link from 'next/link';
import { useSiteLang } from '@/lib/site-lang-context';

type Section = { heading: string; paragraphs: string[] };

type Props = {
  zh: { title: string; updated: string; intro: string; sections: Section[]; backHome: string };
  en: { title: string; updated: string; intro: string; sections: Section[]; backHome: string };
};

export function LegalDocument({ zh, en }: Props) {
  const lang = useSiteLang();
  const t = lang === 'en' ? en : zh;
  const homeHref = `/${lang}/`;

  return (
    <article className="legal-doc">
      <div className="legal-doc__inner">
        <h1>{t.title}</h1>
        <p className="legal-doc__meta">{t.updated}</p>
        <p className="legal-doc__intro">{t.intro}</p>
        {t.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </section>
        ))}
        <p className="legal-doc__back">
          <Link href={homeHref}>{t.backHome}</Link>
        </p>
      </div>
    </article>
  );
}
