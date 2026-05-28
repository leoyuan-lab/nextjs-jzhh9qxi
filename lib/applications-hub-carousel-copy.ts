import type { ApplicationHubCardId } from '@/data/application-hub';
import { getMessages } from '@/lib/messages';

function hubCardAlt(lang: 'zh' | 'en', key: string): string {
  const alt = getMessages(lang).alt as Record<string, unknown>;
  const value = alt[key];
  return typeof value === 'string' ? value : key;
}

export type ApplicationsHubCarouselCopy = {
  cardsAria: string;
  learnMore: string;
  cardTitle: (id: ApplicationHubCardId) => string;
  cardSummary: (id: ApplicationHubCardId) => string;
  cardAlt: (key: string) => string;
  langPrefix: string;
};

export function buildApplicationsHubCarouselCopy(lang: 'zh' | 'en'): ApplicationsHubCarouselCopy {
  const copy = getMessages(lang).pages.applications_hub;
  const nav = getMessages(lang).nav.applications;

  const cardTitle = (id: ApplicationHubCardId) => {
    const card = copy.cards[id] as { title?: string; summary: string };
    if (card.title) return card.title;
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

  return {
    cardsAria: copy.cardsAria,
    learnMore: copy.learnMore,
    cardTitle,
    cardSummary: (id) => copy.cards[id].summary,
    cardAlt: (key) => hubCardAlt(lang, key),
    langPrefix: `/${lang}`,
  };
}
