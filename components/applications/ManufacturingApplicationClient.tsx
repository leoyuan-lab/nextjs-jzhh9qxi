'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  HorizontalScrollDots,
  scrollHorizontalSnapItem,
  useHorizontalScrollIndex,
} from '@/components/HorizontalScrollDots';
import { APPLICATION_MANUFACTURING_MEDIA } from '@/data/application-media';
import { getMessages } from '@/lib/messages';
import { openInquiry } from '@/lib/open-inquiry';
import { useSiteLang } from '@/lib/site-lang-context';

const fadeUp = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

function useScrollSteps(trackRef: RefObject<HTMLElement | null>, stepCount: number): number {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || stepCount <= 0) return;

    const update = () => {
      const rect = track.getBoundingClientRect();
      const scrollable = track.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setActiveStep(0);
        return;
      }
      const progressed = Math.min(1, Math.max(0, -rect.top / scrollable));
      const next = Math.min(stepCount - 1, Math.floor(progressed * stepCount));
      setActiveStep((prev) => (prev === next ? prev : next));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [stepCount, trackRef]);

  return activeStep;
}

function resolveAlt(
  lang: 'zh' | 'en',
  key: string,
  namespace: 'root' | 'variant_images' = 'root',
): string {
  const alt = getMessages(lang).alt;
  if (namespace === 'variant_images') {
    const variants = alt.variant_images as Record<string, string>;
    return variants[key] ?? key;
  }
  const root = alt as Record<string, unknown>;
  const value = root[key];
  return typeof value === 'string' ? value : key;
}

export function ManufacturingApplicationClient() {
  const lang = useSiteLang();
  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const copy = getMessages(safeLang).pages.applications_manufacturing;
  const reduceMotion = useReducedMotion();

  const [openerVisible, setOpenerVisible] = useState(reduceMotion === true);
  const [cinemaActive, setCinemaActive] = useState(false);

  const painTrackRef = useRef<HTMLElement>(null);
  const scenarioScrollerRef = useRef<HTMLDivElement>(null);
  const scenarioItemRefs = useRef<(HTMLElement | null)[]>([]);

  const painStep = useScrollSteps(painTrackRef, copy.painPoints.length);
  const scenarioIndex = useHorizontalScrollIndex(scenarioScrollerRef, () => scenarioItemRefs.current);

  const scenarioItems = useMemo(
    () =>
      APPLICATION_MANUFACTURING_MEDIA.scenarios.map((media, index) => ({
        media,
        copy: copy.scenarios.items[index],
      })),
    [copy.scenarios.items],
  );

  const productCards = useMemo(
    () =>
      APPLICATION_MANUFACTURING_MEDIA.products.map((product) => {
        const itemCopy = copy.products.items.find((item) => item.id === product.id);
        return { product, copy: itemCopy };
      }),
    [copy.products.items],
  );

  useEffect(() => {
    if (reduceMotion) {
      setOpenerVisible(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setOpenerVisible(true));
    return () => window.cancelAnimationFrame(id);
  }, [reduceMotion]);

  useEffect(() => {
    const node = painTrackRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setCinemaActive(true);
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const assignScenarioRef = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      scenarioItemRefs.current[index] = node;
    },
    [],
  );

  const openManufacturingInquiry = () =>
    openInquiry({
      source: 'application_manufacturing',
      body:
        safeLang === 'zh'
          ? '行业：智能制造\n负载：\n臂展：\n节拍/周期：\n'
          : 'Industry: Smart Manufacturing\nPayload:\nReach:\nCycle time:\n',
    });

  return (
    <article className="app-mfg-page" aria-label={copy.pageAria}>
      {/* Act 1 — Keynote opener */}
      <section className="app-mfg-act app-mfg-opener" aria-labelledby="app-mfg-opener-title">
        <div className={`app-mfg-opener-inner${openerVisible ? ' is-visible' : ''}`}>
          <p className="app-mfg-kicker">{copy.opener.kicker}</p>
          <h1 id="app-mfg-opener-title" className="app-mfg-opener-title">
            {copy.opener.title}
          </h1>
          <p className="app-mfg-opener-sub">{copy.opener.subtitle}</p>
        </div>
      </section>

      {/* Act 2 — Ambient cinema intro */}
      <section className="app-mfg-act app-mfg-ambient" aria-labelledby="app-mfg-ambient-title">
        <div className="app-mfg-ambient-stage">
          {cinemaActive ? (
            <video
              className="app-mfg-ambient-video"
              src={APPLICATION_MANUFACTURING_MEDIA.heroVideo}
              poster={APPLICATION_MANUFACTURING_MEDIA.heroPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
          ) : null}
          <div className="app-mfg-ambient-scrim" aria-hidden />
          <motion.div className="app-mfg-ambient-copy" {...(reduceMotion ? {} : fadeUp)}>
            <p className="app-mfg-kicker">{copy.ambient.eyebrow}</p>
            <h2 id="app-mfg-ambient-title" className="app-mfg-section-title">
              {copy.ambient.title}
            </h2>
            <p className="app-mfg-section-body">{copy.ambient.body}</p>
          </motion.div>
        </div>
      </section>

      {/* Act 3 — Pain points (scroll-driven, pinned video) */}
      <section
        ref={painTrackRef}
        className="app-mfg-act app-mfg-pain-track"
        aria-labelledby="app-mfg-pain-title"
        style={{ ['--app-mfg-pain-steps' as string]: copy.painPoints.length }}
      >
        <div className="app-mfg-pain-sticky">
          {cinemaActive ? (
            <video
              className="app-mfg-ambient-video"
              src={APPLICATION_MANUFACTURING_MEDIA.heroVideo}
              poster={APPLICATION_MANUFACTURING_MEDIA.heroPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
          ) : null}
          <div className="app-mfg-ambient-scrim app-mfg-ambient-scrim--pain" aria-hidden />
          <div className="app-mfg-pain-copy">
            <h2 id="app-mfg-pain-title" className="app-mfg-pain-label">
              {safeLang === 'zh' ? '产线痛点' : 'Line friction'}
            </h2>
            <ol className="app-mfg-pain-list">
              {copy.painPoints.map((line, index) => (
                <li
                  key={line}
                  className={`app-mfg-pain-item${painStep === index ? ' is-active' : ''}${
                    painStep > index ? ' is-past' : ''
                  }`}
                >
                  {line}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Act 4 — Before / after */}
      <section className="app-mfg-act app-mfg-compare" aria-labelledby="app-mfg-compare-title">
        <motion.div className="app-mfg-compare-inner" {...(reduceMotion ? {} : fadeUp)}>
          <h2 id="app-mfg-compare-title" className="app-mfg-section-title app-mfg-section-title--center">
            {copy.compare.title}
          </h2>
          <div className="app-mfg-compare-grid">
            <div className="app-mfg-compare-card app-mfg-compare-card--before">
              <p className="app-mfg-compare-label">{copy.compare.beforeLabel}</p>
              <p className="app-mfg-compare-body">{copy.compare.before}</p>
            </div>
            <div className="app-mfg-compare-card app-mfg-compare-card--after">
              <p className="app-mfg-compare-label">{copy.compare.afterLabel}</p>
              <p className="app-mfg-compare-body">{copy.compare.after}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Act 5 — Scenario carousel */}
      <section className="app-mfg-act app-mfg-scenarios" aria-labelledby="app-mfg-scenarios-title">
        <div className="app-mfg-scenarios-head">
          <p className="app-mfg-kicker">{copy.scenarios.kicker}</p>
          <h2 id="app-mfg-scenarios-title" className="app-mfg-section-title">
            {copy.scenarios.title}
          </h2>
        </div>
        <div ref={scenarioScrollerRef} className="app-mfg-scenarios-scroll">
          {scenarioItems.map(({ media, copy: itemCopy }, index) => (
            <article
              key={media.id}
              ref={assignScenarioRef(index)}
              className="app-mfg-scenario-card"
            >
              <div className="app-mfg-scenario-media">
                {media.kind === 'video' ? (
                  <video
                    src={media.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={resolveAlt(safeLang, media.altKey)}
                  />
                ) : (
                  <Image
                    src={media.src}
                    alt={resolveAlt(safeLang, media.altKey, media.altNamespace)}
                    fill
                    sizes="(max-width: 767px) 88vw, 420px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="app-mfg-scenario-body">
                <h3 className="app-mfg-scenario-title">{itemCopy?.title}</h3>
                <p className="app-mfg-scenario-text">{itemCopy?.body}</p>
              </div>
            </article>
          ))}
        </div>
        <HorizontalScrollDots
          count={scenarioItems.length}
          activeIndex={scenarioIndex}
          label={copy.scenarios.title}
          variant="dark"
          onSelect={(index) =>
            scrollHorizontalSnapItem(
              scenarioScrollerRef.current,
              scenarioItemRefs.current[index] ?? null,
            )
          }
        />
      </section>

      {/* Act 6 — Stats */}
      <section className="app-mfg-act app-mfg-stats" aria-labelledby="app-mfg-stats-title">
        <motion.div className="app-mfg-stats-inner" {...(reduceMotion ? {} : fadeUp)}>
          <h2 id="app-mfg-stats-title" className="app-mfg-section-title app-mfg-section-title--center">
            {copy.stats.title}
          </h2>
          <ul className="app-mfg-stats-grid">
            {copy.stats.items.map((item) => (
              <li key={item.value} className="app-mfg-stat">
                <p className="app-mfg-stat-value">{item.value}</p>
                <p className="app-mfg-stat-label">{item.label}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* Act 7 — Advantages */}
      <section className="app-mfg-act app-mfg-advantages" aria-labelledby="app-mfg-adv-title">
        <div className="app-mfg-advantages-head">
          <p className="app-mfg-kicker">{copy.advantages.kicker}</p>
          <h2 id="app-mfg-adv-title" className="app-mfg-section-title">
            {copy.advantages.title}
          </h2>
        </div>
        <ul className="app-mfg-adv-list">
          {copy.advantages.items.map((item, index) => (
            <motion.li
              key={item.title}
              className="app-mfg-adv-item"
              {...(reduceMotion ? {} : { ...fadeUp, transition: { ...fadeUp.transition, delay: index * 0.06 } })}
            >
              <h3 className="app-mfg-adv-item-title">{item.title}</h3>
              <p className="app-mfg-adv-item-body">{item.body}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Act 8 — Product picks */}
      <section className="app-mfg-act app-mfg-products" aria-labelledby="app-mfg-products-title">
        <div className="app-mfg-products-head">
          <p className="app-mfg-kicker">{copy.products.kicker}</p>
          <h2 id="app-mfg-products-title" className="app-mfg-section-title">
            {copy.products.title}
          </h2>
        </div>
        <div className="app-mfg-products-grid">
          {productCards.map(({ product, copy: itemCopy }) => (
            <Link
              key={product.id}
              href={`/${safeLang}${product.href}`}
              className="app-mfg-product-card"
            >
              <div className="app-mfg-product-media">
                <Image
                  src={product.image}
                  alt={resolveAlt(safeLang, product.altKey, 'variant_images')}
                  fill
                  sizes="(max-width: 767px) 100vw, 480px"
                  className="object-contain"
                />
              </div>
              <div className="app-mfg-product-body">
                <h3 className="app-mfg-product-title">{itemCopy?.title}</h3>
                <p className="app-mfg-product-text">{itemCopy?.body}</p>
                <span className="app-mfg-product-cta">{copy.products.cta}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Act 9 — Inquiry */}
      <section className="app-mfg-act app-mfg-closing" aria-labelledby="app-mfg-closing-title">
        <motion.div className="app-mfg-closing-inner" {...(reduceMotion ? {} : fadeUp)}>
          <h2 id="app-mfg-closing-title" className="app-mfg-closing-title">
            {copy.closing.title}
          </h2>
          <p className="app-mfg-closing-body">{copy.closing.body}</p>
          <div className="app-mfg-closing-actions">
            <button type="button" className="app-mfg-inquiry-btn" onClick={openManufacturingInquiry}>
              {copy.closing.ctaInquiry}
            </button>
            <Link href={`/${safeLang}/`} className="app-mfg-home-link">
              {copy.closing.ctaHome}
            </Link>
          </div>
        </motion.div>
      </section>
    </article>
  );
}
