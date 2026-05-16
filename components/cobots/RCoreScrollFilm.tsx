'use client';

import type { RefObject, MutableRefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { robotVariantById } from '@/data/products';
import type { AppLocale } from '@/lib/messages';
import { readScrollFilmNamespace, type ImmersiveMessagesPageKey } from '@/lib/immersive-series-messages';
import { RCORE_FILM_SLICE_COUNT } from '@/lib/rcore-scroll-cameras';

type ScrollFilmCopy = {
  section_aria: string;
  advantages: { kicker: string; title: string; body: string; badge: string }[];
};

export type RCoreScrollFilmProps = {
  lang: AppLocale;
  /** @default 'r_core' */
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

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function appleEaseOut(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(1 - t, 2.65);
}

function resetAdvLineStyles(el: HTMLElement | null) {
  if (!el) return;
  el.style.opacity = '';
  el.style.transform = '';
  el.style.filter = '';
}

function applyAdvLineReveal(
  el: HTMLElement | null,
  elapsedMs: number,
  delayMs: number,
  durationMs: number,
  reduce: boolean,
) {
  if (!el) return;
  if (reduce) {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.filter = 'none';
    return;
  }
  const t = clamp01((elapsedMs - delayMs) / durationMs);
  const e = appleEaseOut(t);
  const oy = 12 * (1 - e);
  el.style.opacity = String(e);
  el.style.transform = `translate3d(0, ${oy.toFixed(2)}px, 0)`;
  el.style.filter = 'none';
}

/** 文案卷轴动画；GLB 机位由 RCorePageClient 统一驱动 */
export function RCoreScrollFilm({
  lang,
  messagesPageKey = 'r_core',
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

  const v = robotVariantById['fr5-c'];
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
  const lastAdvSliceRef = useRef(-1);
  const advRevealT0Ref = useRef<number | null>(null);

  const tick = useCallback(() => {
    rafRef.current = null;
    const root = scrollportRef.current;
    const sticky = stickyRef.current;
    if (!root || !sticky) return;

    const reduce = reduceMotionRef.current;
    const rect = root.getBoundingClientRect();
    const range = Math.max(1, root.offsetHeight - window.innerHeight);
    const raw = reduce ? 0.42 : -rect.top / range;
    const p = clamp01(raw);
    const sp = p * RCORE_FILM_SLICE_COUNT;
    const si = Math.min(RCORE_FILM_SLICE_COUNT - 1, Math.max(0, Math.floor(sp)));
    const local = sp - si;

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

    const advIndex = si >= 1 && si <= 3 ? si - 1 : -1;
    if (si >= 1 && si <= 3) {
      if (lastAdvSliceRef.current !== si) {
        lastAdvSliceRef.current = si;
        advRevealT0Ref.current = performance.now();
      }
    } else {
      lastAdvSliceRef.current = -1;
      advRevealT0Ref.current = null;
    }

    const advEls = sticky.querySelectorAll<HTMLElement>('[data-rfilm-adv]');
    const lineDuration = 1080;
    advEls.forEach((node) => {
      const idx = Number(node.dataset.rfilmAdv);
      if (!Number.isFinite(idx)) return;
      const titleEl = node.querySelector<HTMLElement>('.rcore-film-adv__title');
      const bodyEl = node.querySelector<HTMLElement>('.rcore-film-adv__body');
      if (advIndex !== idx) {
        node.style.opacity = '0';
        node.style.transform = 'translate3d(0, 12%, 0)';
        resetAdvLineStyles(titleEl);
        resetAdvLineStyles(bodyEl);
        return;
      }
      const enter = smoothstep(0.08, 0.72, local);
      const hold = 1 - smoothstep(0.72, 0.98, local);
      node.style.opacity = String(enter * (0.35 + 0.65 * hold));
      node.style.transform = `translate3d(0, ${(1 - enter) * 18}%, 0)`;

      const revealStart = advRevealT0Ref.current ?? performance.now();
      const elapsed = performance.now() - revealStart;
      applyAdvLineReveal(titleEl, elapsed, 0, lineDuration, reduce);
      applyAdvLineReveal(bodyEl, elapsed, 120, lineDuration, reduce);
    });
  }, [fixedStageRef]);

  const schedule = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(tick);
  }, [tick]);

  useLayoutEffect(() => {
    lastAdvSliceRef.current = -1;
    advRevealT0Ref.current = null;
    schedule();
  }, [schedule, lang]);

  useEffect(() => {
    const el = scrollportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => schedule());
    ro.observe(el);
    return () => ro.disconnect();
  }, [schedule]);

  useEffect(() => {
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
                    <h2 className="rcore-film-adv__title">{fillTemplate(adv.title, vars)}</h2>
                    <p className="rcore-film-adv__body">{fillTemplate(adv.body, vars)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="rcore-film-scroll-spacer"
          style={{ height: `calc(${RCORE_FILM_SLICE_COUNT - 2} * 100vh)` }}
          aria-hidden
        />
      </section>
    </>
  );
}
