'use client';

import type { RefObject, MutableRefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { robotVariantById } from '@/data/products';
import type { AppLocale } from '@/lib/messages';
import {
  immersiveScrollFilmCatalogVariantId,
  readScrollFilmNamespace,
  type ImmersiveMessagesPageKey,
} from '@/lib/immersive-series-messages';
import { isMobileNavScrollLocked } from '@/lib/mobile-nav-scroll-lock';
import {
  advPanelScrollMotion,
  computeFilmScrollSlice,
  filmAdv3RollOutMetrics,
  filmAdv3RollOutOffsetPx,
  smoothstep,
} from '@/lib/rcore-scroll-cameras';

type ScrollFilmCopy = {
  section_aria: string;
  advantages: {
    kicker: string;
    title: string;
    subtitle?: string;
    body: string;
    badge: string;
  }[];
};

export type RCoreScrollFilmProps = {
  lang: AppLocale;
  /** @default 'r_lite' */
  messagesPageKey?: ImmersiveMessagesPageKey;
  modelViewerRef: RefObject<HTMLElement | null>;
  fixedStageRef: RefObject<HTMLDivElement | null>;
  filmRootRef?: RefObject<HTMLElement | null>;
  heroTitle: string;
  heroSubtitle: string;
};

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? '');
}

function resetAdvLineStyles(el: HTMLElement | null) {
  if (!el) return;
  el.style.opacity = '';
  el.style.transform = '';
  el.style.filter = '';
}

/** Drop JS-driven visibility so the next tick can re-apply from scroll geometry (after menu / overflow glitches). */
function resetAdvPanelsBaseline(sticky: HTMLElement) {
  sticky.style.transform = '';
  sticky.querySelectorAll<HTMLElement>('[data-rfilm-adv]').forEach((node) => {
    node.style.opacity = '';
    node.style.visibility = '';
    node.style.pointerEvents = '';
    node.style.transform = '';
    node
      .querySelectorAll<HTMLElement>(
        '.rcore-film-adv__kicker, .rcore-film-adv__title, .rcore-film-adv__subtitle, .rcore-film-adv__body',
      )
      .forEach(resetAdvLineStyles);
  });
}

/** 文案卷轴动画；GLB 机位由 CobotImmersivePageClient 统一驱动 */
export function RCoreScrollFilm({
  lang,
  messagesPageKey = 'r_lite',
  modelViewerRef: _modelViewerRef,
  fixedStageRef,
  filmRootRef,
  heroTitle,
  heroSubtitle,
}: RCoreScrollFilmProps) {
  const film = useMemo(
    () => readScrollFilmNamespace(lang, messagesPageKey) as ScrollFilmCopy,
    [lang, messagesPageKey],
  );

  const advCount = film.advantages.length;
  const scrollSpacerVh = advCount;

  const catalogId = immersiveScrollFilmCatalogVariantId(messagesPageKey);
  const v = robotVariantById[catalogId];
  const vars = useMemo(
    () => ({
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
    }),
    [lang, v],
  );

  const scrollportRef = useRef<HTMLElement | null>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const reduceMotionRef = useRef(false);
  const mobileMenuOpenRef = useRef(false);

  const tick = useCallback(() => {
    rafRef.current = null;
    if (mobileMenuOpenRef.current || isMobileNavScrollLocked()) return;

    const root = scrollportRef.current;
    const sticky = stickyRef.current;
    if (!root || !sticky) return;

    const reduce = reduceMotionRef.current;
    const { si, local } = computeFilmScrollSlice(root, reduce);

    const heroCopy = heroOverlayRef.current;
    if (heroCopy) {
      const heroOp = si === 0 ? 1 - smoothstep(0.12, 0.78, local) : 0;
      heroCopy.style.opacity = String(heroOp);
      heroCopy.style.visibility = heroOp < 0.02 ? 'hidden' : 'visible';
    }

    const fixedStage = fixedStageRef.current;
    if (fixedStage) {
      fixedStage.classList.toggle('is-interactive', si === 0 && !reduce);
    }

    const advIndex = si >= 1 && si <= advCount ? si - 1 : -1;
    const scrollY = window.scrollY;
    const { exitStartY } = filmAdv3RollOutMetrics(root);
    const rollingOut = si === 3 && !reduce && scrollY > exitStartY;

    if (rollingOut) {
      const offPx = filmAdv3RollOutOffsetPx(root, scrollY);
      sticky.style.transform = `translate3d(0, ${offPx.toFixed(1)}px, 0)`;
    } else {
      sticky.style.transform = '';
    }

    const advEls = sticky.querySelectorAll<HTMLElement>('[data-rfilm-adv]');
    advEls.forEach((node) => {
      const idx = Number(node.dataset.rfilmAdv);
      if (!Number.isFinite(idx)) return;
      const kickerEl = node.querySelector<HTMLElement>('.rcore-film-adv__kicker');
      const titleEl = node.querySelector<HTMLElement>('.rcore-film-adv__title');
      const subtitleEl = node.querySelector<HTMLElement>('.rcore-film-adv__subtitle');
      const bodyEl = node.querySelector<HTMLElement>('.rcore-film-adv__body');
      const lineEls = [kickerEl, titleEl, subtitleEl, bodyEl];

      if (rollingOut) {
        const show = idx === advCount - 1;
        node.style.visibility = show ? 'visible' : 'hidden';
        node.style.opacity = show ? '1' : '0';
        node.style.pointerEvents = show ? 'auto' : 'none';
        node.style.transform = 'none';
        lineEls.forEach((el) => {
          if (!el) return;
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.filter = 'none';
        });
        return;
      }

      if (advIndex !== idx) {
        node.style.opacity = '0';
        node.style.visibility = 'hidden';
        node.style.pointerEvents = 'none';
        node.style.transform = 'translate3d(0, 22%, 0)';
        lineEls.forEach(resetAdvLineStyles);
        return;
      }

      const motion = reduce
        ? { opacity: 1, yPercent: 0 }
        : advPanelScrollMotion(local);

      node.style.visibility = motion.opacity > 0.02 ? 'visible' : 'hidden';
      node.style.opacity = String(motion.opacity);
      node.style.pointerEvents = motion.opacity > 0.08 ? 'auto' : 'none';
      node.style.transform = `translate3d(0, ${motion.yPercent.toFixed(2)}%, 0)`;

      lineEls.forEach((el) => {
        if (!el) return;
        if (reduce || motion.opacity > 0.12) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.filter = 'none';
        } else {
          el.style.opacity = String(motion.opacity);
          el.style.transform = 'none';
        }
      });
    });
  }, [advCount, fixedStageRef]);

  const schedule = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(tick);
  }, [tick]);

  useLayoutEffect(() => {
    schedule();
  }, [schedule, lang, scrollSpacerVh]);

  useEffect(() => {
    const el = scrollportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => schedule());
    ro.observe(el);
    return () => ro.disconnect();
  }, [schedule]);

  useEffect(() => {
    const onMobileMenu = (event: Event) => {
      const open = Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open);
      mobileMenuOpenRef.current = open;
      if (open) {
        if (rafRef.current != null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }
      const sticky = stickyRef.current;
      if (sticky) resetAdvPanelsBaseline(sticky);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => schedule());
      });
    };
    window.addEventListener('roooll-mobile-menu', onMobileMenu);

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncReduce = () => {
      reduceMotionRef.current = mq.matches;
      tick();
    };
    syncReduce();
    mq.addEventListener('change', syncReduce);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    schedule();
    return () => {
      window.removeEventListener('roooll-mobile-menu', onMobileMenu);
      mq.removeEventListener('change', syncReduce);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [schedule, tick]);

  return (
    <>
      <div ref={heroOverlayRef} className="rcore-hero-copy-fixed" data-rcore-hero-copy>
        {heroTitle.trim() ? <h1 className="rcore-hero-copy-fixed__title">{heroTitle}</h1> : null}
        {heroSubtitle.trim() ? <p className="rcore-hero-copy-fixed__sub">{heroSubtitle}</p> : null}
      </div>

      <section
        ref={(node) => {
          scrollportRef.current = node;
          if (filmRootRef) (filmRootRef as MutableRefObject<HTMLElement | null>).current = node;
        }}
        className="rcore-narrative-root"
        aria-label={film.section_aria}
      >
        <div className="rcore-scroll-slab-hero" aria-hidden />

        <div ref={stickyRef} className="rcore-film-sticky">
          <div className="rcore-film-adv-layer" aria-hidden={false}>
            {film.advantages.map((adv, i) => {
              const pos = i === 0 ? 'left' : i === 1 ? 'right' : 'center';
              return (
                <div key={i} className={`rcore-film-adv rcore-film-adv--pos-${pos}`} data-rfilm-adv={i}>
                  <div className="rcore-film-adv__col">
                    {adv.kicker.trim() ? (
                      <p className="rcore-film-adv__kicker">{fillTemplate(adv.kicker, vars)}</p>
                    ) : null}
                    <h2 className="rcore-film-adv__title">{fillTemplate(adv.title, vars)}</h2>
                    {adv.subtitle?.trim() ? (
                      <p className="rcore-film-adv__subtitle">{fillTemplate(adv.subtitle, vars)}</p>
                    ) : null}
                    <p className="rcore-film-adv__body">{fillTemplate(adv.body, vars)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="rcore-film-scroll-spacer"
          style={{ height: `calc(${scrollSpacerVh} * 100vh)` }}
          aria-hidden
        />
      </section>
    </>
  );
}
