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
        { label: 'Degrees of Freedom', v1: '6 Axis', v2: '7 Axis' },
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

  const isSubNavVisible = scrollVal > 2400;
  const isDeepSection = scrollVal > 3400;

  const triggerInquiryDrawer = (e: React.MouseEvent) => {
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
    document.body.style.backgroundColor = '#f5f5f7';
    
    // 🍎 呼吸感回归：稍微拉长延迟，让动画更丝滑
    setTimeout(() => setHeroReady(true), 300);
    setTimeout(() => setTextReady(true), 1200);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('langChange', sync);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('reveal');
          else entry.target.classList.remove('reveal');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.anim-title, .card, .narrative, .spec-grid').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang, heroReady]);

  const factor = Math.min(scrollVal / 300, 1);

  return (
    <div className="apple-ax1-wrapper" key={lang}>
      <nav
        className="fixed-sub-nav"
        style={{
          height: `${52 - factor * 4}px`,
          backgroundColor: `rgba(245, 245, 247, ${0.72 + factor * 0.18})`,
          backdropFilter: `blur(${20 + factor * 20}px) saturate(180%)`,
          WebkitBackdropFilter: `blur(${20 + factor * 20}px) saturate(180%)`,
          borderBottom: `1px solid rgba(0,0,0,${0.03 + factor * 0.05})`,
          transform: isSubNavVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isSubNavVisible ? 1 : 0,
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, height 0.3s ease',
        }}
      >
        <div className="nav-content-limiter">
          <span className="p-name" style={{ fontSize: `${21 - factor * 3}px` }}>
            {t.hero.h}
          </span>
          <div className="p-actions">
            <button
              className="p-inquiry"
              onClick={triggerInquiryDrawer}
              style={{
                padding: `${4}px ${16 - factor * 6}px`,
                backgroundColor: isDeepSection ? '#fff' : '#0071e3',
                color: isDeepSection ? '#000' : '#fff',
                fontSize: `${12 - factor * 1}px`,
                borderRadius: '20px',
                transform: `scale(${1 - factor * 0.05})`,
                transition: 'background-color 0.6s ease, color 0.6s ease, padding 0.3s ease, transform 0.2s',
              }}
            >
              {t.inquiry}
            </button>
          </div>
        </div>
      </nav>

      <div className="nav-spacer" />

      {/* 🍎 1屏: Hero - 呼吸感动画回归 🍎 */}
      <section className="h-sec">
        <div className={`h-img ${heroReady ? 'reveal' : ''}`}>
          <span className="h-icon">🦾</span>
        </div>
        <div className={`h-text ${textReady ? 'reveal' : ''}`}>
          <h1 className="h-giant">{t.hero.h}</h1>
          <p className="h-sub">{t.hero.p}</p>
        </div>
      </section>

      {/* 2屏: Highlights */}
      <section className="scroll-wall">
        <div className="limit-w">
          <h2 className="sec-t anim-title">{t.h.title}</h2>
        </div>
        <div className="wall-scroller scroll-snap-x" ref={scrollRefH}
          onScroll={() => {
            if (scrollRefH.current) {
              const { scrollLeft, scrollWidth, clientWidth } = scrollRefH.current;
              setProgH((scrollLeft / (scrollWidth - clientWidth)) * 100);
            }
          }}
        >
          <div className="wall-track">
            <div className="snap-padding-edge" />
            {t.h.cards.map((item, i) => (
              <div key={i} className="card snap-center-card w-giant">
                <div className={`card-info-floating ${item.pos}`}>
                  <h3 className="floating-text">{item.t}</h3>
                  <p className="floating-text delay">{item.d}</p>
                </div>
                <div className="card-bg-icon-box">{item.v}</div>
              </div>
            ))}
            <div className="snap-padding-edge" />
          </div>
        </div>
        <div className="bar-track">
          <div className="bar-fill" style={{ left: `${progH}%` }}></div>
        </div>
      </section>

      {/* 3屏: Closer Look */}
      <section className="scroll-wall">
        <div className="limit-w">
          <h2 className="sec-t anim-title">{t.c.title}</h2>
        </div>
        <div className="wall-scroller scroll-snap-x">
          <div className="wall-track">
            <div className="snap-padding-edge" />
            <div className="card snap-center-card w-l img-placeholder-1"></div>
            <div className="card snap-center-card w-s img-placeholder-2"></div>
            <div className="card snap-center-card w-s img-placeholder-3"></div>
            <div className="card snap-center-card w-l img-placeholder-4"></div>
            <div className="card snap-center-card w-s img-placeholder-5"></div>
            <div className="snap-padding-edge" />
          </div>
        </div>
      </section>

      {/* 4屏: 叙事黑 */}
      <section className="narrative is-dark-pop">
        <div className="n-bg-dark">🚀</div>
        <div className="n-content anim-group">
          <h2 className="n-w">{t.n1.h}</h2>
          <h2 className="n-g">{t.n1.p}</h2>
          <p className="n-s-white">{t.n1.sub}</p>
        </div>
      </section>

      {/* 5屏: 叙事白 */}
      <section className="narrative is-laboratory-white">
        <div className="n-bg-light">🎯</div>
        <div className="n-content anim-group">
          <h2 className="n-b">{t.n2.h}</h2>
          <h2 className="n-g">{t.n2.p}</h2>
          <p className="n-s-dark">{t.n2.sub}</p>
        </div>
      </section>

      {/* 🍎 6屏: 参数对比 - 修正乱码与手机端布局 🍎 */}
      <section className="spec-section is-laboratory-white">
        <div className="limit-w">
          <h2 className="sec-t anim-title">{t.specs.title}</h2>
          <div className="spec-grid">
            <div className="spec-header">
              <div className="spec-label-empty"></div>
              <div className="spec-model-info">
                <span className="spec-icon">🦾</span>
                <h3 className="spec-model-name">AX-1 Pro</h3>
              </div>
              <div className="spec-model-info">
                <span className="spec-icon">🏗️</span>
                <h3 className="spec-model-name">AX-1 Ultra</h3>
              </div>
            </div>
            <div className="spec-body">
              {t.specs.items.map((row, idx) => (
                <div key={idx} className="spec-row">
                  <div className="spec-label">{row.label}</div>
                  <div className="spec-values">
                    <div className="spec-val-item">
                      <span className="mobile-model-tag">Pro</span>
                      <b>{row.v1}</b>
                    </div>
                    <div className="spec-val-item">
                      <span className="mobile-model-tag">Ultra</span>
                      <b>{row.v2}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .apple-ax1-wrapper { 
          background: #f5f5f7; 
          color: #1d1d1f; 
          font-family: -apple-system, sans-serif; 
          overflow-x: hidden;
          width: 100%;
        }

        .limit-w { max-width: 1024px; margin: 0 auto; padding: 0 22px; }
        .fixed-sub-nav { position: fixed; top: 44px; left: 0; width: 100%; z-index: 1000; display: flex; align-items: center; }
        .nav-content-limiter { width: 100%; max-width: 980px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; height: 100%; }
        .p-name { font-weight: 600; color: #1d1d1f; transition: all 0.3s; }
        .p-inquiry { border: none; cursor: pointer; }
        .nav-spacer { height: 52px; }

        /* 🍎 Hero 呼吸感核心 CSS 🍎 */
        .h-sec { height: 100vh; background: #f5f5f7; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
        .h-img { 
          opacity: 0; 
          transform: scale(1.1); /* 初始略大 */
          transition: opacity 2s cubic-bezier(0.4, 0, 0.2, 1), transform 2.5s cubic-bezier(0.15, 0, 0.15, 1); 
        }
        .h-img.reveal { opacity: 1; transform: scale(1); } /* 缩回原位 */
        .h-icon { font-size: 180px; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.05)); }
        
        .h-text { opacity: 0; transform: translateY(30px); transition: 1.5s ease 0.8s; margin-top: 40px; text-align: center; }
        .h-text.reveal { opacity: 1; transform: translateY(0); }
        .h-giant { font-size: clamp(60px, 10vw, 100px); font-weight: 700; margin: 0; letter-spacing: -0.02em; }
        .h-sub { font-size: clamp(24px, 3.5vw, 32px); color: #86868b; margin-top: 10px; }

        .scroll-wall { padding: 120px 0; background: #f5f5f7; }
        .sec-t { font-size: clamp(40px, 8vw, 90px); font-weight: 700; margin-bottom: 80px; opacity: 0; transform: translateY(30px); transition: 1s cubic-bezier(0.15, 0, 0.15, 1); }
        .sec-t.reveal { opacity: 1; transform: translateY(0); }

        .wall-scroller { width: 100%; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .scroll-snap-x { scroll-snap-type: x mandatory; }
        .wall-scroller::-webkit-scrollbar { display: none; }
        .wall-track { display: flex; gap: 30px; padding-bottom: 60px; }
        
        .snap-padding-edge { flex: 0 0 calc(50vw - 45vw - 15px); }

        .card { 
          border-radius: 40px; 
          position: relative; 
          overflow: hidden; 
          background: #fff; 
          box-shadow: 0 10px 40px rgba(0,0,0,0.04); 
        }
        .snap-center-card { scroll-snap-align: center; }
        .w-giant { flex: 0 0 90vw; max-width: 1060px; height: 85vh; }
        .w-l { flex: 0 0 78vw; max-width: 800px; height: 550px; }
        .w-s { flex: 0 0 44vw; max-width: 460px; height: 550px; }

        .card-info-floating { position: absolute; z-index: 2; padding: 80px; width: 100%; opacity: 0; transform: translateY(30px); transition: 1.2s; }
        .card.reveal .card-info-floating { opacity: 1; transform: translateY(0); }
        .floating-text { font-size: clamp(28px, 4vw, 56px); font-weight: 700; }
        .floating-text.delay { font-size: 24px; color: #86868b; margin-top: 20px; }
        .card-bg-icon-box { position: absolute; font-size: 350px; opacity: 0.05; right: -30px; bottom: -30px; pointer-events: none; }

        .img-placeholder-1 { background: #eaebed; } .img-placeholder-2 { background: #e2e3e5; }

        .narrative { position: relative; height: 100vh; display: flex; align-items: center; justify-content: center; }
        .is-dark-pop { background: #000; color: #fff; }
        .n-bg-dark { font-size: 600px; position: absolute; opacity: 0.15; z-index: 1; color: #fff; }
        .n-w { font-size: clamp(40px, 9vw, 110px); font-weight: 700; line-height: 1; }
        .n-s-white { font-size: clamp(18px, 2.2vw, 28px); margin-top: 40px; color: #d2d2d7; max-width: 750px; line-height: 1.5; }

        .is-laboratory-white { background: #f5f5f7; color: #1d1d1f; }
        .n-bg-light { font-size: 600px; position: absolute; opacity: 0.05; z-index: 1; color: #000; }
        .n-b { font-size: clamp(40px, 9vw, 110px); font-weight: 700; line-height: 1; }
        .n-g { font-size: clamp(40px, 9vw, 110px); font-weight: 700; color: #86868b; line-height: 1; }
        .n-s-dark { font-size: clamp(18px, 2.2vw, 28px); margin-top: 40px; color: #424245; max-width: 750px; line-height: 1.5; }

        .n-content { position: relative; z-index: 2; text-align: center; }

        /* 🍎 参数对比布局修正 🍎 */
        .spec-section { padding: 150px 0; background: #f5f5f7; }
        .spec-grid { border-top: 1px solid #d2d2d7; opacity: 0; transform: translateY(40px); transition: 1.5s ease; }
        .spec-grid.reveal { opacity: 1; transform: translateY(0); }
        .spec-header { display: flex; padding: 60px 0; border-bottom: 1px solid #d2d2d7; }
        .spec-label-empty { flex: 1; }
        .spec-model-info { flex: 1; text-align: center; }
        .spec-icon { font-size: 48px; display: block; }
        .spec-model-name { font-size: 24px; font-weight: 600; color: #1d1d1f; margin-top: 15px; }
        
        .spec-row { border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; padding: 40px 0; }
        .spec-label { flex: 1; color: #86868b; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
        .spec-values { flex: 2; display: flex; }
        .spec-val-item { flex: 1; text-align: center; font-size: 21px; color: #1d1d1f; }
        .mobile-model-tag { display: none; } /* PC 端隐藏手机标签 */

        .bar-track { width: 180px; height: 2px; background: #e5e5e5; margin: 0 auto; position: relative; }
        .bar-fill { position: absolute; width: 60px; height: 100%; background: #0071e3; }

        @media (max-width: 734px) {
          .nav-content-limiter { padding: 0 20px; }
          .h-giant { font-size: 52px; }
          .card-info-floating { padding: 40px; }
          .snap-padding-edge { flex: 0 0 5vw; }
          
          /* 🍎 移动端参数表深度适配 🍎 */
          .spec-header { display: none; } /* 手机端隐藏表头 */
          .spec-row { flex-direction: column; align-items: flex-start; gap: 20px; padding: 30px 0; }
          .spec-label { color: #0071e3; font-size: 12px; }
          .spec-values { width: 100%; gap: 10px; }
          .spec-val-item { 
            background: #fff; 
            padding: 15px; 
            border-radius: 12px; 
            display: flex; 
            flex-direction: column; 
            gap: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          }
          .mobile-model-tag { 
            display: block; 
            font-size: 10px; 
            color: #86868b; 
            text-transform: uppercase; 
          }
        }
      `}</style>
    </div>
  );
}