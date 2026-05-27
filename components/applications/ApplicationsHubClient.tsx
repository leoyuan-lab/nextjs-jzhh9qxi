'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { APPLICATION_HUB_CARDS, type ApplicationHubCardId } from '@/data/application-hub';
import { getMessages } from '@/lib/messages';
import { useSiteLang } from '@/lib/site-lang-context';

const DESKTOP_MQ = '(min-width: 769px)';

const ApplicationsHubDesktopCarousel = dynamic(
  () =>
    import('@/components/applications/ApplicationsHubDesktopCarousel').then(
      (m) => m.ApplicationsHubDesktopCarousel,
    ),
  { ssr: false },
);

function useDesktopViewport(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return isDesktop;
}

function hubCardAlt(lang: 'zh' | 'en', key: string): string {
  const alt = getMessages(lang).alt as Record<string, unknown>;
  const value = alt[key];
  return typeof value === 'string' ? value : key;
}

export function ApplicationsHubClient() {
  const isDesktop = useDesktopViewport();
  const lang = useSiteLang();
  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const copy = getMessages(safeLang).pages.applications_hub;
  const nav = getMessages(safeLang).nav.applications;

  const cardTitle = (id: ApplicationHubCardId) => {
    switch (id) {
      case 'retail_service':
        return nav.retail_service;
      case 'manufacturing':
        return nav.manufacturing;
      case 'medical_lab':
        return nav.medical_lab;
      case 'education':
        return nav.education;
    }
  };

  const cardSummary = (id: ApplicationHubCardId) => copy.cards[id].summary;

  const carouselCopy = {
    cardsAria: copy.cardsAria,
    learnMore: copy.learnMore,
    cardTitle,
    cardSummary,
    cardAlt: (key: string) => hubCardAlt(safeLang, key),
    langPrefix: `/${safeLang}`,
  };

  return (
    <div className="app-hub-page">
      <h1 className="sr-only">{copy.title}</h1>

      {isDesktop ? (
        <ApplicationsHubDesktopCarousel copy={carouselCopy} />
      ) : (
        <section
          className="app-hub-twin-section"
          aria-labelledby="app-hub-mobile-cards"
        >
        <h2 id="app-hub-mobile-cards" className="sr-only">
          {copy.cardsAria}
        </h2>
        <div className="app-hub-twin-grid">
          {APPLICATION_HUB_CARDS.map((card, index) => (
            <article key={card.id} className="app-hub-panel app-hub-panel--mobile">
              <div className="app-hub-panel-media">
                <Image
                  src={card.image}
                  alt={hubCardAlt(safeLang, card.altKey)}
                  fill
                  sizes="100vw"
                  className="app-hub-panel-img object-cover"
                  priority={index < 2}
                />
                <div className="app-hub-panel-scrim" aria-hidden />
              </div>
              <div className="app-hub-panel-copy app-hub-panel-copy--mobile">
                <h2 className="app-hub-panel-title">{cardTitle(card.id)}</h2>
                <p className="app-hub-panel-summary">{cardSummary(card.id)}</p>
                <Link href={`/${safeLang}${card.href}`} className="app-hub-pill">
                  {copy.learnMore}
                </Link>
              </div>
            </article>
          ))}
        </div>
        </section>
      )}
    </div>
  );
}
