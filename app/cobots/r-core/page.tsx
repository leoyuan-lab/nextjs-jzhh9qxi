'use client';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { cobotGlbModels, rSeriesData, robotVariantImageAlt } from '@/data/products';
import { getRCoreDetailCopy } from '@/lib/cobot-detail-pages';
import { preloadGlb } from '@/lib/glb-cache';
import { getMessages } from '@/lib/messages';

const R_LITE = rSeriesData.find((f) => f.id === 'r-lite')!.displayName;
const R_MAX = rSeriesData.find((f) => f.id === 'r-max')!.displayName;

export default function CobotsRCorePage() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [scrollVal, setScrollVal] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [allowDetailModels, setAllowDetailModels] = useState(false);
  const scrollRefH = useRef<HTMLDivElement>(null);
  const [progH, setProgH] = useState(0);
  const cardSpinTimersRef = useRef<number[]>([]);

  const msgs = getMessages(lang);
  const copy = getRCoreDetailCopy(lang, { rCore: R_LITE, rMax: R_MAX });
  const alt = msgs.alt;
  const fr5HeroAlt = alt.hero_rcore ?? robotVariantImageAlt('fr3-c', lang);
  const fr5DetailAlt = alt.r_core_detail ?? fr5HeroAlt;
  const detailAltByNode: Record<string, string> = {
    J6_Flange: alt.r_core_detail_flange ?? fr5DetailAlt,
    J1_Base: alt.r_core_detail_base ?? fr5DetailAlt,
    J3_Elbow: alt.r_core_detail_elbow ?? fr5DetailAlt,
    Wrist_Roll: alt.r_core_detail_wrist ?? fr5DetailAlt,
  };

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    setScrollVal(0);
    setHasScrolled(false);
  }, []);

  useEffect(() => {
    void preloadGlb(cobotGlbModels.rLiteFr3C, { highPriority: true });
  }, []);

  useEffect(() => {
    const syncLang = () => {
      const saved = (localStorage.getItem('user-lang') as 'zh' | 'en') || 'zh';
      setLang(saved);
    };
    syncLang();
    window.addEventListener('langChange', syncLang);

    const handleScroll = () => {
      const y = window.scrollY;
      setScrollVal(y);
      if (!hasScrolled && y > 2) setHasScrolled(true);
    };
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(() => setHeroReady(true), 100);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('langChange', syncLang);
    };
  }, []);

  useEffect(() => {
    const navHideStart = 24;
    const navHideRange = 86;
    const progress = Math.max(0, Math.min(1, (scrollVal - navHideStart) / navHideRange));
    window.dispatchEvent(new CustomEvent('apple-main-nav-progress', { detail: { progress } }));
    return () => {
      window.dispatchEvent(new CustomEvent('apple-main-nav-progress', { detail: { progress: 0 } }));
    };
  }, [scrollVal]);

  const applyAppleStyle = (model: any) => {
    if (!model) return;
    model.materials.forEach((m: any) => {
      const name = m.name || '';
      const lowerName = name.toLowerCase();
      const isMetal =
        lowerName.includes('metal') ||
        lowerName.includes('steel') ||
        lowerName.includes('iron') ||
        lowerName.includes('joint') ||
        name === 'Material.001' ||
        name === 'Material.003';
      if (isMetal) {
        m.pbrMetallicRoughness.setMetallicFactor(0.92);
        m.pbrMetallicRoughness.setRoughnessFactor(0.28);
        m.pbrMetallicRoughness.setBaseColorFactor([0.86, 0.83, 0.8, 1]);
      } else {
        m.pbrMetallicRoughness.setMetallicFactor(0.0);
        m.pbrMetallicRoughness.setRoughnessFactor(0.48);
        m.pbrMetallicRoughness.setBaseColorFactor([0.95, 0.94, 0.93, 1]);
      }
    });
  };
  const startCardNodeMotion = (viewer: any, nodeName: string, speed = 0.02) => {
    const node = viewer?.model?.getNode?.(nodeName);
    if (!node) return;
    let angle = 0;
    const timer = window.setInterval(() => {
      angle += speed;
      node.rotation = nodeName.toLowerCase().includes('wrist')
        ? [angle * 0.6, 0, 0]
        : [0, angle, 0];
    }, 16);
    cardSpinTimersRef.current.push(timer);
  };

  useEffect(() => {
    return () => {
      cardSpinTimersRef.current.forEach((timer) => window.clearInterval(timer));
      cardSpinTimersRef.current = [];
    };
  }, []);

  const navHideStart = 24;
  const navHideRange = 86;
  const navProgress = Math.max(0, Math.min(1, (scrollVal - navHideStart) / navHideRange));
  const isNavHidden = navProgress > 0.98;
  const isSubNavShow = hasScrolled && scrollVal > 620 && isNavHidden;

  return (
    <div className="apple-wrapper arm-page-root">
      {/* 🍎 二级导航：主导航飞出后再接管位置 */}
      {isSubNavShow && (
        <nav className="nav-sub nav-sub-enter">
          <div className="nav-box">
            <span className="p-name">{R_LITE}</span>
            <button
              type="button"
              className="p-btn-buy"
              onClick={() => window.dispatchEvent(new Event('apple-inquiry-open'))}
            >
              {copy.inquiry}
            </button>
          </div>
        </nav>
      )}

      {/* Hero Section: 真正顶死 */}
      <section className="hero-section">
        <div className={`hero-3d-wrap ${heroReady ? 'reveal' : ''}`}>
           <model-viewer
              src={cobotGlbModels.rLiteFr3C}
              alt={fr5HeroAlt}
              camera-controls
              auto-rotate
              disable-zoom
              touch-action="pan-y"
              interaction-prompt="none"
              camera-orbit="45deg 85deg 1900m"
              camera-target="auto 110% auto"
              field-of-view="15.5deg"
              shadow-intensity="0.75"
              shadow-softness="1.2"
              environment-image="neutral"
              environment-intensity="0.72"
              exposure="0.92"
              onLoad={(e: any) => {
                applyAppleStyle(e.target.model);
                setAllowDetailModels(true);
              }}
              onProgress={(e: any) => {
                if ((e as any)?.detail?.totalProgress >= 0.98) setAllowDetailModels(true);
              }}
              style={{ width: '100%', height: '100%' } as any}
            />
        </div>
        <div className="hero-content">
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroSubtitle}</p>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="highlights-section">
        <h2 className="section-title">{copy.highlightsTitle}</h2>
        <div className="h-scroller" ref={scrollRefH} onScroll={() => {
            if (scrollRefH.current) {
              const { scrollLeft, scrollWidth, clientWidth } = scrollRefH.current;
              setProgH((scrollLeft / (scrollWidth - clientWidth)) * 100);
            }
          }}>
          <div className="h-track">
            <div className="snap-edge" />
            {copy.highlights.map((card, i) => (
              <div key={i} className="h-card">
                <div className="card-3d">
                   <model-viewer
                      src={allowDetailModels ? cobotGlbModels.rLiteFr3C : undefined}
                      alt={detailAltByNode[card.node] ?? fr5DetailAlt}
                      loading="lazy"
                      camera-orbit={card.orbit}
                      camera-target={card.target}
                      field-of-view="22deg"
                      auto-rotate touch-action="pan-y" interaction-prompt="none"
                      environment-image="neutral" exposure="1.1"
                      onLoad={(e: any) => {
                        applyAppleStyle(e.target.model);
                        startCardNodeMotion(e.target, card.node, i === 0 || i === 3 ? 0.028 : 0.018);
                      }}
                      style={{ width: '100%', height: '100%' } as any}
                    />
                </div>
                <div className="card-text">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </div>
            ))}
            <div className="snap-edge" />
          </div>
        </div>
        <div className="h-progress"><div className="h-bar" style={{ width: `${progH}%` }} /></div>
      </section>

      {/* Closer Look Placeholder */}
      <section className="closer-section">
        <h2 className="section-title">{copy.closerTitle}</h2>
        <div className="closer-grid">
           <div className="closer-card l" />
           <div className="closer-card s" />
        </div>
      </section>

      {/* Narrative Section */}
      <section className="narrative-section">
        <h2 className="white-txt">{copy.narrativeTitle}</h2>
        <h2 className="grey-txt">{copy.narrativeHeadline}</h2>
        <p className="sub-txt">{copy.narrativeSubtitle}</p>
      </section>

      {/* Spec Section: 补全对比 */}
      <section className="spec-section">
        <h2 className="section-title">{copy.specsTitle}</h2>
        <div className="spec-box">
          <div className="spec-header">
             <div className="col"><span>🦾</span><h3>{copy.compareLeftName}</h3></div>
             <div className="col"><span>🏗️</span><h3>{copy.compareRightName}</h3></div>
          </div>
          {copy.specs.map((row, idx) => (
            <div key={idx} className="spec-row">
              <label>{row.label}</label>
              <div className="val-box"><span>{row.v1}</span><span>{row.v2}</span></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
