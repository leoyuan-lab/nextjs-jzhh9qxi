// app/page.tsx
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
      bg: '#000',
      color: '#fff',
      img: '🦾',
    },
    {
      id: 'home',
      title: 'HomeBot',
      sub: lang === 'zh' ? '全心全意，为你服务。' : 'At your service.',
      bg: '#f5f5f7',
      color: '#1d1d1f',
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
            <div className="image-box">{s.img}</div>
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

        .text-box { margin-top: 15vh; z-index: 2; }
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

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 734px) {
          .screen-outer { height: 85vh; border-bottom: 8px solid #fff; }
          .title { font-size: 38px; }
          .subtitle { font-size: 19px; }
          .image-box { font-size: 100px; }
        }
      `}</style>
    </main>
  );
}
