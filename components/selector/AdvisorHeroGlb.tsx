'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';
import { cobotGlbModels, robotVariantImageAlt } from '@/data/products';
import { preloadGlb } from '@/lib/glb-cache';
import { getMessages } from '@/lib/messages';

type Lang = 'zh' | 'en';

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

  useEffect(() => {
    void preloadGlb(cobotGlbModels.rCoreFr5);
    const el = ref.current;
    if (!el) return;

    const onLoad = () => {
      try {
        applyPerfectMaterial(el.model);
      } catch {
        /* ignore */
      }

      const isMobile = window.innerWidth < 768;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      /* 配合缩小+回收位移：轻微回调 target，减少顶部留白感 */
      const target = isMobile ? '18% 150% auto' : '30% 158% auto';
      const orbitDist = isMobile ? '244m' : '338m';
      const polar = isMobile ? '79deg' : '78deg';
      const az = isMobile ? '29deg' : '33deg';
      el.setAttribute('camera-target', target);
      el.setAttribute('camera-orbit', `${az} ${polar} ${orbitDist}`);
      el.setAttribute('field-of-view', isMobile ? '16deg' : '10deg');
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
  }, []);

  const alt = getMessages(lang).alt.selector_hero ?? robotVariantImageAlt('fr5-std', lang);

  return (
    <section className="advisor-hero-glb" aria-label={alt}>
      <div className="advisor-hero-model-layer">
        <div className="advisor-hero-model-shift">
          <model-viewer
            ref={ref}
            src={cobotGlbModels.rCoreFr5}
            alt={alt}
            disable-zoom
            camera-orbit="33deg 78deg 338m"
            camera-target="30% 158% auto"
            field-of-view="10deg"
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
