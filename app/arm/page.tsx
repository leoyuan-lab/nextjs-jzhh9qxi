'use client';
import React, { useState, useEffect, useRef } from 'react';

const TRANSLATIONS = {
  zh: {
    inquiry: '咨询',
    hero: { h: 'AX-1 Pro', p: '精密，显身手。' },
    h: {
      title: '获取精彩亮点',
      cards: [
        { t: '钛金属机身', d: '航空级强度，惊人轻盈。', v: '💎', pos: 'top-left' },
        { t: 'R3 芯片', d: '每秒万亿次运算，智能核心。', v: '🚀', pos: 'bottom-right' },
        { t: '6轴联动', d: '极致丝滑协同，毫秒级响应。', v: '🦾', pos: 'bottom-left' },
        { t: 'IP67 防护', d: '全天候防尘防水，无惧挑战。', v: '🛡️', pos: 'top-right' },
        { t: '无线控制', d: '低延迟连接，自由操控。', v: '📶', pos: 'bottom-left' },
        { t: '模块化末端', d: '一秒切换工具，全能助手。', v: '🔧', pos: 'top-left' },
      ],
    },
    c: { title: '近距离观察' },
    n1: { h: 'R3 芯片', p: '性能怪兽', sub: '专为高密度计算打造，让实时路径规划快如闪电。' },
    n2: { h: '±0.02 mm', p: '细致入微', sub: '微米级精度，让操作游刃有余。' },
    specs: {
      title: '哪款机械臂适合你？',
      buy: '咨询购买',
      items: [
        { label: '有效负载', v1: '5 kg', v2: '10 kg' },
        { label: '重复精度', v1: '±0.02 mm', v2: '±0.01 mm' },
        { label: '自由度', v1: '6 轴', v2: '7 轴' },
        { label: '防护等级', v1: 'IP67', v2: 'IP68' },
        { label: '芯片', v1: 'R3 核心', v2: 'R3 Ultra' },
      ],
    },
  },
  en: {
    inquiry: 'Inquiry',
    hero: { h: 'AX-1 Pro', p: 'Precision. Power.' },
    h: {
      title: 'Get the highlights.',
      cards: [
        { t: 'Titanium', d: 'Strong and light.', v: '💎', pos: 'top-left' },
        { t: 'R3 Chip', d: 'Trillions of ops.', v: '🚀', pos: 'bottom-right' },
        { t: '6-Axis', d: 'Seamless coordination.', v: '🦾', pos: 'bottom-left' },
        { t: 'IP67 Rated', d: 'Water resistant.', v: '🛡️', pos: 'top-right' },
        { t: 'Wireless', d: 'Zero lag control.', v: '📶', pos: 'bottom-left' },
        { t: 'Modular', d: 'Switch in seconds.', v: '🔧', pos: 'top-left' },
      ],
    },
    c: { title: 'Take a closer look.' },
    n1: { h: 'R3 Chip', p: 'Power Beast', sub: 'Lightning-fast path planning.' },
    n2: { h: '±0.02 mm', p: 'Precision', sub: 'Micron-level control.' },
    specs: {
      title: 'Which Arm is right for you?',
      buy: 'Inquiry',
      items: [
        { label: 'Payload', v1: '5 kg', v2: '10 kg' },
        { label: 'Repeatability', v1: '±0.02 mm', v2: '±0.01 mm' },
        { label: 'DOF', v1: '6 Axis', v2: '7 Axis' },
        { label: 'Protection', v1: 'IP67', v2: 'IP68' },
        { label: 'Chip', v1: 'R3 Core', v2: 'R3 Ultra' },
      ],
    },
  },
};

export default function ArmAppleFinalCorrection() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [heroReady, setHeroReady] = useState(false);
  const [textReady, setTextReady] = useState(false);
  const [scrollVal, setScrollVal] = useState(0);
  const [progH, setProgH] = useState(0);
  const scrollRefH = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.zh;

  const triggerInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new Event('apple-inquiry-open'));
  };

  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem('user-lang');
      if (saved === 'en' || saved === 'zh') setLang(saved as 'zh' | 'en');
    };
    sync();
    const handleScroll = () => setScrollVal(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('langChange', sync);
    document.body.style.backgroundColor = '#000';
    setTimeout(() => setHeroReady(true), 300);
    setTimeout(() => setTextReady(true), 1200);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('langChange', sync);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('reveal');
          else entry.target.classList.remove('reveal');
        });
      }, { threshold: 0.1 });
    document.querySelectorAll('.anim-title, .card, .narrative, .spec-grid').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang, heroReady]);

  const factorSub = Math.min(scrollVal / 300, 1);
  const isSubNavVisible = scrollVal > 2400;
  const isDeepSection = scrollVal > 3400;

  return (
    <div className="apple-ax1-wrapper" key={lang}>
      <nav className="fixed-sub-nav" style={{
          height: `${52 - factorSub * 4}px`,
          backgroundColor: `rgba(0,0,0, ${0.75 + factorSub * 0.15})`,
          backdropFilter: `blur(20px) saturate(180%)`,
          WebkitBackdropFilter: `blur(20px) saturate(180%)`,
          borderBottom: `1px solid rgba(255,255,255,0.1)`,
          transform: isSubNavVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isSubNavVisible ? 1 : 0,
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, height 0.3s ease',
        }}>
        <div className="nav-content-limiter">
          <span className="p-name" style={{ fontSize: `${21 - factorSub * 3}px` }}>{t.hero.h}</span>
          <div className="p-actions">
            <button className="p-inquiry" onClick={triggerInquiry} style={{
                padding: `${4}px ${16 - factorSub * 6}px`,
                backgroundColor: isDeepSection ? '#fff' : '#0071e3',
                color: isDeepSection ? '#000' : '#fff',
                fontSize: `${12 - factorSub * 1}px`,
                borderRadius: '20px',
              }}>{t.inquiry}</button>
          </div>
        </div>
      </nav>

      {/* 1屏: Hero */}
      <section className="h-sec">
        <div className={`h-img ${heroReady ? 'reveal' : ''}`}><span className="h-icon">🦾</span></div>
        <div className={`h-text ${textReady ? 'reveal' : ''}`}>
          <h1 className="h-giant">{t.hero.h}</h1>
          <p className="h-sub">{t.hero.p}</p>
        </div>
      </section>

      {/* 2屏: Highlights */}
      <section className="scroll-wall">
        <div className="limit-w"><h2 className="apple-huge-title anim-title">{t.h.title}</h2></div>
        <div className="wall-scroller scroll-snap-x-mandatory" ref={scrollRefH} onScroll={() => {
            if (scrollRefH.current) {
              const { scrollLeft, scrollWidth, clientWidth } = scrollRefH.current;
              setProgH((scrollLeft / (scrollWidth - clientWidth)) * 100);
            }
          }}>
          <div className="wall-track">
            <div className="snap-padding-edge" />
            {t.h.cards.map((item, i) => (
              <div key={i} className="card snap-center-card w-giant closer-look-style">
                <div className={`card-info-floating ${item.pos} anim-card-breathe-heavy`}>
                  <h3 className="f-white">{item.t}</h3>
                  <p className="f-grey">{item.d}</p>
                </div>
                <div className="card-bg-icon-box">{item.v}</div>
              </div>
            ))}
            <div className="snap-padding-edge" />
          </div>
        </div>
        <div className="bar-track-dark"><div className="bar-fill-white" style={{ left: `${progH}%` }}></div></div>
      </section>

      {/* 3屏: Closer Look */}
      <section className="scroll-wall deeper-dark">
        <div className="limit-w"><h2 className="apple-huge-title anim-title">{t.c.title}</h2></div>
        <div className="wall-scroller scroll-snap-x-mandatory">
          <div className="wall-track">
            <div className="snap-padding-edge" />
            <div className="card snap-center-card w-l closer-look-style img-placeholder-1" />
            <div className="card snap-center-card w-s closer-look-style img-placeholder-2" />
            <div className="card snap-center-card w-s closer-look-style img-placeholder-3" />
            <div className="snap-padding-edge" />
          </div>
        </div>
      </section>

      {/* 4/5屏: 叙事屏 */}
      <section className="narrative is-black">
        <div className="n-bg-dark">🚀</div>
        <div className="n-content anim-group">
          <h2 className="n-white-huge">{t.n1.h}</h2>
          <h2 className="n-grey-huge">{t.n1.p}</h2>
          <p className="n-desc-white">{t.n1.sub}</p>
        </div>
      </section>
      <section className="narrative is-deep-grey">
        <div className="n-bg-light">🎯</div>
        <div className="n-content anim-group">
          <h2 className="n-white-huge">{t.n2.h}</h2>
          <h2 className="n-grey-huge">{t.n2.p}</h2>
          <p className="n-desc-white">{t.n2.sub}</p>
        </div>
      </section>

      {/* 6屏: 对比大卡片 */}
      <section className="spec-section">
        <div className="limit-w">
          <h2 className="apple-huge-title anim-title">{t.specs.title}</h2>
          <div className="spec-grid">
            <div className="spec-comparison-card-float closer-look-style">
              <div className="spec-card-header">
                <div className="model-col">
                  <div className="model-visual">🦾</div>
                  <h3>AX-1 Pro</h3>
                  <button className="model-buy-pill" onClick={triggerInquiry}>{t.specs.buy}</button>
                </div>
                <div className="model-col">
                  <div className="model-visual">🏗️</div>
                  <h3>AX-1 Ultra</h3>
                  <button className="model-buy-pill" onClick={triggerInquiry}>{t.specs.buy}</button>
                </div>
              </div>
              <div className="spec-card-body">
                {t.specs.items.map((row, idx) => (
                  <div key={idx} className="spec-row-item">
                    <div className="spec-row-label">{row.label}</div>
                    <div className="spec-row-values">
                      <div className="val-box">{row.v1}</div>
                      <div className="val-box">{row.v2}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        body { margin: 0; font-family: -apple-system, sans-serif; background: #000; color: #fff; overflow-x: hidden; }
        .limit-w { max-width: 1024px; margin: 0 auto; padding: 0 32px; }
        .fixed-sub-nav { position: fixed; top: 44px; left: 0; width: 100%; z-index: 1000; display: flex; align-items: center; }
        .nav-content-limiter { width: 100%; max-width: 980px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
        
        /* 🍎 字体大小终极修正 🍎 */
        .apple-huge-title { 
          font-size: 80px; /* 👈 直接锁定巨大字号 */
          font-weight: 700; 
          margin-bottom: 60px; 
          opacity: 0; 
          transform: translateY(30px); 
          transition: 1s cubic-bezier(0.15, 0, 0.15, 1);
          letter-spacing: -0.02em;
        }
        .apple-huge-title.reveal { opacity: 1; transform: translateY(0); }

        .n-white-huge { font-size: 110px; font-weight: 700; margin: 0; line-height: 1; }
        .n-grey-huge { font-size: 110px; font-weight: 700; color: #86868b; margin: 0; line-height: 1; }

        .closer-look-style {
          background: rgba(22, 22, 23, 0.6) !important;
          backdrop-filter: blur(40px) saturate(210%) brightness(85%);
          WebkitBackdropFilter: blur(40px) saturate(210%) brightness(85%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 44px;
        }

        .h-sec { height: 100vh; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .h-img { opacity: 0; transform: scale(1.1); transition: 2.5s; }
        .h-img.reveal { opacity: 1; transform: scale(1); }
        .h-icon { font-size: 180px; }
        .h-text { opacity: 0; transform: translateY(30px); transition: 1.5s 1s; text-align: center; margin-top: 40px; }
        .h-text.reveal { opacity: 1; transform: translateY(0); }
        .h-giant { font-size: clamp(60px, 10vw, 100px); font-weight: 700; margin: 0; }
        .h-sub { font-size: 32px; color: #86868b; }

        @keyframes breatheHeavy { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.9; } 50% { transform: translate(12px, -8px) scale(1.05); opacity: 1; } }
        .anim-card-breathe-heavy { animation: breatheHeavy 6s ease-in-out infinite; }

        .wall-scroller { width: 100%; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x mandatory; }
        .wall-scroller::-webkit-scrollbar { display: none; }
        .wall-track { display: flex; gap: 40px; padding: 40px 0; width: max-content; }
        .snap-padding-edge { flex: 0 0 5vw; }
        .card { scroll-snap-align: center; flex: 0 0 92vw; height: 88vh; position: relative; overflow: hidden; }
        
        .card-info-floating { position: absolute; z-index: 2; padding: 60px; width: 100%; }
        .f-white { font-size: 56px; font-weight: 700; }
        .f-grey { font-size: 24px; color: #86868b; margin-top: 15px; }
        .card-bg-icon-box { position: absolute; bottom: -30px; right: -30px; font-size: 400px; opacity: 0.04; pointer-events: none; }

        .narrative { height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; }
        .n-desc-white { font-size: 24px; color: #86868b; margin-top: 40px; max-width: 750px; }

        .spec-section { padding: 150px 0; background: #000; }
        .spec-grid { opacity: 0; transform: translateY(40px); transition: 1.5s; }
        .spec-grid.reveal { opacity: 1; transform: translateY(0); }
        .spec-comparison-card-float { padding: 80px; max-width: 900px; margin: 0 auto; }
        .spec-card-header { display: flex; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 60px; margin-bottom: 40px; }
        .model-col { flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .model-visual { font-size: 110px; }
        .model-buy-pill { background: #0071e3; color: #fff; border: none; padding: 10px 24px; border-radius: 20px; font-weight: 600; cursor: pointer; }
        .spec-row-item { display: flex; flex-direction: column; align-items: center; padding: 40px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .spec-row-values { width: 100%; display: flex; justify-content: center; }
        .val-box { flex: 1; text-align: center; font-size: 24px; font-weight: 700; color: rgba(255,255,255,0.9); }

        @media (max-width: 734px) {
          .apple-huge-title { font-size: 42px; }
          .n-white-huge, .n-grey-huge { font-size: 50px; }
          .f-white { font-size: 32px; }
          .model-visual { font-size: 70px; }
          .val-box { font-size: 18px; }
          .card { height: 75vh; }
        }
      `}</style>
    </div>
  );
}