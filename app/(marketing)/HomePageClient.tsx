'use client';
import React, { useState, useEffect, useRef, useMemo, type CSSProperties } from 'react';
import Image from 'next/image';
import { LoadingBrandLogo } from '@/components/LoadingBrandLogo';
import {
  cobotGlbModels,
  rSeriesData,
  robotVariantImageAlt,
} from '@/data/products';
import { getMessages } from '@/lib/messages';
import { useSiteLang } from '@/lib/site-lang-context';
import { trackCtaClick } from '@/lib/analytics';
import { openInquiry } from '@/lib/open-inquiry';
import { R_CORE_LITE_HERO_HD_PATH } from '@/lib/rcore-lite-page-config';
import { HeroArSpaceIcon } from '@/components/cobots/HeroArSpaceIcon';
import { isArPreviewCapable } from '@/lib/ar-device';
import { launchArPreview } from '@/lib/ar-preview-launch';
import { HomeApplicationsSection } from '@/components/home/HomeApplicationsSection';
import { HomeSupportTwinVisual } from '@/components/home/HomeSupportTwinVisual';
import { STORY_CHAPTER_IMAGES } from '@/lib/story-chapter-images';

function familyTitle(familyId: string) {
  return rSeriesData.find((f) => f.id === familyId)?.displayName ?? familyId;
}

/** Story twin panel — brand narrative visual from Our Story. */
const HOME_STORY_TWIN_IMAGE = STORY_CHAPTER_IMAGES.people;

/** After load: loading exit (~1300ms) + short beat — then ephemeral 360 hint (desktop only). */
const DRAG_HINT_SHOW_DELAY_MS = 1800;
const DRAG_HINT_VISIBLE_MS = 2500;

export default function HomePageClient() {
  const lang = useSiteLang();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showDragHint, setShowDragHint] = useState(false);
  const [isRliteHeroGlbLoaded, setIsRliteHeroGlbLoaded] = useState(false);
  const [enableRultraModel, setEnableRultraModel] = useState(false);
  const [rliteArLoading, setRliteArLoading] = useState(false);
  const [showHeroArEntry, setShowHeroArEntry] = useState(false);
  const viewerRef5 = useRef<any>(null);
  const viewerRef20 = useRef<any>(null);
  const rliteArViewerRef = useRef<any>(null);
  /** Joint spin loop id (`requestAnimationFrame`); cleared with `cancelAnimationFrame`. */
  const flangeSpinTimerRef = useRef<number | null>(null);
  const jointSpinActiveRef = useRef(false);
  const heroRotateDelayRef = useRef<number | null>(null);
  const hintHideTimerRef = useRef<number | null>(null);
  const dragHintShowTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const forceHideTimerRef = useRef<number | null>(null);
  const loadingUnmountTimerRef = useRef<number | null>(null);
  const heroRotateReadyRef = useRef(false);
  const home = getMessages(lang).homepage;
  const homePageMeta = getMessages(lang).pages.home;
  const rCorePage = getMessages(lang).pages.r_core;
  const alt = getMessages(lang).alt;
  const ctaLearn = home.ctaLearn;
  const ctaInquiry = home.ctaInquiry;
  const openHomeInquiry = () => openInquiry({ source: 'home_cta' });
  const path = (p: string) => `/${lang}${p.startsWith('/') ? p : `/${p}`}`;

  const titleRlite = useMemo(() => familyTitle('r-lite'), []);
  const titleRultra = useMemo(() => familyTitle('r-ultra'), []);
  const altHeroRliteGlb = useMemo(
    () => alt.hero_rlite ?? robotVariantImageAlt('fr3-c', lang),
    [alt.hero_rlite, lang],
  );
  const altHeroRultraGlb = useMemo(
    () => alt.hero_rultra ?? robotVariantImageAlt('fr30-std', lang),
    [alt.hero_rultra, lang],
  );
  const altHeroRcore = useMemo(
    () => alt.hero_rcore ?? alt.variant_images.r_core_fr5_std,
    [alt.hero_rcore, alt.variant_images.r_core_fr5_std, lang],
  );

  useEffect(() => {
    if (!isRliteHeroGlbLoaded) return;
    setEnableRultraModel(true);
  }, [isRliteHeroGlbLoaded]);

  useEffect(() => {
    const syncHeroArEntry = () => setShowHeroArEntry(isArPreviewCapable());
    syncHeroArEntry();
    window.addEventListener('resize', syncHeroArEntry);
    return () => window.removeEventListener('resize', syncHeroArEntry);
  }, []);

  const startRliteAr = () => {
    trackCtaClick('home_hero1_ar');
    setRliteArLoading(true);
    const run = () =>
      launchArPreview(
        rliteArViewerRef.current,
        { glb: cobotGlbModels.rLiteFr3CArGlb, usdz: cobotGlbModels.rLiteFr3CArUsdz },
        setRliteArLoading,
      );
    if (rliteArViewerRef.current) run();
    else requestAnimationFrame(run);
  };

  const rliteArLabel = rliteArLoading ? home.heroArLoading : home.heroArView;

  useEffect(() => {
    if (!isLoaded) return;
    if (loadingUnmountTimerRef.current) window.clearTimeout(loadingUnmountTimerRef.current);
    loadingUnmountTimerRef.current = window.setTimeout(() => {
      setShowLoadingScreen(false);
    }, 1300);
    return () => {
      if (loadingUnmountTimerRef.current) window.clearTimeout(loadingUnmountTimerRef.current);
    };
  }, [isLoaded]);

  const applyPerfectMaterial = (model: any) => {
    if (!model) return;
    model.materials.forEach((material: any) => {
      const name = material.name;
      const lowerName = name.toLowerCase();
      const isMetalPart =
        lowerName.includes('metal') ||
        lowerName.includes('steel') ||
        lowerName.includes('iron') ||
        lowerName.includes('joint') ||
        name === 'Material.001' ||
        name === 'Material.003';

      if (isMetalPart) {
        material.pbrMetallicRoughness.setMetallicFactor(1.0);
        material.pbrMetallicRoughness.setRoughnessFactor(0.2);
        material.pbrMetallicRoughness.setBaseColorFactor([0.8, 0.8, 0.8, 1]);
      } else {
        material.pbrMetallicRoughness.setMetallicFactor(0.0);
        material.pbrMetallicRoughness.setRoughnessFactor(0.38);
        material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
      }
    });
  };

  const quatFromAxisAngle = (axis: [number, number, number], angle: number): [number, number, number, number] => {
    const [ax, ay, az] = axis;
    const half = angle * 0.5;
    const s = Math.sin(half);
    return [ax * s, ay * s, az * s, Math.cos(half)];
  };

  const resolveNode = (viewer: any, names: string[]) => {
    for (const name of names) {
      const node =
        viewer?.model?.getNode?.(name) ||
        viewer?.model?.getNodeByName?.(name) ||
        viewer?.model?.scene?.getObjectByName?.(name) ||
        viewer?.scene?.getObjectByName?.(name);
      if (node) return node;
    }
    return null;
  };

  const applyNodeRotation = (node: any, axis: [number, number, number], angle: number) => {
    if (!node) return;
    const q = quatFromAxisAngle(axis, angle);
    if (Array.isArray(node.rotation) && node.rotation.length === 4) {
      node.rotation = q;
      return;
    }
    if (node.quaternion && typeof node.quaternion.set === 'function') {
      node.quaternion.set(q[0], q[1], q[2], q[3]);
      return;
    }
    if (node.rotation && typeof node.rotation === 'object') {
      if ('x' in node.rotation && 'y' in node.rotation && 'z' in node.rotation) {
        node.rotation.x = axis[0] ? angle : 0;
        node.rotation.y = axis[1] ? angle : 0;
        node.rotation.z = axis[2] ? angle : 0;
      }
    }
  };

  const heroLoadFinishedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let pollId: number | null = null;
    let v5Attached = false;
    let rafId: number | null = null;

    const finishLoading = () => {
      if (heroLoadFinishedRef.current) return;
      heroLoadFinishedRef.current = true;
      setLoadingProgress(100);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => setIsLoaded(true), 320);
    };

    const onProgress = (event: any) => {
      const raw = event?.detail?.totalProgress;
      if (typeof raw !== 'number') return;
      const progress = Math.min(99, Math.max(0, Math.round(raw * 100)));
      setLoadingProgress((prev) => Math.max(prev, progress));
      if (progress >= 99) finishLoading();
    };

    const stopJointSpin = () => {
      jointSpinActiveRef.current = false;
      if (flangeSpinTimerRef.current !== null) {
        window.cancelAnimationFrame(flangeSpinTimerRef.current);
        flangeSpinTimerRef.current = null;
      }
    };

    const startJointSpin = (viewer: any) => {
      if (jointSpinActiveRef.current) return;
      if (!viewer?.model) return;
      const flangeNode = resolveNode(viewer, ['J6_Flange', 'L6_flange']);
      const wristNode = resolveNode(viewer, ['Wrist_Roll', 'J4_Wrist_Roll', 'J5_Wrist_Pitch']);
      if (!flangeNode && !wristNode) return;
      jointSpinActiveRef.current = true;
      let angle = 0;
      const tick = () => {
        if (!jointSpinActiveRef.current || !viewer?.model) {
          stopJointSpin();
          return;
        }
        angle += 0.04;
        if (flangeNode) applyNodeRotation(flangeNode, [0, 1, 0], angle * 1.2);
        if (wristNode) applyNodeRotation(wristNode, [1, 0, 0], Math.sin(angle * 0.8) * 0.9);
        flangeSpinTimerRef.current = window.requestAnimationFrame(tick);
      };
      flangeSpinTimerRef.current = window.requestAnimationFrame(tick);
    };

    const scheduleDragHint = () => {
      if (isArPreviewCapable()) return;
      if (dragHintShowTimerRef.current) window.clearTimeout(dragHintShowTimerRef.current);
      if (hintHideTimerRef.current) window.clearTimeout(hintHideTimerRef.current);
      setShowDragHint(false);
      dragHintShowTimerRef.current = window.setTimeout(() => {
        dragHintShowTimerRef.current = null;
        setShowDragHint(true);
        hintHideTimerRef.current = window.setTimeout(() => setShowDragHint(false), DRAG_HINT_VISIBLE_MS);
      }, DRAG_HINT_SHOW_DELAY_MS);
    };

    const startSimpleHeroSequence = (viewer: any) => {
      if (!viewer) return;

      const isMobile = window.innerWidth < 768;

      const targetY = isMobile ? '122%' : '110%';
      viewer.setAttribute('camera-target', `auto ${targetY} auto`);

      const orbitDist = isMobile ? '1000m' : '1900m';
      viewer.setAttribute('camera-orbit', `45deg 85deg ${orbitDist}`);

      const fov = isMobile ? '25deg' : '15.5deg';
      viewer.setAttribute('field-of-view', fov);

      viewer.removeAttribute('auto-rotate');
      viewer.setAttribute('camera-controls', '');

      if (heroRotateDelayRef.current) window.clearTimeout(heroRotateDelayRef.current);
      heroRotateDelayRef.current = window.setTimeout(() => {
        heroRotateReadyRef.current = true;
        viewer.setAttribute('rotation-per-second', '-100%');
        viewer.setAttribute('auto-rotate', '');
      }, 1000);

      scheduleDragHint();
    };

    const onLoad5 = () => {
      const v5 = viewerRef5.current;
      if (!v5?.model) return;
      applyPerfectMaterial(v5.model);
      startJointSpin(v5);
      startSimpleHeroSequence(v5);
      setIsRliteHeroGlbLoaded(true);
      finishLoading();
    };

    const onLoad20 = () => {
      const v20 = viewerRef20.current;
      if (!v20?.model) return;
      applyPerfectMaterial(v20.model);
      const isMobile = window.innerWidth < 768;
      v20.setAttribute('camera-target', isMobile ? 'auto 122% auto' : 'auto 110% auto');
      v20.setAttribute('camera-orbit', `-45deg 80deg ${isMobile ? '1100m' : '2000m'}`);
      v20.setAttribute('field-of-view', isMobile ? '25deg' : '15.5deg');
    };

    const onHeroInteract = () => setShowDragHint(false);

    const attachHeroViewer = () => {
      const v5 = viewerRef5.current;
      if (!v5 || v5Attached) return;
      v5Attached = true;
      v5.setAttribute('fetchpriority', 'high');
      if (v5.model) {
        onLoad5();
      } else {
        v5.addEventListener('progress', onProgress);
        v5.addEventListener('load', onLoad5);
      }
      v5.addEventListener('pointerdown', onHeroInteract);
      v5.addEventListener('touchstart', onHeroInteract);

      const v20 = viewerRef20.current;
      if (v20) v20.addEventListener('load', onLoad20);
    };

    const syncHeroMotionByScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const v5 = viewerRef5.current;
        const v20 = viewerRef20.current;
        const y = window.scrollY;
        const vh = Math.max(window.innerHeight, 1);

        const hero1Active = y < vh * 1.25;
        if (hero1Active) startJointSpin(v5);
        else stopJointSpin();

        if (v5) {
          const hero1AutoRotateActive = heroRotateReadyRef.current && y < vh * 1.55;
          if (hero1AutoRotateActive) v5.setAttribute('auto-rotate', '');
          else v5.removeAttribute('auto-rotate');
        }
        if (v20) {
          const hero2AutoRotateActive = y > vh * 0.45 && y < vh * 2.5;
          if (hero2AutoRotateActive) v20.setAttribute('auto-rotate', '');
          else v20.removeAttribute('auto-rotate');
        }
      });
    };

    const boot = async () => {
      if (typeof customElements !== 'undefined') {
        try {
          await customElements.whenDefined('model-viewer');
        } catch {
          /* model-viewer script may load after first paint */
        }
      }
      if (cancelled) return;
      attachHeroViewer();
      if (!v5Attached) {
        pollId = window.setInterval(() => {
          if (cancelled) return;
          attachHeroViewer();
          if (v5Attached && pollId !== null) {
            window.clearInterval(pollId);
            pollId = null;
          }
        }, 50);
      }
    };

    boot();
    syncHeroMotionByScroll();
    window.addEventListener('scroll', syncHeroMotionByScroll, { passive: true });
    window.addEventListener('resize', syncHeroMotionByScroll);
    forceHideTimerRef.current = window.setTimeout(() => finishLoading(), 8000);

    return () => {
      cancelled = true;
      if (pollId !== null) window.clearInterval(pollId);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', syncHeroMotionByScroll);
      window.removeEventListener('resize', syncHeroMotionByScroll);
      const v5 = viewerRef5.current;
      const v20 = viewerRef20.current;
      if (v5) {
        v5.removeEventListener('progress', onProgress);
        v5.removeEventListener('load', onLoad5);
        v5.removeEventListener('pointerdown', onHeroInteract);
        v5.removeEventListener('touchstart', onHeroInteract);
      }
      if (v20) v20.removeEventListener('load', onLoad20);
      stopJointSpin();
      if (heroRotateDelayRef.current) window.clearTimeout(heroRotateDelayRef.current);
      if (dragHintShowTimerRef.current) window.clearTimeout(dragHintShowTimerRef.current);
      if (hintHideTimerRef.current) window.clearTimeout(hintHideTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (forceHideTimerRef.current) window.clearTimeout(forceHideTimerRef.current);
      if (loadingUnmountTimerRef.current) window.clearTimeout(loadingUnmountTimerRef.current);
    };
  }, []);

  return (
    <main className="roooll-home-wrapper">
      <h1 className="home-page-h1">{homePageMeta.metaTitleFocus}</h1>
      {/* Loading Screen */}
      {showLoadingScreen && (
        <div
          className={`loading-screen ${isLoaded ? 'exit' : ''}`}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: '#ffffff',
            /* 不依赖 styled-jsx 是否已注入：加载完成后立刻放行点击，避免整页卡死 */
            pointerEvents: isLoaded ? 'none' : 'auto',
          }}
        >
          <div className="loading-scale-shell">
            <div className="loading-content">
              <div
                className="loading-hero-type"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={loadingProgress}
                aria-label={home.loadingProgressAria.replace(/\{\{percent\}\}/g, String(loadingProgress))}
                style={{ ['--loading-p' as string]: String(loadingProgress) } as CSSProperties}
              >
                <div className="loading-slogan-main" aria-hidden="true">
                  {home.loadingSloganBefore}
                  <span className="loading-slogan-mark">
                    <span className="loading-slogan-logo-over-mark">
                      <LoadingBrandLogo
                        logoAlt={home.loadingLogoAlt}
                        frameClassName="loading-brand-plain-frame--over-letter"
                        decorative
                      />
                    </span>
                    {home.loadingSloganMark}
                  </span>
                  {home.loadingSloganAfter}
                </div>
                <p className="loading-subline">{home.loadingSubline1}</p>
                <p className="loading-subline">{home.loadingSubline2}</p>
                <div className="loading-hero-progress-slot" aria-hidden="true">
                  <div className="loading-hero-progress-bar">
                    <div className="loading-hero-progress-fill" />
                  </div>
                  <span className="loading-hero-progress-thumb" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 屏1: r-lite（FR3-C，`r-lite-cobot-fr3-c.glb`） */}
      <section className="screen-outer screen-outer--hero" style={{ backgroundColor: '#ffffff', color: '#1d1d1f' }}>
        <div className={`hero-3d-wrap ${isLoaded ? 'r-lite-cobot-fr3-entry-animation' : 'hidden-init'}`}>
          <model-viewer
            ref={viewerRef5}
            src={cobotGlbModels.rLiteFr3C}
            alt={altHeroRliteGlb}
            disable-zoom
            camera-orbit="45deg 85deg 1900m"
            camera-target="auto 110% auto"
            field-of-view="15.5deg"
            shadow-intensity="0.9"
            shadow-softness="1.15"
            environment-image="neutral"
            environment-intensity="0.82"
            exposure="0.98"
            interaction-prompt="none"
            touch-action="pan-y"
            style={
              {
                width: '100%',
                height: '100%',
                outline: 'none',
                backgroundColor: '#ffffff',
                // model-viewer default top loading stripe (#default-progress-bar); ~1s fade matches user-visible flash
                ['--progress-bar-height' as string]: '0px',
                ['--progress-bar-color' as string]: 'transparent',
              } as any
            }
          />
          {isLoaded ? (
            <model-viewer
              ref={rliteArViewerRef}
              className="hero-ar-viewer"
              alt={altHeroRliteGlb}
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="fixed"
              ar-placement="floor"
              loading="lazy"
              reveal="auto"
              camera-controls
              environment-image="neutral"
              shadow-intensity="0.9"
              interaction-prompt="none"
            />
          ) : null}
        </div>
        <div className={`drag-hint ${showDragHint ? 'show' : ''}`}>{home.dragHint}</div>
        <div className="content-limit">
          <div className="text-box">
            <h2 className="title">{titleRlite}</h2>
            <p className="subtitle">{home.heroRliteSubtitle}</p>
            <p className="hero-fact">{home.heroRliteFact}</p>
            <div className="hero-actions">
              <div className="cta-row">
                <a
                  href={path('/cobots/r-lite')}
                  className="cta-link"
                  aria-label={home.ctaLearnRliteAria}
                  onClick={() => trackCtaClick('home_hero1_learn_rlite')}
                >
                  {ctaLearn}
                </a>
                <button
                  type="button"
                  className="cta-link cta-btn"
                  onClick={() => {
                    trackCtaClick('home_hero1_inquiry');
                    openHomeInquiry();
                  }}
                >
                  {ctaInquiry}
                </button>
              </div>
              {isLoaded && showHeroArEntry ? (
                <div className="hero-ar-entry-wrap">
                  <button
                    type="button"
                    className="hero-ar-entry"
                    aria-label={home.heroArAria}
                    disabled={rliteArLoading}
                    onClick={startRliteAr}
                  >
                    <span className="hero-ar-entry__label">{rliteArLabel}</span>
                    <HeroArSpaceIcon />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 屏2: r-ultra（r-ultra-cobot-fr30.glb） */}
      <section className="screen-outer screen-outer--hero-dark" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
        <div className={`hero-3d-wrap hero-3d-wrap--dark ${isLoaded ? 'ready-visible' : 'hidden-init'}`}>
          <model-viewer
            ref={viewerRef20}
            src={enableRultraModel ? cobotGlbModels.rUltraFr30 : undefined}
            alt={altHeroRultraGlb}
            loading="lazy"
            auto-rotate
            disable-zoom
            camera-orbit="-45deg 80deg 2000m"
            camera-target="auto 110% auto"
            shadow-intensity="0.9"
            shadow-softness="1.15"
            environment-image="neutral"
            environment-intensity="0.82"
            exposure="1.02"
            field-of-view="15.5deg"
            touch-action="pan-y"
            style={
              {
                width: '100%',
                height: '100%',
                outline: 'none',
                backgroundColor: '#000000',
                ['--progress-bar-height' as string]: '0px',
                ['--progress-bar-color' as string]: 'transparent',
              } as any
            }
          />
        </div>
        <div className="content-limit">
          <div className="text-box">
            <h2 className="title">{titleRultra}</h2>
            <p className="subtitle">{home.heroRultraSubtitle}</p>
            <p className="hero-fact">{home.heroRultraFact}</p>
            <div className="hero-actions">
              <div className="cta-row">
                <a href={path('/cobots/r-ultra')} className="cta-link" aria-label={home.ctaLearnRultraAria}>
                  {ctaLearn}
                </a>
                <button type="button" className="cta-link cta-btn" onClick={openHomeInquiry}>
                  {ctaInquiry}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 屏3: r-Core（HD 静图 → 轻量落地页） */}
      <section className="screen-outer screen-outer--hero-core" style={{ backgroundColor: '#ffffff', color: '#1d1d1f' }}>
        <div className={`hero-image-wrap ${isLoaded ? 'r-core-cobot-fr5-entry-animation' : 'hidden-init'}`}>
          <Image
            src={R_CORE_LITE_HERO_HD_PATH}
            alt={altHeroRcore}
            fill
            loading="lazy"
            unoptimized
            sizes="100vw"
            className="hero-image-fill hero-image-fill--rcore"
          />
        </div>
        <div className="content-limit">
          <div className="text-box">
            <h2 className="title">{rCorePage.hero.title}</h2>
            <p className="subtitle">{rCorePage.hero.subtitle}</p>
            <p className="hero-fact">{home.heroRcoreFact}</p>
            <div className="hero-actions">
              <div className="cta-row">
                <a
                  href={path('/cobots/r-core')}
                  className="cta-link"
                  aria-label={home.ctaViewRcoreAria}
                  onClick={() => trackCtaClick('home_hero3_view_rcore')}
                >
                  {home.ctaViewRcore}
                </a>
                <a
                  href={path('/cobots/all-cobots-specs')}
                  className="cta-link"
                  aria-label={home.ctaSpecsAllAria}
                  onClick={() => trackCtaClick('home_hero3_specs_all')}
                >
                  {home.ctaSpecsAll}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeApplicationsSection />

      {/* 屏5+6: Support (primary) + Our Story — 6.5 : 3.5 */}
      <section className="twin-hero-section">
        <article className="twin-hero-panel twin-hero-panel--support">
          <HomeSupportTwinVisual />
          <div className="twin-hero-overlay">
            <h3>{home.twinSupportTitle}</h3>
            <p>{home.twinSupportBody}</p>
            <div className="cta-row card-cta">
              <a href={path('/support/service')} className="cta-link">
                {home.twinSupportCta}
              </a>
            </div>
          </div>
        </article>

        <article className="twin-hero-panel twin-hero-panel--story">
          <Image
            src={HOME_STORY_TWIN_IMAGE}
            alt={alt.story_chapter_people}
            fill
            sizes="(max-width: 768px) 100vw, 35vw"
            className="twin-hero-image"
          />
          <div className="twin-hero-overlay">
            <h3>{home.twinStoryTitle}</h3>
            <p>{home.twinStoryBody}</p>
            <div className="cta-row card-cta">
              <a href={path('/about/story')} className="cta-link">
                {home.twinStoryCta}
              </a>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
