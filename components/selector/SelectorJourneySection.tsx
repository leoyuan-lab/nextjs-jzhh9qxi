'use client';

import Image from 'next/image';
import Link from 'next/link';

import { trackCtaClick } from '@/lib/analytics';
import { getMessages } from '@/lib/messages';
import {
  ALL_COBOTS_JOURNEY_HERO_DIM,
  ALL_COBOTS_JOURNEY_HERO_IMG,
  robotVariantImageAlt,
} from '@/data/products';
import { useSiteLang } from '@/lib/site-lang-context';

const HERO_IMAGE_ID = 'fr5-wml';

type JourneyBeatCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  meta: string;
  cta: string;
};

type JourneyComparisonCopy = JourneyBeatCopy & { summaryMobile?: string };

type JourneyCopy = {
  headlineLines: string[];
  advisor: JourneyBeatCopy;
  comparison: JourneyComparisonCopy;
};

function JourneyBeat({
  beatId,
  copy,
  href,
  analyticsId,
}: {
  beatId: 'advisor' | 'comparison';
  copy: JourneyBeatCopy;
  href: string;
  analyticsId: 'all_specs_journey_advisor' | 'all_specs_journey_comparison';
}) {
  return (
    <article className={`selector-journey-duo-card selector-journey-duo-card--${beatId}`}>
      <h3 className="selector-journey-duo-title">{copy.title}</h3>
      <p className="selector-journey-duo-summary">{copy.summary}</p>
      <Link href={href} className="selector-journey-duo-link" onClick={() => trackCtaClick(analyticsId)}>
        {copy.cta}
        <span aria-hidden> ›</span>
      </Link>
    </article>
  );
}

function JourneyDuo({ copy, base, className }: { copy: JourneyCopy; base: string; className?: string }) {
  return (
    <div className={className ? `selector-journey-duo ${className}` : 'selector-journey-duo'}>
      <JourneyBeat
        beatId="advisor"
        copy={copy.advisor}
        href={`${base}/selector/advisor`}
        analyticsId="all_specs_journey_advisor"
      />
      <JourneyBeat
        beatId="comparison"
        copy={copy.comparison}
        href={`${base}/selector/comparison`}
        analyticsId="all_specs_journey_comparison"
      />
    </div>
  );
}

export function SelectorJourneySection() {
  const lang = useSiteLang();
  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const copy = getMessages(safeLang).pages.all_cobots_specs.journey;
  const heroAlt = robotVariantImageAlt(HERO_IMAGE_ID, safeLang);
  const base = `/${safeLang}`;
  const mobileCopy: JourneyCopy = {
    ...copy,
    comparison: {
      ...copy.comparison,
      summary: copy.comparison.summaryMobile ?? copy.comparison.summary,
    },
  };

  return (
    <section className="selector-journey-band" aria-labelledby="selector-journey-title">
      <div
        className="selector-journey-hero-stage"
        style={{
          aspectRatio: `${ALL_COBOTS_JOURNEY_HERO_DIM.width} / ${ALL_COBOTS_JOURNEY_HERO_DIM.height}`,
        }}
      >
        <Image
          src={ALL_COBOTS_JOURNEY_HERO_IMG}
          alt={heroAlt}
          fill
          priority={false}
          sizes="100vw"
          quality={92}
          className="selector-journey-hero-img"
        />
        <div className="selector-journey-hero-overlay">
          <div className="selector-journey-hero-copy">
            <h2 id="selector-journey-title" className="selector-journey-title">
              {copy.headlineLines.map((line) => (
                <span key={line} className="selector-journey-title-line">
                  {line}
                </span>
              ))}
            </h2>
            <JourneyDuo copy={copy} base={base} className="selector-journey-duo--in-hero" />
          </div>
        </div>
      </div>

      <div className="selector-journey-panel">
        <JourneyDuo copy={mobileCopy} base={base} className="selector-journey-duo--below" />
      </div>
    </section>
  );
}
