'use client';

import type { CSSProperties } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cobotGlbModels, robotVariantImageAlt } from '@/data/products';
import { preloadGlb } from '@/lib/glb-cache';
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

type Props = { lang: Lang };

export function AdvisorHeroGlb({ lang }: Props) {
  const ref = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
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
    void preloadGlb(cobotGlbModels.rLiteFr3C);
    const el = ref.current;
    if (!el) return;

    const onLoad = () => {
      try {
        applyPerfectMaterial(el.model);
      } catch {
        /* ignore */
      }

      const isMobile = detectMobileViewport();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      /* 配合缩小+回收位移：轻微回调 target，减少顶部留白感 */
      const target = isMobile ? 'auto 118% auto' : '46% 158% auto';
      const orbitDist = isMobile ? '320m' : '360m';
      const polar = isMobile ? '80deg' : '78deg';
      const az = isMobile ? '29deg' : '33deg';
      el.setAttribute('camera-target', target);
      el.setAttribute('camera-orbit', `${az} ${polar} ${orbitDist}`);
      el.setAttribute('field-of-view', isMobile ? '24deg' : '10.5deg');
      el.removeAttribute('auto-rotate');
      el.removeAttribute('camera-controls');

      if (!reduced) {
        const baseAz = isMobile ? 29 : 33;
        const amplitude = isMobile ? 1.0 : 1.4;
        const speed = 0.55;
        const t0 = performance.now();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const tick = (now: number) => {
          const t = (now - t0) / 1000;
          const wobble = Math.sin(t * speed) * amplitude;
          el.setAttribute('camera-orbit', `${baseAz + wobble}deg ${polar} ${orbitDist}`);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }

      requestAnimationFrame(() => setModelReady(true));
    };

    el.addEventListener('load', onLoad);
    try {
      if ((el as { loaded?: boolean }).loaded) onLoad();
    } catch {
      /* ignore */
    }

    return () => {
      el.removeEventListener('load', onLoad);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobileViewport]);

  const alt = getMessages(lang).alt.selector_hero ?? robotVariantImageAlt('fr5-std', lang);
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
    <section className="advisor-hero-glb" aria-label={alt} style={{ width: '100vw', overflow: 'hidden' }}>
      <div className="advisor-hero-model-layer" style={modelLayerStyle}>
        <div className="advisor-hero-model-shift" style={{ transform: modelShiftTransform }}>
          <model-viewer
            ref={ref}
            src={cobotGlbModels.rLiteFr3C}
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
                  '寻找契合你愿景的 r 系列。'
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
