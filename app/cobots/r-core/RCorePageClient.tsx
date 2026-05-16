'use client';

/**
 * Immersive r‑Series 详情壳（卷轴 + GLB + 长叙事）。默认 `immersiveProductId="r-core"`；
 * r‑max 传 `immersiveProductId="r-max"` 前须在 locales 补齐 `pages.r_max.scroll_film`（与 r_core 同结构）。
 * 详见 `lib/cobot-immersive-page-config.ts`。
 */
import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { RCoreLongNarrative } from '@/components/cobots/RCoreLongNarrative';
import { RCoreScrollFilm } from '@/components/cobots/RCoreScrollFilm';
import { RCoreAppStickySubnav } from '@/components/cobots/RCoreAppStickySubnav';
import { RCoreBrandTopStrip } from '@/components/cobots/RCoreBrandTopStrip';
import { cobotGlbModels, rSeriesData } from '@/data/products';
import {
  applyAdvisorFlangeMaterial,
  applyRcoreCamera,
  applyRcoreViewerLighting,
  cameraForFilmSlice,
  clearViewerMotion,
  computeFilmScrollSlice,
} from '@/lib/rcore-scroll-cameras';
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';
import {
  immersiveProductRouteToPageKey,
  type ImmersiveProductRouteId,
} from '@/lib/immersive-series-messages';

const R_CORE_LINE = rSeriesData.find((f) => f.id === 'r-core')!.displayName;
const R_MAX_LINE = rSeriesData.find((f) => f.id === 'r-max')!.displayName;

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function intersectsViewport(rect: DOMRect, vh: number): boolean {
  return rect.bottom > 0 && rect.top < vh;
}

export type RCorePageClientProps = {
  initialLang: AppLocale;
  /** @default 'r-core' — r‑max 须已有 `pages.r_max.scroll_film` 等（见 `lib/cobot-immersive-page-config.ts`） */
  immersiveProductId?: ImmersiveProductRouteId;
};

export function RCorePageClient({ initialLang, immersiveProductId = 'r-core' }: RCorePageClientProps) {
  const messagesPageKey = immersiveProductRouteToPageKey(immersiveProductId);
  const productLineLabel = immersiveProductId === 'r-max' ? R_MAX_LINE : R_CORE_LINE;
  const glbSrc = immersiveProductId === 'r-max' ? cobotGlbModels.rMaxFr20 : cobotGlbModels.rCoreFr5C;
  const [lang, setLang] = useState<AppLocale>(initialLang);
  const [scrollVal, setScrollVal] = useState(0);
  const mvRef = useRef<HTMLElement>(null);
  const fixedStageRef = useRef<HTMLDivElement>(null);
  const modelInnerRef = useRef<HTMLDivElement>(null);
  const filmRootRef = useRef<HTMLElement>(null);
  const flangeSectionRef = useRef<HTMLElement>(null);
  const bpSectionRef = useRef<HTMLElement>(null);
  const appSectionRef = useRef<HTMLElement>(null);
  const narrativeRootRef = useRef<HTMLElement>(null);
  const lastCamKeyRef = useRef('');
  const materialAppliedRef = useRef(false);

  const msgs = getMessages(lang);
  const pagePack = msgs.pages[messagesPageKey] as Record<string, unknown>;
  const heroSubtitle =
    pagePack &&
    typeof pagePack.hero === 'object' &&
    pagePack.hero &&
    'subtitle' in pagePack.hero
      ? String((pagePack.hero as { subtitle: unknown }).subtitle)
      : '';
  const heroModelAlt =
    typeof pagePack.immersive_glb_alt === 'string'
      ? pagePack.immersive_glb_alt
      : immersiveProductId === 'r-max'
        ? msgs.alt.hero_rmax
        : msgs.alt.hero_rcore;

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    setScrollVal(0);
  }, []);

  useEffect(() => {
    const syncLang = () => {
      const saved = (localStorage.getItem('user-lang') as AppLocale) || 'zh';
      if (saved === 'en' || saved === 'zh') setLang(saved);
    };
    window.addEventListener('langChange', syncLang);

    const handleScroll = () => {
      const y = window.scrollY;
      setScrollVal(y);
    };
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('langChange', syncLang);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const resetInner = () => {
      const inner = modelInnerRef.current;
      if (!inner) return;
      inner.style.opacity = '';
      inner.style.transform = '';
      inner.style.filter = '';
    };

    const setStageVisible = (visible: boolean, foreground: boolean) => {
      const stage = fixedStageRef.current;
      if (!stage) return;
      stage.classList.toggle('rcore-fixed-model-stage--hidden', !visible);
      stage.classList.toggle('rcore-fixed-model-stage--foreground', foreground);
      stage.classList.remove('rcore-fixed-model-stage--advisor-framing');
    };

    const setViewerMotionForFilm = (si: number, reduced: boolean) => {
      const el = mvRef.current;
      if (!el) return;
      const wantControls = si === 0 && !reduced;
      const wantRotate = si < 3 && !reduced;
      if (wantControls) el.setAttribute('camera-controls', '');
      else el.removeAttribute('camera-controls');
      if (wantRotate) el.setAttribute('auto-rotate', '');
      else el.removeAttribute('auto-rotate');
    };

    const syncStage = () => {
      const stage = fixedStageRef.current;
      const inner = modelInnerRef.current;
      const mv = mvRef.current;
      const film = filmRootRef.current;
      const flange = flangeSectionRef.current;
      const app = appSectionRef.current;
      const lnRoot = narrativeRootRef.current;
      if (!stage || !mv) return;

      const vh = window.innerHeight;
      const reduced = mq.matches;

      const filmRect = film?.getBoundingClientRect();
      const flangeRect = flange?.getBoundingClientRect();
      const appRect = app?.getBoundingClientRect();
      const rootRect = lnRoot?.getBoundingClientRect();

      const filmVisible = filmRect ? intersectsViewport(filmRect, vh) : false;
      const filmSlice = film ? computeFilmScrollSlice(film, reduced) : null;
      const flangeInView = Boolean(flangeRect && flangeRect.bottom > 0 && flangeRect.top < vh);

      const pastNarrative = rootRect ? rootRect.bottom < vh * 0.18 : false;
      const appEntered = appRect ? appRect.top < vh * 0.5 && appRect.bottom > 0 : false;
      const hideForFooter = pastNarrative || appEntered;

      if (hideForFooter) {
        setStageVisible(false, false);
        stage.style.transform = '';
        resetInner();
        clearViewerMotion(mv);
        return;
      }

      /* 法兰 + 蓝图及之后：不再挂载固定 GLB（蓝图段无闪现） */
      if (flangeInView) {
        setStageVisible(false, false);
        stage.style.transform = '';
        resetInner();
        clearViewerMotion(mv);
        return;
      }

      /* 卷轴：hero + 三优点；第三优点 slice 内与文案同步上飞出屏 */
      if (filmVisible && film && filmSlice) {
        const exitT =
          filmSlice.si === 3 ? smoothstep(0.72, 0.995, filmSlice.local) : 0;

        if (exitT >= 0.999) {
          setStageVisible(false, false);
          stage.style.transform = '';
          resetInner();
          clearViewerMotion(mv);
          return;
        }

        setStageVisible(true, false);
        applyRcoreViewerLighting(mv);

        if (filmSlice.inView) {
          applyRcoreCamera(mv, cameraForFilmSlice(filmSlice.si), lastCamKeyRef);
          setViewerMotionForFilm(filmSlice.si, reduced);
        }

        if (exitT > 0 && !reduced) {
          stage.style.transform = `translate3d(0, ${(-exitT * 1.12 * vh).toFixed(1)}px, 0)`;
        } else {
          stage.style.transform = '';
        }
        resetInner();
        return;
      }

      setStageVisible(false, false);
      stage.style.transform = '';
      resetInner();
    };

    syncStage();
    window.addEventListener('scroll', syncStage, { passive: true });
    window.addEventListener('resize', syncStage, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncStage) : null;
    [filmRootRef, flangeSectionRef, bpSectionRef, appSectionRef, narrativeRootRef].forEach((r) => {
      if (r.current && ro) ro.observe(r.current);
    });
    mq.addEventListener('change', syncStage);
    return () => {
      window.removeEventListener('scroll', syncStage);
      window.removeEventListener('resize', syncStage);
      mq.removeEventListener('change', syncStage);
      ro?.disconnect();
      const st = fixedStageRef.current;
      st?.classList.remove('rcore-fixed-model-stage--hidden', 'rcore-fixed-model-stage--foreground');
      if (st) st.style.transform = '';
      resetInner();
    };
  }, []);

  useEffect(() => {
    const navHideStart = 24;
    const navHideRange = 86;
    const progress = Math.max(0, Math.min(1, (scrollVal - navHideStart) / navHideRange));
    window.dispatchEvent(new CustomEvent('roooll-main-nav-progress', { detail: { progress } }));
    return () => {
      window.dispatchEvent(new CustomEvent('roooll-main-nav-progress', { detail: { progress: 0 } }));
    };
  }, [scrollVal]);

  const navHideStart = 24;
  const navHideRange = 86;
  const navProgress = Math.max(0, Math.min(1, (scrollVal - navHideStart) / navHideRange));
  const isNavHidden = navProgress > 0.98;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const appEl = appSectionRef.current;
  const appReached = Boolean(
    isNavHidden && appEl && appEl.getBoundingClientRect().top < vh * 0.92,
  );
  const showBrandStrip = isNavHidden && scrollVal > 620 && !appReached;
  const showConsultNav = isNavHidden && appReached;

  return (
    <div className="roooll-wrapper arm-page-root">
      <div ref={fixedStageRef} className="rcore-fixed-model-stage">
        <div ref={modelInnerRef} className="rcore-fixed-model-inner">
          <model-viewer
            ref={mvRef}
            src={glbSrc}
            alt={heroModelAlt}
            camera-controls
            auto-rotate
            disable-zoom
            touch-action="pan-y"
            interaction-prompt="none"
            camera-orbit="45deg 85deg 1900m"
            camera-target="auto 110% auto"
            field-of-view="15.5deg"
            shadow-intensity="0.9"
            shadow-softness="1.15"
            environment-image="neutral"
            environment-intensity="0.82"
            exposure="0.98"
            onLoad={(e) => {
              const el = e.target as HTMLElement;
              applyRcoreViewerLighting(el);
              if (
                immersiveProductId === 'r-core' &&
                !materialAppliedRef.current &&
                (el as { model?: unknown }).model
              ) {
                applyAdvisorFlangeMaterial((el as { model?: unknown }).model);
                materialAppliedRef.current = true;
              }
            }}
            style={{ width: '100%', height: '100%' } as React.CSSProperties}
          />
        </div>
      </div>

      {showBrandStrip && <RCoreBrandTopStrip lang={lang} />}
      {showConsultNav && <RCoreAppStickySubnav lang={lang} productLineLabel={productLineLabel} />}

      <RCoreScrollFilm
        lang={lang}
        messagesPageKey={messagesPageKey}
        modelViewerRef={mvRef}
        fixedStageRef={fixedStageRef}
        filmRootRef={filmRootRef}
        heroTitle={productLineLabel}
        heroSubtitle={heroSubtitle}
      />
      <RCoreLongNarrative
        lang={lang}
        messagesPageKey={messagesPageKey}
        flangeSectionRef={flangeSectionRef}
        bpSectionRef={bpSectionRef}
        appSectionRef={appSectionRef}
        narrativeRootRef={narrativeRootRef}
      />
    </div>
  );
}
