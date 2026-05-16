'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useId, useMemo, useState } from 'react';
import { getFaqPairs } from '@/lib/faq-messages';
import { getMessages, type AppLocale } from '@/lib/messages';
import { getSiteOriginForClient } from '@/lib/site-origin-fallback';

const EASE = [0.22, 1, 0.36, 1] as const;

type RooollFaqSectionProps = {
  lang: AppLocale;
  /** Logical path without locale, e.g. `/cobots/r-core` — used in FAQPage JSON-LD. */
  pagePath: '/cobots/r-core' | '/cobots/r-max';
};

function absolutePageUrl(origin: string, lang: AppLocale, pagePath: string): string {
  const base = origin.replace(/\/$/, '');
  return `${base}/${lang}${pagePath}`;
}

export function RooollFaqSection({ lang, pagePath }: RooollFaqSectionProps) {
  const sectionId = useId();
  const prefersReducedMotion = useReducedMotion();
  const faqCopy = getMessages(lang).FAQ;
  const pairs = useMemo(() => getFaqPairs(lang), [lang]);
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = useCallback((id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const jsonLd = useMemo(() => {
    const origin = getSiteOriginForClient();
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${absolutePageUrl(origin, lang, pagePath)}#faq`,
      url: absolutePageUrl(origin, lang, pagePath),
      inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
      mainEntity: pairs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
  }, [lang, pagePath, pairs]);

  const jsonLdId =
    pagePath === '/cobots/r-max' ? 'jsonld-faq-cobots-r-max' : 'jsonld-faq-cobots-r-core';

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.38, ease: EASE };

  return (
    <section
      className="roooll-faq-section"
      aria-labelledby={`${sectionId}-title`}
    >
      <script
        id={jsonLdId}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <motion.div
        className="roooll-faq-section__inner"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <h2 id={`${sectionId}-title`} className="roooll-faq-section__title">
          {faqCopy.title}
        </h2>

        <motion.div
          className="roooll-faq-section__card"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.06, ease: EASE }}
        >
          {pairs.map((item, index) => {
            const isOpen = openId === item.id;
            const triggerId = `${sectionId}-faq-trigger-${item.id}`;
            const panelId = `${sectionId}-faq-panel-${item.id}`;
            const isLast = index === pairs.length - 1;

            return (
              <motion.div
                key={item.id}
                className={`roooll-faq-section__item${isLast ? ' roooll-faq-section__item--last' : ''}`}
                layout={!prefersReducedMotion}
              >
                <h3 className="roooll-faq-section__question-wrap">
                  <button
                    type="button"
                    id={triggerId}
                    className="roooll-faq-section__trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(item.id)}
                  >
                    <span className="roooll-faq-section__question">
                      {item.question}
                      <span className="roooll-faq-section__sr-only">
                        {isOpen ? faqCopy.collapseItemAria : faqCopy.expandItemAria}
                      </span>
                    </span>
                    <motion.span
                      className="roooll-faq-section__chevron"
                      aria-hidden
                      initial={false}
                      animate={{ rotate: isOpen ? 225 : 45 }}
                      transition={panelTransition}
                    />
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="roooll-faq-section__panel"
                      initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={panelTransition}
                    >
                      <p className="roooll-faq-section__answer">{item.answer}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
