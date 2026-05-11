'use client';

import type { CSSProperties } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cobotGlbModels, robotVariantImageAlt } from '@/data/products';
import { getMessages } from '@/lib/messages';

type Lang = 'zh' | 'en';

const detectMobileViewport = () =>
  window.matchMedia('(max-width: 1024px)').matches || window.matchMedia('(pointer: coarse)').matches;

const applyPerfectMaterial = (model: { materials: unknown[] }) => {
  if (!model?.materials) return;
  (
    model.materials as Array<{
      name?: string;
      pbrMetallicRoughness: {
        setMetallicFactor: (n: number) => void;
        setRoughnessFactor: (n: number) => void;
        setBaseColorFactor: (c: number[]) => void;
      };
    }>
  ).forEach((material) => {
    const name = material.name ?? '';
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

type WobbleParams = {
  baseAz: number;
  polar: string;
  orbitDist: string;
  amplitude: number;
  speed: number;
};

type Props = { lang: Lang };

export function AdvisorHeroGlb({ lang }: Props) {
  const ref = useRef<any>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const heroInViewRef = useRef(true);
  const wobbleParamsRef = useRef<WobbleParams | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  useLayoutEffect(() => {
    const syncViewport = () => setIsMobileViewport(detectMobileViewport());
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  useEffect(() => {
    setModelReady(false);
    wobbleParamsRef.current = null;
    const modelEl = ref.current;
    const sectionEl = sectionRef.current;
    if (!modelEl) return;

    const stopWobble = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const startWobble = () => {
      const params = wobbleParamsRef.current;
      if (!params) return;
      if (!heroInViewRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      stopWobble();
      const { baseAz, polar, orbitDist, amplitude, speed } = params;
      const t0 = performance.now();
      const tick = (now: number) => {
        if (!heroInViewRef.current) {
          stopWobble();
          return;
        }
        const t = (now - t0) / 1000;
        const wobble = Math.sin(t * speed) * amplitude;
        modelEl.setAttribute('camera-orbit', `${baseAz + wobble}deg ${polar} ${orbitDist}`);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const onLoad = () => {
      try {
        applyPerfectMaterial(modelEl.model);
      } catch {
        /* ignore */
      }

      const isMobile = detectMobileViewport();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const target = isMobile ? 'auto 118% auto' : '46% 158% auto';
      const orbitDist = isMobile ? '320m' : '360m';
      const polar = isMobile ? '80deg' : '78deg';
      const az = isMobile ? '29deg' : '33deg';
      modelEl.setAttribute('camera-target', target);
      modelEl.setAttribute('camera-orbit', `${az} ${polar} ${orbitDist}`);
      modelEl.setAttribute('field-of-view', isMobile ? '24deg' : '10.5deg');
      modelEl.removeAttribute('auto-rotate');
      modelEl.removeAttribute('camera-controls');

      if (!reduced) {
        const baseAz = isMobile ? 29 : 33;
        wobbleParamsRef.current = {
          baseAz,
          polar,
          orbitDist,
          amplitude: isMobile ? 1.0 : 1.4,
          speed: 0.55,
        };
        if (heroInViewRef.current) startWobble();
      } else {
        wobbleParamsRef.current = null;
      }

      requestAnimationFrame(() => setModelReady(true));
    };

    modelEl.addEventListener('load', onLoad);
    try {
      if ((modelEl as { loaded?: boolean }).loaded) onLoad();
    } catch {
      /* ignore */
    }

    let io: IntersectionObserver | null = null;
    if (sectionEl && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          const vis = Boolean(entries[0]?.isIntersecting);
          heroInViewRef.current = vis;
          if (vis) startWobble();
          else stopWobble();
        },
        { root: null, threshold: 0, rootMargin: '0px' },
      );
      io.observe(sectionEl);
    }

    return () => {
      modelEl.removeEventListener('load', onLoad);
      stopWobble();
      wobbleParamsRef.current = null;
      io?.disconnect();
    };
  }, [isMobileViewport]);

  const alt = getMessages(lang).alt.selector_hero ?? robotVariantImageAlt('fr5-c', lang);
  const initialCameraTarget = isMobileViewport ? 'auto 118% auto' : '46% 158% auto';
  const initialCameraOrbit = isMobileViewport ? '29deg 80deg 320m' : '33deg 78deg 360m';
  const initialFov = isMobileViewport ? '24deg' : '10.5deg';
  const modelShiftTransform = isMobileViewport
    ? 'translate(12vw, 10vh) scale(1)'
    : 'translate(calc(2% + 55vw), calc(12% + 42vh)) scale(1)';
  const modelLayerStyle = isMobileViewport
    ? {
        top: '-12vh',
        right: '-28vw',
        bottom: '-8vh',
        left: '-28vw',
        width: 'auto',
        overflow: 'visible' as const,
      }
    : { width: '240vw', left: '-70vw', right: 'auto', overflow: 'visible' as const };

  return (
    <section
      ref={sectionRef}
      className="advisor-hero-glb"
      aria-label={alt}
      style={{ width: '100vw', overflow: 'hidden' }}
    >
      <div className="advisor-hero-model-layer" style={modelLayerStyle}>
        <div className="advisor-hero-model-shift" style={{ transform: modelShiftTransform }}>
          <model-viewer
            ref={ref}
            src={cobotGlbModels.rCoreFr5C}
            alt={alt}
            disable-zoom
            camera-orbit={initialCameraOrbit}
            camera-target={initialCameraTarget}
            field-of-view={initialFov}
            shadow-intensity="0.9"
            shadow-softness="1.15"
            environment-image="neutral"
            environment-intensity="0.82"
            exposure="0.98"
            interaction-prompt="none"
            touch-action="none"
            style={
              {
                width: '100%',
                height: '100%',
                outline: 'none',
                backgroundColor: 'transparent',
                opacity: modelReady ? 1 : 0,
                transition: 'opacity 180ms ease-out',
                ['--progress-bar-height' as string]: '0px',
                ['--progress-bar-color' as string]: 'transparent',
              } as CSSProperties
            }
          />
        </div>
      </div>

      <div className="advisor-hero-text-band">
        <div className="advisor-hero-text-inner">
          <div className="advisor-hero-text-scale">
            <div className="advisor-hero-type">
              <h1 className="advisor-loading-slogan-main advisor-slogan-shine">
                {lang === 'zh' ? (
                  '寻找契合您愿景的 r 系列'
                ) : (
                  <>
                    <span className="advisor-slogan-line">Find the r-series that fits your</span>{' '}
                    <span className="advisor-slogan-vision">vision.</span>
                  </>
                )}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
