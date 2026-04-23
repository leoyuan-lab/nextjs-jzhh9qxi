'use client';
import React, { useState, useEffect } from 'react';

export default function HomePage() {
  const [lang, setLang] = useState('zh');
  useEffect(() => {
    const update = () => setLang(localStorage.getItem('user-lang') || 'zh');
    window.addEventListener('langChange', update);
    update();
    return () => window.removeEventListener('langChange', update);
  }, []);

  // 这里的每个对象就是一屏，你可以随时在数组里增加新屏
  const sections = [
    {
      id: 'ax1',
      title: lang === 'zh' ? '机器人手臂 AX-1' : 'Robot Arm AX-1',
      sub: lang === 'zh' ? '极致精密，工业之巅。' : 'Precision at the peak.',
      bg: '#f5f5f7',
      color: '#1d1d1f',
      img: '🦾',
    },
    {
      id: 'home',
      title: 'HomeBot',
      sub: lang === 'zh' ? '全心全意，为你服务。' : 'At your service.',
      bg: '#000',
      color: '#fff',
      img: '🤖',
    },
    {
      id: 'industry',
      title: lang === 'zh' ? '工业协作' : 'Industrial Co-op',
      sub: lang === 'zh' ? '让生产力飞跃。' : 'Leap in productivity.',
      bg: '#fff',
      color: '#1d1d1f',
      img: '🏭',
    },
    {
      id: 'dev',
      title: 'Developer SDK',
      sub: lang === 'zh' ? '创造你的应用。' : 'Build the future.',
      bg: '#1d1d1f',
      color: '#fff',
      img: '💻',
    },
    {
      id: 'lab',
      title: 'Apple Robot Lab',
      sub: lang === 'zh' ? '探索未来。' : 'Explore the future.',
      bg: '#fbfbfd',
      color: '#1d1d1f',
      img: '🧪',
    },
  ];

  return (
    <main className="apple-home-wrapper">
      {sections.map((s) => (
        <section
          key={s.id}
          className="screen-outer"
          style={{ backgroundColor: s.bg, color: s.color }}
        >
          <div className="content-limit">
            <div className="text-box">
              <h2 className="title">{s.title}</h2>
              <p className="subtitle">{s.sub}</p>
              <div className="links">
                <span
                  onClick={() =>
                    s.id === 'ax1' && (window.location.href = '/arm')
                  }
                >
                  {lang === 'zh' ? '进一步了解 >' : 'Learn more >'}
                </span>
                <span>{lang === 'zh' ? '购买 >' : 'Buy >'}</span>
              </div>
            </div>
            <div className="image-box">
              {s.id === 'ax1' ? (
                <div className="hero-arm-wrap" aria-hidden="true">
                  <div className="arm-base" />
                  <div className="arm-joint arm-joint-1">
                    <div className="arm-link arm-link-1">
                      <div className="arm-joint arm-joint-2">
                        <div className="arm-link arm-link-2">
                          <div className="gripper">
                            <span className="grip grip-top" />
                            <span className="grip grip-bottom" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                s.img
              )}
            </div>
          </div>
        </section>
      ))}

      <style jsx>{`
        .apple-home-wrapper { width: 100%; }
        
        /* 每一屏的基础样式 */
        .screen-outer {
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          overflow: hidden;
          /* 屏与屏之间的白色细线，模仿苹果产品块的分割感 */
          border-bottom: 12px solid #fff; 
        }

        .content-limit {
          max-width: 1024px;
          width: 100%;
          height: 100%;
          padding: 0 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-sizing: border-box;
        }

        /* 修改重点：统一文字距离顶部的距离，让所有页面保持一致 */
        .text-box { margin-top: 12vh; z-index: 2; }
        
        .title { font-size: clamp(32px, 8vw, 56px); font-weight: 600; margin: 0; letter-spacing: -0.02em; }
        .subtitle { font-size: clamp(18px, 3vw, 26px); margin-top: 12px; opacity: 0.9; }
        .links { margin-top: 20px; display: flex; gap: 30px; justify-content: center; font-size: 21px; color: #0066cc; }
        .links span { cursor: pointer; transition: 0.3s; }
        .links span:hover { text-decoration: underline; }

        .image-box { 
          flex: 1; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 160px;
          z-index: 1;
          /* 轻轻给个入场动画感 */
          animation: fadeUp 1s ease;
        }

        .hero-arm-wrap {
          position: relative;
          width: min(72vw, 520px);
          height: min(52vw, 360px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.35));
        }
        .arm-base {
          position: absolute;
          bottom: 0;
          width: 180px;
          height: 44px;
          border-radius: 22px;
          background: linear-gradient(180deg, #3f4652, #242a33);
        }
        .arm-joint {
          position: absolute;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 35%, #8b93a1, #5a6271 60%, #303643);
          box-shadow: inset 0 0 0 2px rgba(255,255,255,0.08);
        }
        .arm-joint-1 {
          width: 56px;
          height: 56px;
          bottom: 22px;
          left: calc(50% - 20px);
          transform-origin: 50% 50%;
          animation: armSwing1 3.8s ease-in-out infinite alternate;
        }
        .arm-link {
          position: absolute;
          border-radius: 18px;
          background: linear-gradient(160deg, #8f97a7, #4f5868 55%, #2f3642);
        }
        .arm-link-1 {
          width: 24px;
          height: 142px;
          left: 16px;
          top: -126px;
          transform-origin: 50% 100%;
        }
        .arm-joint-2 {
          width: 44px;
          height: 44px;
          left: -10px;
          top: -24px;
          animation: armSwing2 3.8s ease-in-out infinite alternate;
        }
        .arm-link-2 {
          width: 18px;
          height: 116px;
          left: 13px;
          top: -102px;
          transform-origin: 50% 100%;
        }
        .gripper {
          position: absolute;
          left: -12px;
          top: -18px;
          width: 42px;
          height: 24px;
        }
        .grip {
          position: absolute;
          right: 0;
          width: 22px;
          height: 10px;
          border-radius: 8px;
          background: linear-gradient(150deg, #c1c8d3, #6d7687);
          transform-origin: 2px 50%;
          animation: gripPulse 1.9s ease-in-out infinite;
        }
        .grip-top { top: 0; transform: rotate(-26deg); }
        .grip-bottom { bottom: 0; transform: rotate(26deg); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes armSwing1 {
          0% { transform: rotate(-14deg); }
          50% { transform: rotate(-2deg); }
          100% { transform: rotate(12deg); }
        }
        @keyframes armSwing2 {
          0% { transform: rotate(26deg); }
          50% { transform: rotate(10deg); }
          100% { transform: rotate(-16deg); }
        }
        @keyframes gripPulse {
          0%, 100% { width: 22px; }
          50% { width: 16px; }
        }

        @media (max-width: 734px) {
          .screen-outer { height: 85vh; border-bottom: 8px solid #fff; }
          /* 移动端也同步调整一下位置，防止文字太靠顶 */
          .text-box { margin-top: 8vh; }
          .title { font-size: 38px; }
          .subtitle { font-size: 19px; }
          .image-box { font-size: 100px; }
          .hero-arm-wrap { width: min(86vw, 360px); height: min(68vw, 260px); }
          .arm-base { width: 140px; height: 34px; }
          .arm-link-1 { height: 110px; top: -98px; }
          .arm-link-2 { height: 88px; top: -78px; }
        }
      `}</style>
    </main>
  );
}