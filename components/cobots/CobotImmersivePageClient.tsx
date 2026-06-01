'use client';

/**
 * Immersive r‑Series 详情壳（卷轴 + GLB + 长叙事）。`immersiveProductId`：`r-lite` | `r-ultra`。
 * 详见 `lib/cobot-immersive-page-config.ts`。
 */
import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { RCoreLongNarrative } from '@/components/cobots/RCoreLongNarrative';
import { RooollFaqSection } from '@/components/cobots/RooollFaqSection';
import { RCoreScrollFilm } from '@/components/cobots/RCoreScrollFilm';
import { RCoreAppStickySubnav } from '@/components/cobots/RCoreAppStickySubnav';
import { RCoreBrandTopStrip } from '@/components/cobots/RCoreBrandTopStrip';
import { cobotGlbModels, rSeriesData } from '@/data/products';
import {
  applyAdvisorFlangeMaterial,
  applyRcoreCamera,
  applyRcoreViewerLighting,
  armImmersiveSubnavOpacities,
  armMainNavProgressFromScrollY,
  cameraForFilmSlice,
  immersivePageHeroCamera,
  applyRUltraHeroFraming,
  clearViewerMotion,
  computeFilmScrollSlice,
  filmAdv3RollOutMetrics,
  filmAdv3RollOutOffsetPx,
  isFilmAdv3RollOutActive,
  rcoreViewerLightingAttrs,
  shouldShowScrollFilmGlb,
} from '@/lib/rcore-scroll-cameras';
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';
import {
  immersiveProductRouteToPageKey,
  type ImmersiveProductRouteId,
} from '@/lib/immersive-series-messages';
import { isMobileNavScrollLocked } from '@/lib/mobile-nav-scroll-lock';

const R_LITE_LINE = rSeriesData.find((f) => f.id === 'r-lite')!.displayName;
const R_ULTRA_LINE = rSeriesData.find((f) => f.id === 'r-ultra')!.displayName;

const IMMERSIVE_PAGE_PATH: Record<ImmersiveProductRouteId, '/cobots/r-lite' | '/cobots/r-ultra'> = {
  'r-lite': '/cobots/r-lite',
  'r-ultra': '/cobots/r-ultra',
};

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export type CobotImmersivePageClientProps = {
  initialLang: AppLocale;
  immersiveProductId: ImmersiveProductRouteId;
};

export function CobotImmersivePageClient({
  initialLang,
  immersiveProductId,
}: CobotImmersivePageClientProps) {
  const messagesPageKey = immersiveProductRouteToPageKey(immersiveProductId);
  const productLineLabel = immersiveProductId === 'r-ultra' ? R_ULTRA_LINE : R_LITE_LINE;
  const glbSrc =
    immersiveProductId === 'r-ultra' ? cobotGlbModels.rUltraFr30 : cobotGlbModels.rLiteFr3C;
  const viewerLightingPreset = immersiveProductId === 'r-lite' ? 'rLiteImmersive' : 'default';
  const viewerLighting = rcoreViewerLightingAttrs(viewerLightingPreset);
  const [heroCamera, setHeroCamera] = useState(() => immersivePageHeroCamera(immersiveProductId));
  const [lang, setLang] = useState<AppLocale>(initialLang);
  const [scrollVal, setScrollVal] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      : immersiveProductId === 'r-ultra'
        ? msgs.alt.hero_rultra
        : msgs.alt.hero_rlite;

  useLayoutEffect(() => {
    const syncHeroCamera = () => {
      setHeroCamera(immersivePageHeroCamera(immersiveProductId));
      if (immersiveProductId === 'r-ultra' && mvRef.current) {
        applyRUltraHeroFraming(mvRef.current);
      }
    };
    syncHeroCamera();
    window.addEventListener('resize', syncHeroCamera);
    return () => window.removeEventListener('resize', syncHeroCamera);
  }, [immersiveProductId]);

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
      if (isMobileNavScrollLocked()) return;
      setScrollVal(window.scrollY);
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
      const wantRotate = si <= 3 && !reduced;
      if (wantControls) el.setAttribute('camera-controls', '');
      else el.removeAttribute('camera-controls');
      if (wantRotate) el.setAttribute('auto-rotate', '');
      else el.removeAttribute('auto-rotate');
    };

    const syncStage = () => {
      if (isMobileNavScrollLocked()) return;

      const stage = fixedStageRef.current;
      const inner = modelInnerRef.current;
      const mv = mvRef.current;
      const film = filmRootRef.current;
      const app = appSectionRef.current;
      const lnRoot = narrativeRootRef.current;
      if (!stage || !mv) return;

      const vh = window.innerHeight;
      const reduced = mq.matches;

      const appRect = app?.getBoundingClientRect();
      const rootRect = lnRoot?.getBoundingClientRect();

      const scrollY = window.scrollY;
      const filmSlice = film ? computeFilmScrollSlice(film, reduced) : null;
      const filmGlbActive = film ? shouldShowScrollFilmGlb(film, reduced, scrollY) : false;
      const adv3RollOut =
        filmGlbActive && film ? isFilmAdv3RollOutActive(film, scrollY, reduced) : false;

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

      if (filmGlbActive && film && filmSlice) {
        setStageVisible(true, false);
        applyRcoreViewerLighting(mv, viewerLightingPreset);

        if (filmSlice.inView || adv3RollOut) {
          applyRcoreCamera(mv, cameraForFilmSlice(filmSlice.si, immersiveProductId), lastCamKeyRef);
          setViewerMotionForFilm(filmSlice.si, reduced);
        }

        /* 优点 1–2：只切机位；优点 3：与卷轴 sticky 同距 1:1 跟手上移滚出 */
        if (filmSlice.si === 3 && !reduced) {
          const { exitStartY } = filmAdv3RollOutMetrics(film);
          if (scrollY > exitStartY) {
            const offPx = filmAdv3RollOutOffsetPx(film, scrollY);
            stage.style.transform = `translate3d(0, ${offPx.toFixed(1)}px, 0)`;
          } else {
            stage.style.transform = '';
          }
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

    const onMobileMenu = (event: Event) => {
      const open = Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open);
      if (!open) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => syncStage());
        });
      }
    };

    syncStage();
    window.addEventListener('roooll-mobile-menu', onMobileMenu);
    window.addEventListener('scroll', syncStage, { passive: true });
    window.addEventListener('resize', syncStage, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncStage) : null;
    [filmRootRef, flangeSectionRef, bpSectionRef, appSectionRef, narrativeRootRef].forEach((r) => {
      if (r.current && ro) ro.observe(r.current);
    });
    mq.addEventListener('change', syncStage);
    return () => {
      window.removeEventListener('roooll-mobile-menu', onMobileMenu);
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
    const progress = armMainNavProgressFromScrollY(filmRootRef.current, scrollVal);
    window.dispatchEvent(new CustomEvent('roooll-main-nav-progress', { detail: { progress } }));
    return () => {
      window.dispatchEvent(new CustomEvent('roooll-main-nav-progress', { detail: { progress: 0 } }));
    };
  }, [scrollVal]);

  useEffect(() => {
    const onMobileMenu = (event: Event) => {
      setMobileMenuOpen(Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open));
    };
    window.addEventListener('roooll-mobile-menu', onMobileMenu);
    return () => window.removeEventListener('roooll-mobile-menu', onMobileMenu);
  }, []);

  const filmEl = filmRootRef.current;
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const subnavFade = armImmersiveSubnavOpacities(
    filmEl,
    scrollVal,
    appSectionRef.current,
    mobileMenuOpen,
    reducedMotion,
  );
  const brandStripOpacity = subnavFade.brand;
  const consultNavOpacity = subnavFade.consult;
  const [displayBrand, setDisplayBrand] = useState(0);
  const [displayConsult, setDisplayConsult] = useState(0);
  const brandTargetRef = useRef(0);
  const consultTargetRef = useRef(0);
  brandTargetRef.current = brandStripOpacity;
  consultTargetRef.current = consultNavOpacity;

  useEffect(() => {
    let frame = 0;
    const ease = 0.14;
    const tick = () => {
      setDisplayBrand((prev) => {
        const t = brandTargetRef.current;
        const next = prev + (t - prev) * ease;
        return Math.abs(t - next) < 0.002 ? t : next;
      });
      setDisplayConsult((prev) => {
        const t = consultTargetRef.current;
        const next = prev + (t - prev) * ease;
        return Math.abs(t - next) < 0.002 ? t : next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`roooll-wrapper arm-page-root${immersiveProductId === 'r-ultra' ? ' arm-page-root--r-ultra' : ''}`}
    >
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
            camera-orbit={heroCamera.orbit}
            camera-target={heroCamera.target}
            field-of-view={heroCamera.fov}
            shadow-intensity={viewerLighting.shadowIntensity}
            shadow-softness={viewerLighting.shadowSoftness}
            environment-image="neutral"
            environment-intensity={viewerLighting.environmentIntensity}
            exposure={viewerLighting.exposure}
            onLoad={(e) => {
              const el = e.target as HTMLElement;
              applyRcoreViewerLighting(el, viewerLightingPreset);
              if (immersiveProductId === 'r-ultra') {
                applyRUltraHeroFraming(el);
              } else {
                applyRcoreCamera(el, immersivePageHeroCamera(immersiveProductId));
              }
              if (
                immersiveProductId === 'r-lite' &&
                !materialAppliedRef.current &&
                (el as { model?: unknown }).model
              ) {
                applyAdvisorFlangeMaterial((el as { model?: unknown }).model, 'rLiteImmersive');
                materialAppliedRef.current = true;
              }
            }}
            style={{ width: '100%', height: '100%' } as React.CSSProperties}
          />
        </div>
      </div>

      <div
        className="rcore-brand-top-mount"
        style={{
          opacity: displayBrand,
          transform: `translate3d(0, ${((1 - displayBrand) * -52).toFixed(2)}px, 0)`,
          pointerEvents: displayBrand > 0.02 ? 'auto' : 'none',
        }}
        aria-hidden={displayBrand < 0.05}
      >
        <RCoreBrandTopStrip lang={lang} messagesPageKey={messagesPageKey} />
      </div>
      <div
        className="rcore-consult-nav-mount"
        style={{
          opacity: displayConsult,
          transform: `translate3d(0, ${((1 - displayConsult) * -56).toFixed(2)}px, 0)`,
          pointerEvents: displayConsult > 0.02 ? 'auto' : 'none',
        }}
        aria-hidden={displayConsult < 0.05}
      >
        <RCoreAppStickySubnav
          lang={lang}
          productLineLabel={productLineLabel}
          messagesPageKey={messagesPageKey}
        />
      </div>

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
      <RooollFaqSection
        lang={lang}
        pagePath={IMMERSIVE_PAGE_PATH[immersiveProductId]}
        productKey={immersiveProductId === 'r-lite' ? 'r_lite' : 'r_ultra'}
      />
    </div>
  );
}
