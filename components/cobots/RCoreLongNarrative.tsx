'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { RefObject, MutableRefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RCoreFlangeHeroStill } from '@/components/cobots/RCoreFlangeHeroStill';
import {
  ROBOT_IMG_BASE,
  ROBOT_VECTOR_BASE,
  robotVariantBlueprintAlt,
  robotVariantBlueprintDescription,
  robotVariantBlueprintSvgFilename,
  robotVariantImageAlt,
  robotVariantWebpFilename,
} from '@/data/products';
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';

const VARIANT_ID = 'fr5-c' as const;
const FAMILY_VARIANT_IDS = ['fr3-std', 'fr5-c', 'fr20-std'] as const;
const APP_CARD_IDS = ['fr3-std', 'fr5-c', 'fr10-std', 'fr16-std', 'fr20-std'] as const;

const fadeUp = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

type FilmCopy = {
  section_aria: string;
  flange_strip: { title: string; body: string; highlight: string }[];
  svg_kicker: string;
  svg_caption: string;
  scenario_image_alt: string;
  blueprint_intro_title: string;
  blueprint_intro_body: string;
  application_kicker: string;
  application_title: string;
  application_body: string;
  application_cards: { caption: string }[];
  r_family_kicker: string;
  r_family_title: string;
  r_family_body: string;
  tail_title: string;
  links: { specs: string; advisor: string; side_by_side: string };
};

export type RCoreLongNarrativeProps = {
  lang: AppLocale;
  flangeSectionRef?: RefObject<HTMLElement | null>;
  bpSectionRef?: RefObject<HTMLElement | null>;
  appSectionRef?: RefObject<HTMLElement | null>;
  narrativeRootRef?: RefObject<HTMLElement | null>;
};

function assignRef(ref: RefObject<HTMLElement | null> | undefined, node: HTMLElement | null) {
  if (ref) (ref as MutableRefObject<HTMLElement | null>).current = node;
}

export function RCoreLongNarrative({
  lang,
  flangeSectionRef,
  bpSectionRef,
  appSectionRef,
  narrativeRootRef,
}: RCoreLongNarrativeProps) {
  const base = `/${lang}`;
  const film = useMemo(() => getMessages(lang).pages.r_core.scroll_film as FilmCopy, [lang]);
  const prefersReducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const flangeRef = useRef<HTMLElement | null>(null);
  const bpRef = useRef<HTMLElement | null>(null);
  const appRef = useRef<HTMLElement | null>(null);
  const familyRef = useRef<HTMLElement | null>(null);
  const fanRef = useRef<HTMLDivElement | null>(null);

  const setRootNode = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      assignRef(narrativeRootRef, node);
    },
    [narrativeRootRef],
  );

  const setFlangeNode = useCallback(
    (node: HTMLElement | null) => {
      flangeRef.current = node;
      assignRef(flangeSectionRef, node);
    },
    [flangeSectionRef],
  );

  const setBpNode = useCallback(
    (node: HTMLElement | null) => {
      bpRef.current = node;
      assignRef(bpSectionRef, node);
    },
    [bpSectionRef],
  );

  const setAppNode = useCallback(
    (node: HTMLElement | null) => {
      appRef.current = node;
      assignRef(appSectionRef, node);
    },
    [appSectionRef],
  );

  const fanInView = useInView(fanRef, { amount: 0.3, once: false });
  const [fanPlayed, setFanPlayed] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setFanPlayed(true);
      return;
    }
    if (fanInView) {
      const id = window.requestAnimationFrame(() => setFanPlayed(true));
      return () => cancelAnimationFrame(id);
    }
    setFanPlayed(false);
  }, [fanInView, prefersReducedMotion]);

  const blueprintSrc = `${ROBOT_VECTOR_BASE}/${robotVariantBlueprintSvgFilename(VARIANT_ID)}`;
  const blueprintAlt = robotVariantBlueprintAlt(VARIANT_ID, lang);
  const blueprintDesc = robotVariantBlueprintDescription(VARIANT_ID, lang);
  const scenarioWebp = `${ROBOT_IMG_BASE}/${robotVariantWebpFilename(VARIANT_ID)}`;

  const familyAssets = useMemo(
    () =>
      FAMILY_VARIANT_IDS.map((id) => ({
        id,
        src: `${ROBOT_IMG_BASE}/${robotVariantWebpFilename(id)}`,
        alt: robotVariantImageAlt(id, lang),
      })),
    [lang],
  );

  const appCards = useMemo(
    () =>
      APP_CARD_IDS.map((id, i) => ({
        id,
        src: `${ROBOT_IMG_BASE}/${robotVariantWebpFilename(id)}`,
        alt: robotVariantImageAlt(id, lang),
        caption: film.application_cards[i]?.caption ?? '',
      })),
    [lang, film.application_cards],
  );

  const fanDur = 0.85;
  const fanEase = [0.2, 0.9, 0.2, 1] as const;
  const flangeHeroAlt = getMessages(lang).alt.r_core_detail_flange;

  return (
    <div ref={setRootNode} className="rcore-ln-root" aria-label={film.section_aria}>
      <section
        ref={setFlangeNode}
        className="rcore-ln-section rcore-ln-section--flange"
        data-rcore-ln-flange
      >
        <div className="rcore-ln-flange-chapter" data-rcore-flange-chapter>
          <div className="rcore-ln-flange-exit" data-rcore-flange-exit>
            <div className="rcore-ln-flange-hero-visual">
              <RCoreFlangeHeroStill alt={flangeHeroAlt} />
            </div>
            <div className="rcore-ln-flange-strip rcore-ln-copy-front">
              {film.flange_strip.map((col, i) => (
                <motion.div
                  key={i}
                  className="rcore-ln-flange-col"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
                  whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.32 }}
                  transition={{
                    duration: 0.52,
                    delay: prefersReducedMotion ? 0 : i * 0.14,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <h3 className="rcore-ln-flange-col__title">{col.title}</h3>
                  <hr className="rcore-ln-flange-col__rule" />
                  <p className="rcore-ln-flange-col__body">
                    {col.body} <strong className="rcore-ln-flange-col__hi">{col.highlight}</strong>
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={setBpNode} className="rcore-ln-section rcore-ln-section--bp">
        <div className="rcore-ln-bp-shell">
          <h2 className="rcore-ln-bp-main-title rcore-ln-copy-front">{film.blueprint_intro_title}</h2>
          <div className="rcore-ln-bp-stage">
            <motion.div className="rcore-ln-bp-copy-col rcore-ln-copy-front" {...fadeUp}>
              <p className="rcore-ln-eyebrow rcore-ln-eyebrow--blue">{film.svg_kicker}</p>
              <p className="rcore-ln-body">{film.blueprint_intro_body}</p>
              <p className="rcore-ln-sub">{film.svg_caption}</p>
            </motion.div>
            <motion.div className="rcore-ln-bp-svg-corner rcore-ln-copy-front" {...fadeUp}>
              <object
                type="image/svg+xml"
                data={blueprintSrc}
                className="rcore-ln-bp-svg"
                aria-label={blueprintAlt}
                aria-description={blueprintDesc}
                title={blueprintAlt}
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section ref={setAppNode} className="rcore-ln-section rcore-ln-section--app">
        <motion.div className="rcore-ln-app-stack rcore-ln-copy-front" {...fadeUp}>
          <p className="rcore-ln-eyebrow rcore-ln-eyebrow--blue">{film.application_kicker}</p>
          <h2 className="rcore-ln-app-heading">{film.application_title}</h2>
          <p className="rcore-ln-body rcore-ln-app-body">{film.application_body}</p>
        </motion.div>
        <div className="rcore-ln-app-spacer" />
        <div className="rcore-ln-cards rcore-ln-copy-front">
          <div className="rcore-ln-cards__track">
            {appCards.map((c, i) => (
              <motion.div
                key={c.id}
                className="rcore-ln-cards__item"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{
                  duration: 0.52,
                  delay: prefersReducedMotion ? 0 : i * 0.09,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="rcore-ln-cards__card">
                  <Image
                    src={c.src}
                    alt={c.alt}
                    width={800}
                    height={500}
                    sizes="(max-width: 900px) 78vw, 760px"
                    className="rcore-ln-cards__img"
                  />
                </div>
                <p className="rcore-ln-cards__caption">{c.caption}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={familyRef} className="rcore-ln-section rcore-ln-section--family">
        <motion.div className="rcore-ln-family-head rcore-ln-copy-front" {...fadeUp}>
          <p className="rcore-ln-eyebrow rcore-ln-eyebrow--blue">{film.r_family_kicker}</p>
          <h2 className="rcore-ln-family-title">{film.r_family_title}</h2>
        </motion.div>
        <div className="rcore-ln-family-spacer" />
        <motion.div
          ref={fanRef}
          className={`rcore-ln-fan rcore-ln-fan--flex rcore-ln-copy-front${fanPlayed ? ' rcore-ln-fan--assembled' : ''}`}
        >
          {familyAssets.map((fa, idx) => {
            /* 初始：三张散开；滚入视区后：收拢并排 */
            const rotScatter = idx === 0 ? -34 : idx === 2 ? 34 : 0;
            const xScatter = idx === 0 ? -54 : idx === 2 ? 54 : 0;
            const yScatter = idx === 0 ? 16 : idx === 2 ? 16 : idx === 1 ? -20 : 0;
            const lineup = { rotate: 0, x: 0, y: 0 };
            const scatter = { rotate: rotScatter, x: xScatter, y: yScatter };
            return (
              <motion.div
                key={fa.id}
                className={`rcore-ln-fan__card rcore-ln-fan__card--${idx === 0 ? 'l' : idx === 1 ? 'c' : 'r'}`}
                initial={false}
                animate={
                  prefersReducedMotion
                    ? lineup
                    : fanPlayed
                      ? lineup
                      : scatter
                }
                transition={{ duration: fanDur, ease: fanEase }}
              >
                <div className="rcore-ln-fan__portrait">
                  <Image
                    src={fa.src}
                    alt={fa.alt}
                    width={480}
                    height={854}
                    sizes="(max-width: 900px) 40vw, 280px"
                    className="rcore-ln-fan__img"
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        <motion.p className="rcore-ln-family-body rcore-ln-copy-front" {...fadeUp}>
          {film.r_family_body}
        </motion.p>
      </section>

      <section className="rcore-film-tail" aria-labelledby="rcore-film-tail-heading">
        <div className="rcore-film-tail__bg">
          <Image
            src={scenarioWebp}
            alt={film.scenario_image_alt}
            fill
            sizes="100vw"
            className="rcore-film-tail__bg-img"
          />
          <div className="rcore-film-tail__scrim" aria-hidden />
        </div>
        <div className="rcore-film-tail__inner rcore-ln-copy-front">
          <h2 id="rcore-film-tail-heading">{film.tail_title}</h2>
          <nav className="rcore-film-tail__links" aria-label={film.section_aria}>
            <Link href={`${base}/cobots/all-cobots-specs`}>{film.links.specs}</Link>
            <Link href={`${base}/selector/advisor`}>{film.links.advisor}</Link>
            <Link href={`${base}/selector/comparison`}>{film.links.side_by_side}</Link>
          </nav>
        </div>
      </section>
    </div>
  );
}
