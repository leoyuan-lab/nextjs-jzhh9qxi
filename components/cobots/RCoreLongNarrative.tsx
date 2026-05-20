'use client';

/**
 * Long narrative blocks after the scroll film. Copy from `pages.*.scroll_film`
 * (`messagesPageKey`: `r_lite` | `r_ultra`). See `lib/cobot-immersive-page-config.ts`.
 */
import Image from 'next/image';
import Link from 'next/link';
import { trackCtaClick } from '@/lib/analytics';
import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties, RefObject, MutableRefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { RCoreFlangeHeroStill } from '@/components/cobots/RCoreFlangeHeroStill';
import {
  ROBOT_IMG_BASE,
  ROBOT_VECTOR_BASE,
  R_LITE_ADVISOR_FLANGE_HERO_DIM,
  robotVariantBlueprintAlt,
  robotVariantBlueprintDescription,
  robotVariantBlueprintSvgFilename,
  robotVariantById,
  robotVariantImageAlt,
  robotVariantWebpHdFilename,
} from '@/data/products';
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';
import {
  immersiveFlangeHeroAlt,
  immersivePrimaryCatalogVariantId,
  immersiveScrollFilmCatalogVariantId,
  readScrollFilmNamespace,
  type ImmersiveMessagesPageKey,
} from '@/lib/immersive-series-messages';

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? '');
}

function variantTemplateVars(variantId: string, lang: AppLocale): Record<string, string> {
  const v = robotVariantById[variantId];
  if (!v) return {};
  return {
    reach: v.reach,
    repeatability: v.repeatability,
    payload: v.payload,
    weight: v.weight,
    footprint: v.footprint,
    voltage: v.voltage,
    tcpSpeed: v.tcpSpeed,
    dof: v.dof,
    avgPower: v.avgPower,
    description: v.description[lang],
  };
}

const FAMILY_VARIANT_IDS = ['fr3-c', 'fr5-wml', 'fr20-std'] as const;

const APP_CARD_IDS_BY_PAGE: Record<ImmersiveMessagesPageKey, readonly string[]> = {
  r_lite: ['fr3-c', 'fr5-c', 'fr3-std'],
  r_ultra: ['fr30-std', 'fr20-std', 'fr16-std'],
};

const fadeUp = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  /* once：避免上滑时块从顶部离开视口又被 whileInView 打回 initial，造成文案「卡在顶端抖动」 */
  viewport: { once: true, amount: 0.28 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

type FilmCopy = {
  section_aria: string;
  flange_section_kicker: string;
  flange_section_title: string;
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
  r_family_subtitle: string;
  r_family_body: string;
  tail_title: string;
  tail_subtitle?: string;
  links: { specs: string; advisor: string; side_by_side: string };
};

export type RCoreLongNarrativeProps = {
  lang: AppLocale;
  /** @default 'r_lite' — r‑ultra 沉浸页传 `r_ultra` */
  messagesPageKey?: ImmersiveMessagesPageKey;
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
  messagesPageKey = 'r_lite',
  flangeSectionRef,
  bpSectionRef,
  appSectionRef,
  narrativeRootRef,
}: RCoreLongNarrativeProps) {
  const base = `/${lang}`;
  const film = useMemo(
    () => readScrollFilmNamespace(lang, messagesPageKey) as FilmCopy,
    [lang, messagesPageKey],
  );
  const prefersReducedMotion = useReducedMotion();
  const primaryVariantId = immersivePrimaryCatalogVariantId(messagesPageKey);
  const heroVariantId = immersiveScrollFilmCatalogVariantId(messagesPageKey);
  const heroVars = useMemo(() => variantTemplateVars(heroVariantId, lang), [heroVariantId, lang]);

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

  const reduceMotion = prefersReducedMotion === true;
  const [fanProgress, setFanProgress] = useState(0);

  const syncFanProgress = useCallback(() => {
    if (reduceMotion) {
      setFanProgress(1);
      return;
    }
    const el = fanRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    /* 向下滚（内容上移、rect.top 变小）→ progress 增大 → 收拢；向上则展开 */
    const start = vh * 0.88;
    const end = vh * 0.32;
    const span = Math.max(1, start - end);
    const t = Math.max(0, Math.min(1, (start - rect.top) / span));
    setFanProgress(t);
  }, [reduceMotion]);

  useLayoutEffect(() => {
    if (reduceMotion) {
      setFanProgress(1);
      return;
    }
    syncFanProgress();
  }, [reduceMotion, syncFanProgress]);

  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncFanProgress);
    };
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [reduceMotion, syncFanProgress]);

  const blueprintSrc = `${ROBOT_VECTOR_BASE}/${robotVariantBlueprintSvgFilename(primaryVariantId)}`;
  const blueprintAlt = robotVariantBlueprintAlt(primaryVariantId, lang);
  const blueprintDesc = robotVariantBlueprintDescription(primaryVariantId, lang);
  const scenarioWebp = `${ROBOT_IMG_BASE}/${robotVariantWebpHdFilename(primaryVariantId)}`;

  const familyAssets = useMemo(
    () =>
      FAMILY_VARIANT_IDS.map((id) => ({
        id,
        src: `${ROBOT_IMG_BASE}/${robotVariantWebpHdFilename(id)}`,
        alt: robotVariantImageAlt(id, lang),
      })),
    [lang],
  );

  const appCardIds = APP_CARD_IDS_BY_PAGE[messagesPageKey];

  const appCards = useMemo(
    () =>
      appCardIds.map((id, i) => ({
        id,
        src: `${ROBOT_IMG_BASE}/${robotVariantWebpHdFilename(id)}`,
        alt: robotVariantImageAlt(id, lang),
        caption: fillTemplate(
          film.application_cards[i]?.caption ?? '',
          variantTemplateVars(id, lang),
        ),
      })),
    [lang, film.application_cards, appCardIds],
  );

  const flangeHeroAlt = immersiveFlangeHeroAlt(lang, messagesPageKey);

  return (
    <div ref={setRootNode} className="rcore-ln-root" aria-label={film.section_aria}>
      <section
        ref={setFlangeNode}
        className="rcore-ln-section rcore-ln-section--flange"
        data-rcore-ln-flange
      >
        <div className="rcore-ln-flange-chapter" data-rcore-flange-chapter>
          <motion.div className="rcore-ln-flange-exit" data-rcore-flange-exit>
            <motion.div className="rcore-ln-flange-intro rcore-ln-copy-front" {...fadeUp}>
              <div className="rcore-ln-flange-intro-head">
                <span className="rcore-ln-eyebrow rcore-ln-eyebrow--blue">{film.flange_section_kicker}</span>
                <h2 className="rcore-ln-flange-heading">{film.flange_section_title}</h2>
              </div>
            </motion.div>
            <div
              className="rcore-ln-flange-hero-visual"
              style={{
                aspectRatio: `${R_LITE_ADVISOR_FLANGE_HERO_DIM.width} / ${R_LITE_ADVISOR_FLANGE_HERO_DIM.height}`,
              }}
            >
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
                  <div className="rcore-ln-flange-col__head">
                    <h3 className="rcore-ln-flange-col__title">{col.title}</h3>
                    <hr className="rcore-ln-flange-col__rule" />
                  </div>
                  <p className="rcore-ln-flange-col__body">{fillTemplate(col.body, heroVars)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section ref={setBpNode} className="rcore-ln-section rcore-ln-section--bp">
        <div className="rcore-ln-bp-shell">
          <h2 className="rcore-ln-bp-main-title rcore-ln-copy-front">{film.blueprint_intro_title}</h2>
          <div className="rcore-ln-bp-stage">
            <motion.div className="rcore-ln-bp-copy-col rcore-ln-copy-front" {...fadeUp}>
              <p className="rcore-ln-eyebrow rcore-ln-eyebrow--blue">{film.svg_kicker}</p>
              <p className="rcore-ln-body">{film.blueprint_intro_body}</p>
            </motion.div>
            <motion.div className="rcore-ln-bp-svg-corner rcore-ln-copy-front" {...fadeUp}>
              <object
                type="image/svg+xml"
                data={blueprintSrc}
                className={`rcore-ln-bp-svg${primaryVariantId === 'fr30-std' ? ' rcore-ln-bp-svg--tall' : ''}`}
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
          <p className="rcore-ln-family-subtitle">{film.r_family_subtitle}</p>
        </motion.div>
        <div className="rcore-ln-family-spacer" />
        <motion.div
          ref={fanRef}
          className="rcore-ln-fan rcore-ln-fan--deck rcore-ln-copy-front"
          style={{ '--fan-stack': fanProgress } as CSSProperties}
        >
          {familyAssets.map((fa, idx) => (
              <div
                key={fa.id}
                className={`rcore-ln-fan__card rcore-ln-fan__card--${idx === 0 ? 'l' : idx === 1 ? 'c' : 'r'}`}
              >
                <div className="rcore-ln-fan__portrait">
                  <Image
                    src={fa.src}
                    alt={fa.alt}
                    width={960}
                    height={1708}
                    sizes="(max-width: 900px) 42vw, min(340px, 26vw)"
                    quality={92}
                    className="rcore-ln-fan__img"
                  />
                </div>
              </div>
          ))}
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
          {film.tail_subtitle?.trim() ? (
            <p className="rcore-film-tail__subtitle">{film.tail_subtitle}</p>
          ) : null}
          <nav className="rcore-film-tail__links" aria-label={film.section_aria}>
            <Link
              href={`${base}/cobots/all-cobots-specs`}
              onClick={() => trackCtaClick('film_tail_specs')}
            >
              {film.links.specs}
            </Link>
            <span className="rcore-film-tail__sep" aria-hidden>
              ·
            </span>
            <Link href={`${base}/selector/advisor`} onClick={() => trackCtaClick('film_tail_advisor')}>
              {film.links.advisor}
            </Link>
            <span className="rcore-film-tail__sep" aria-hidden>
              ·
            </span>
            <Link
              href={`${base}/selector/comparison`}
              onClick={() => trackCtaClick('film_tail_comparison')}
            >
              {film.links.side_by_side}
            </Link>
          </nav>
        </div>
      </section>
    </div>
  );
}
