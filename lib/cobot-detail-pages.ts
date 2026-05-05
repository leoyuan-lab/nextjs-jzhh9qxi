import { getMessages } from '@/lib/messages';

type Lang = 'zh' | 'en';

export type DetailSpecRow = { label: string; v1: string; v2: string };
export type DetailHighlightCard = {
  title: string;
  description: string;
  orbit: string;
  target: string;
  node: string;
};

export type CobotDetailCopy = {
  inquiry: string;
  heroTitle: string;
  heroSubtitle: string;
  highlightsTitle: string;
  highlights: DetailHighlightCard[];
  closerTitle: string;
  narrativeTitle: string;
  narrativeHeadline: string;
  narrativeSubtitle: string;
  specsTitle: string;
  specs: DetailSpecRow[];
  compareLeftName: string;
  compareRightName: string;
};

export function getRCoreDetailCopy(
  lang: Lang,
  names: { rCore: string; rMax: string },
): CobotDetailCopy {
  const page = getMessages(lang).pages.r_core;
  return {
    inquiry: page.inquiry,
    heroTitle: names.rCore,
    heroSubtitle: page.hero.subtitle,
    highlightsTitle: page.highlights.title,
    highlights: page.highlights.cards,
    closerTitle: page.closer.title,
    narrativeTitle: page.narrative.title,
    narrativeHeadline: page.narrative.headline,
    narrativeSubtitle: page.narrative.subtitle,
    specsTitle: page.specs.title,
    specs: page.specs.items,
    compareLeftName: names.rCore,
    compareRightName: names.rMax,
  };
}
