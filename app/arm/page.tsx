'use client';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { rSeriesData } from '@/data/products';

const R_CORE = rSeriesData.find((f) => f.id === 'r-core')!.displayName;
const R_MAX = rSeriesData.find((f) => f.id === 'r-max')!.displayName;

const TRANSLATIONS = {
  zh: {
    langBtn: 'EN',
    inquiry: '咨询',
    hero: { h: R_CORE, p: '精钢风骨，细腻如瓷。' },
    h: {
      title: '精彩亮点。',
      cards: [
        { t: '法兰头 L6_flange', d: '高精度末端法兰，稳定支持夹具与工具快换。', orbit: '34deg 78deg 1.35m', target: '0m 1.58m 0m', node: 'J6_Flange' },
        { t: '底座 Base', d: '低重心底座结构，抑振并提升整机刚性。', orbit: '212deg 72deg 2.25m', target: '0m 0.18m 0m', node: 'J1_Base' },
        { t: '中段关节 J3', d: '关键承重关节，兼顾速度与轨迹平滑性。', orbit: '125deg 84deg 1.95m', target: '0m 0.95m 0m', node: 'J3_Elbow' },
        { t: '腕部关节 J5/J6', d: '小空间姿态调整更灵活，适合复杂工位。', orbit: '-35deg 72deg 1.5m', target: '0m 1.34m 0m', node: 'Wrist_Roll' },
      ],
    },
    c: { title: '近距离观察。' },
    n1: { h: 'R3 芯片', p: '性能怪兽', sub: '实时路径规划，快如闪电。' },
    specs: {
      title: '哪款适合你？',
      buy: '咨询',
      items: [
        { label: '有效负载', v1: '5 kg', v2: '10 kg' },
        { label: '重复精度', v1: '±0.02 mm', v2: '±0.01 mm' },
        { label: '自由度', v1: '6 轴', v2: '7 轴' },
        { label: '防护等级', v1: 'IP67', v2: 'IP68' },
      ],
    },
  },
  en: {
    langBtn: '中文',
    inquiry: 'Inquiry',
    hero: { h: R_CORE, p: 'Precision of Steel. Touch of Silk.' },
    h: {
      title: 'Highlights.',
      cards: [
        { t: 'Flange Head L6_flange', d: 'High-precision flange for quick tool switching.', orbit: '34deg 78deg 1.35m', target: '0m 1.58m 0m', node: 'J6_Flange' },
        { t: 'Base Module', d: 'Low-center base improves stability and damping.', orbit: '212deg 72deg 2.25m', target: '0m 0.18m 0m', node: 'J1_Base' },
        { t: 'Middle Joint J3', d: 'Core load-bearing joint for smooth pathing.', orbit: '125deg 84deg 1.95m', target: '0m 0.95m 0m', node: 'J3_Elbow' },
        { t: 'Wrist J5/J6', d: 'Fine attitude control for tight workspaces.', orbit: '-35deg 72deg 1.5m', target: '0m 1.34m 0m', node: 'Wrist_Roll' },
      ],
    },
    c: { title: 'Take a closer look.' },
    n1: { h: 'R3 Chip', p: 'Ultimate Power', sub: 'Lightning-fast path planning.' },
    specs: {
      title: 'Which Arm is right?',
      buy: 'Inquiry',
      items: [
        { label: 'Payload', v1: '5 kg', v2: '10 kg' },
        { label: 'Repeatability', v1: '±0.02 mm', v2: '±0.01 mm' },
        { label: 'DOF', v1: '6 Axis', v2: '7 Axis' },
        { label: 'Protection', v1: 'IP67', v2: 'IP68' },
      ],
    },
  }
};

export default function ArmDetailFinal() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [scrollVal, setScrollVal] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const scrollRefH = useRef<HTMLDivElement>(null);
  const [progH, setProgH] = useState(0);
  const cardSpinTimersRef = useRef<number[]>([]);

  const t = TRANSLATIONS[lang];

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    setScrollVal(0);
    setHasScrolled(false);
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
            <span className="p-name">{R_CORE}</span>
            <button
              className="p-btn-buy"
              onClick={() => window.dispatchEvent(new Event('apple-inquiry-open'))}
            >
              {t.inquiry}
            </button>
          </div>
        </nav>
      )}

      {/* Hero Section: 真正顶死 */}
      <section className="hero-section">
        <div className={`hero-3d-wrap ${heroReady ? 'reveal' : ''}`}>
           <model-viewer
              src="/models/fr5.glb"
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
              onLoad={(e: any) => applyAppleStyle(e.target.model)}
              style={{ width: '100%', height: '100%' } as any}
            />
        </div>
        <div className="hero-content">
          <h1>{t.hero.h}</h1>
          <p>{t.hero.p}</p>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="highlights-section">
        <h2 className="section-title">{t.h.title}</h2>
        <div className="h-scroller" ref={scrollRefH} onScroll={() => {
            if (scrollRefH.current) {
              const { scrollLeft, scrollWidth, clientWidth } = scrollRefH.current;
              setProgH((scrollLeft / (scrollWidth - clientWidth)) * 100);
            }
          }}>
          <div className="h-track">
            <div className="snap-edge" />
            {t.h.cards.map((card, i) => (
              <div key={i} className="h-card">
                <div className="card-3d">
                   <model-viewer
                      src="/models/fr5.glb"
                      camera-orbit={card.orbit}
                      camera-target={card.target} // 👈 强制聚焦
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
                  <h3>{card.t}</h3>
                  <p>{card.d}</p>
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
        <h2 className="section-title">{t.c.title}</h2>
        <div className="closer-grid">
           <div className="closer-card l" />
           <div className="closer-card s" />
        </div>
      </section>

      {/* Narrative Section */}
      <section className="narrative-section">
        <h2 className="white-txt">{t.n1.h}</h2>
        <h2 className="grey-txt">{t.n1.p}</h2>
        <p className="sub-txt">{t.n1.sub}</p>
      </section>

      {/* Spec Section: 补全对比 */}
      <section className="spec-section">
        <h2 className="section-title">{t.specs.title}</h2>
        <div className="spec-box">
          <div className="spec-header">
             <div className="col"><span>🦾</span><h3>{R_CORE}</h3></div>
             <div className="col"><span>🏗️</span><h3>{R_MAX}</h3></div>
          </div>
          {t.specs.items.map((row, idx) => (
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