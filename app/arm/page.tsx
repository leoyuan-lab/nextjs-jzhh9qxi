'use client';
import React, { useState, useEffect, useRef } from 'react';

const TRANSLATIONS = {
  zh: {
    inquiry: '咨询',
    hero: { h: 'AX-1 Pro', p: '精密，显身手。' },
    h: {
      title: '获取精彩亮点',
      cards: [
        {
          t: '钛金属机身',
          d: '航空级强度，惊人轻盈。',
          v: '💎',
          pos: 'top-left',
        },
        {
          t: 'R3 芯片',
          d: '每秒万亿次运算，智能核心。',
          v: '🚀',
          pos: 'bottom-right',
        },
        {
          t: '6轴联动',
          d: '极致丝滑协同，毫秒级响应。',
          v: '🦾',
          pos: 'bottom-left',
        },
        {
          t: 'IP67 防护',
          d: '全天候防尘防水，无惧挑战。',
          v: '🛡️',
          pos: 'top-right',
        },
        {
          t: '无线控制',
          d: '低延迟连接，自由操控。',
          v: '📶',
          pos: 'bottom-left',
        },
        {
          t: '模块化末端',
          d: '一秒切换工具，全能助手。',
          v: '🔧',
          pos: 'top-left',
        },
      ],
    },
    c: { title: '近距离观察' },
    n1: {
      h: 'R3 芯片',
      p: '性能怪兽',
      sub: '专为高密度计算打造，让实时路径规划快如闪电。',
    },
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
        {
          t: '6-Axis',
          d: 'Seamless coordination.',
          v: '🦾',
          pos: 'bottom-left',
        },
        { t: 'IP67 Rated', d: 'Water resistant.', v: '🛡️', pos: 'top-right' },
        { t: 'Wireless', d: 'Zero lag control.', v: '📶', pos: 'bottom-left' },
        { t: 'Modular', d: 'Switch in seconds.', v: '🔧', pos: 'top-left' },
      ],
    },
    c: { title: 'Take a closer look.' },
    n1: {
      h: 'R3 Chip',
      p: 'Power Beast',
      sub: 'Lightning-fast path planning.',
    },
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

  // 🍎 判定子导航出现的时机
  const isSubNavVisible = scrollVal > 2400;

  // 🍎 判定是否进入深色背景区
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
    document.body.style.backgroundColor = '#fff';
    setTimeout(() => setHeroReady(true), 150);
    setTimeout(() => setTextReady(true), 800);
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
    document
      .querySelectorAll('.anim-title, .card, .narrative, .spec-grid')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang, heroReady]);

  const factor = Math.min(scrollVal / 300, 1);

  return (
    <div className="apple-ax1-wrapper" key={lang}>
      <nav
        className="fixed-sub-nav"
        style={{
          height: `${52 - factor * 4}px`,
          backgroundColor: `rgba(255, 255, 255, ${0.72 + factor * 0.18})`,
          backdropFilter: `blur(${20 + factor * 20}px) saturate(180%)`,
          WebkitBackdropFilter: `blur(${20 + factor * 20}px) saturate(180%)`,
          borderBottom: `1px solid rgba(0,0,0,${0.03 + factor * 0.05})`,
          transform: isSubNavVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isSubNavVisible ? 1 : 0,
          transition:
            'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, height 0.3s ease',
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
                backgroundColor: isDeepSection ? '#1d1d1f' : '#0071e3',
                color: '#fff',
                fontSize: `${12 - factor * 1}px`,
                borderRadius: '20px',
                transform: `scale(${1 - factor * 0.05})`,
                transition:
                  'background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease, transform 0.2s',
              }}
            >
              {t.inquiry}
            </button>
          </div>
        </div>
      </nav>

      <div className="nav-spacer" />

      {/* 1屏: Hero */}
      <section className="h-sec">
        <div className={`h-img ${heroReady ? 'reveal' : ''}`}>
          <span className="h-icon">🦾</span>
        </div>
        <div className={`h-text ${textReady ? 'reveal' : ''}`}>
          <h1 className="h-giant">{t.hero.h}</h1>
          <p className="h-sub">{t.hero.p}</p>
        </div>
      </section>

      {/* 2屏: Highlights - 🍎 磁吸居中修正 🍎 */}
      <section className="scroll-wall">
        <div className="limit-w">
          <h2 className="sec-t anim-title">{t.h.title}</h2>
        </div>
        <div
          className="wall-scroller scroll-snap-x"
          ref={scrollRefH}
          onScroll={() => {
            if (scrollRefH.current) {
              const { scrollLeft, scrollWidth, clientWidth } =
                scrollRefH.current;
              setProgH((scrollLeft / (scrollWidth - clientWidth)) * 100);
            }
          }}
        >
          <div className="wall-track">
            {/* 🍎 增加首尾占位，确保第一张和最后一张也能居中 🍎 */}
            <div className="snap-padding-edge" />
            {t.h.cards.map((item, i) => (
              <div
                key={i}
                className="card snap-center-card w-giant is-white-card"
              >
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

      {/* 3屏: Closer Look - 🍎 磁吸居中修正 🍎 */}
      <section className="scroll-wall brighter-grey">
        <div className="limit-w">
          <h2 className="sec-t anim-title">{t.c.title}</h2>
        </div>
        <div className="wall-scroller scroll-snap-x">
          <div className="wall-track">
            <div className="snap-padding-edge" />
            <div className="card snap-center-card w-l img-placeholder-1 is-white-card"></div>
            <div className="card snap-center-card w-s img-placeholder-2 is-white-card"></div>
            <div className="card snap-center-card w-s img-placeholder-3 is-white-card"></div>
            <div className="card snap-center-card w-l img-placeholder-4 is-white-card"></div>
            <div className="card snap-center-card w-s img-placeholder-5 is-white-card"></div>
            <div className="snap-padding-edge" />
          </div>
        </div>
      </section>

      {/* 4屏: 叙事黑 */}
      <section className="narrative is-dark-pop">
        <div className="n-bg">🚀</div>
        <div className="n-content anim-group">
          <h2 className="n-w">{t.n1.h}</h2>
          <h2 className="n-g">{t.n1.p}</h2>
          <p className="n-s">{t.n1.sub}</p>
        </div>
      </section>

      {/* 5屏: 叙事白 */}
      <section className="narrative is-laboratory-white">
        <div className="n-bg op-low">🎯</div>
        <div className="n-content anim-group">
          <h2 className="n-b">{t.n2.h}</h2>
          <h2 className="n-g">{t.n2.p}</h2>
          <p className="n-s-dark">{t.n2.sub}</p>
        </div>
      </section>

      {/* 6屏: 参数对比 */}
      <section className="spec-section is-laboratory-white">
        <div className="limit-w">
          <h2 className="sec-t anim-title">{t.specs.title}</h2>
          <div className="spec-grid">
            <div className="spec-header">
              <div className="spec-label-empty"></div>
              <div className="spec-model-info">
                <span className="spec-icon">🦾</span>
                <h3>AX-1 Pro</h3>
              </div>
              <div className="spec-model-info">
                <span className="spec-icon">🏗️</span>
                <h3>AX-1 Ultra</h3>
              </div>
            </div>
            <div className="spec-body">
              {t.specs.items.map((row, idx) => (
                <div key={idx} className="spec-row">
                  <div className="spec-label">{row.label}</div>
                  <div className="spec-value-box">
                    <div className="spec-value">
                      <b>{row.v1}</b>
                    </div>
                    <div className="spec-value">
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
        .apple-ax1-wrapper { background: #fff; color: #1d1d1f; font-family: -apple-system, sans-serif; overflow-x: hidden; }
        .limit-w { max-width: 1024px; margin: 0 auto; padding: 0 22px; }
        .fixed-sub-nav { position: fixed; top: 44px; left: 0; width: 100%; z-index: 1000; display: flex; align-items: center; will-change: transform, opacity; }
        .nav-content-limiter { width: 100%; max-width: 980px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; height: 100%; }
        .p-name { font-weight: 600; color: #1d1d1f; transition: all 0.3s; }
        .p-inquiry { border: none; cursor: pointer; }
        .nav-spacer { height: 52px; }
        .h-sec { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .h-img { opacity: 0; transform: scale(1.3); transition: 2s cubic-bezier(0.15, 0, 0.15, 1); }
        .h-img.reveal { opacity: 1; transform: scale(1); }
        .h-icon { font-size: 180px; }
        .h-text { margin-top: 40px; opacity: 0; transform: translateY(30px); transition: 1.5s ease 0.8s; }
        .h-text.reveal { opacity: 1; transform: translateY(0); }
        .h-giant { font-size: clamp(60px, 10vw, 100px); font-weight: 700; margin: 0; }
        .h-sub { font-size: 32px; color: #86868b; }
        .scroll-wall { padding: 120px 0; }
        .brighter-grey { background: #f5f5f7; }
        .sec-t { font-size: clamp(40px, 8vw, 90px); font-weight: 700; margin-bottom: 80px; opacity: 0; transform: translateY(30px); transition: 1s cubic-bezier(0.15, 0, 0.15, 1); }
        .sec-t.reveal { opacity: 1; transform: translateY(0); }

        /* 🍎 磁吸核心 CSS 🍎 */
        .wall-scroller { 
          width: 100%; 
          overflow-x: auto; 
          scrollbar-width: none; 
          -ms-overflow-style: none;
        }
        .scroll-snap-x {
          scroll-snap-type: x mandatory;
        }
        .wall-scroller::-webkit-scrollbar { display: none; }
        .wall-track { display: flex; gap: 30px; padding-bottom: 60px; }
        
        /* 左右边缘填充，确保居中效果 */
        .snap-padding-edge { 
          flex: 0 0 calc(50vw - 45vw - 15px); /* 基于 w-giant 的一半宽度计算 */
        }
        @media (min-width: 1060px) {
           .snap-padding-edge { flex: 0 0 calc(50vw - 530px); }
        }

        .card { border-radius: 40px; position: relative; overflow: hidden; box-shadow: 0 20px 80px rgba(0,0,0,0.06); }
        .snap-center-card { scroll-snap-align: center; }
        
        .w-giant { flex: 0 0 90vw; max-width: 1060px; height: 85vh; }
        .w-l { flex: 0 0 78vw; max-width: 800px; height: 550px; }
        .w-s { flex: 0 0 44vw; max-width: 460px; height: 550px; }

        .is-white-card { background: #fff; }
        .card-info-floating { position: absolute; z-index: 2; padding: 80px; width: 100%; opacity: 0; transform: translateY(30px); transition: 1.2s; }
        .card.reveal .card-info-floating { opacity: 1; transform: translateY(0); }
        .floating-text { font-size: clamp(28px, 4vw, 56px); font-weight: 700; }
        .floating-text.delay { font-size: 24px; color: #86868b; margin-top: 20px; }
        .card-bg-icon-box { position: absolute; font-size: 350px; opacity: 0.03; right: -30px; bottom: -30px; pointer-events: none; }

        .img-placeholder-1 { background: #eaeaea; } .img-placeholder-2 { background: #f0f0f0; } .img-placeholder-3 { background: #e0e0e0; }
        .img-placeholder-4 { background: #e5e5e5; } .img-placeholder-5 { background: #f2f2f2; }
        .is-dark-pop { height: 100vh; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; text-align: center; }
        .is-laboratory-white { height: 100vh; background: #f5f5f7; display: flex; align-items: center; justify-content: center; text-align: center; }
        .anim-group { opacity: 0; transform: translateY(40px); transition: 1.5s; }
        .reveal .anim-group { opacity: 1; transform: translateY(0); }
        .n-bg { font-size: 600px; position: absolute; opacity: 0.1; z-index: 1; }
        .n-w, .n-g, .n-b { font-size: clamp(40px, 9vw, 110px); font-weight: 700; margin: 0; line-height: 1; }
        .n-g { color: #86868b; }
        .n-s, .n-s-dark { font-size: clamp(18px, 2.2vw, 28px); margin-top: 40px; max-width: 750px; line-height: 1.5; }
        .spec-section { padding: 150px 0; height: auto; min-height: 100vh; }
        .spec-grid { opacity: 0; transform: translateY(40px); transition: 1.5s ease; border-top: 1px solid #d2d2d7; }
        .spec-grid.reveal { opacity: 1; transform: translateY(0); }
        .spec-header { display: flex; padding: 60px 0; border-bottom: 1px solid #d2d2d7; }
        .spec-model-info { flex: 1; text-align: center; }
        .spec-row { display: flex; padding: 40px 0; border-bottom: 1px solid #e5e5e5; align-items: center; }
        .spec-label { flex: 1; color: #86868b; font-size: 14px; text-transform: uppercase; }
        .spec-value-box { flex: 2; display: flex; }
        .spec-value { flex: 1; text-align: center; font-size: 19px; }
        .bar-track { width: 180px; height: 2px; background: #e5e5e5; margin: 0 auto; position: relative; }
        .bar-fill { position: absolute; width: 60px; height: 100%; background: #0071e3; }
        @media (max-width: 734px) {
          .nav-content-limiter { padding: 0 20px; }
          .p-name { font-size: 17px; }
          .h-giant { font-size: 52px; }
          .spec-row { flex-direction: column; gap: 15px; text-align: center; }
          .spec-value-box { width: 100%; display: flex; align-items: center; }
          .spec-value { flex: 1; min-height: 3em; display: flex; align-items: center; justify-content: center; font-size: 15px; }
          .snap-padding-edge { flex: 0 0 5vw; } /* 移动端边缘缩小 */
        }
      `}</style>
    </div>
  );
}
