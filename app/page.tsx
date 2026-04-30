'use client';
import React, { useState, useEffect, useRef } from 'react';

export default function HomePage() {
  const [lang, setLang] = useState('zh');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showDragHint, setShowDragHint] = useState(false);
  const viewerRef5 = useRef<any>(null);
  const viewerRef20 = useRef<any>(null);
  const flangeSpinTimerRef = useRef<number | null>(null);
  const heroRotateDelayRef = useRef<number | null>(null);
  const hintHideTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const forceHideTimerRef = useRef<number | null>(null);
  const loadingUnmountTimerRef = useRef<number | null>(null);
  const ctaLearn = lang === 'zh' ? '进一步了解' : 'Learn more';
  const ctaInquiry = lang === 'zh' ? '咨询' : 'Inquiry';
  const openInquiry = () => window.dispatchEvent(new Event('apple-inquiry-open'));

  useEffect(() => {
    // 🍎 已移除 Meta 标签 JS 操作补丁
    const update = () => setLang(localStorage.getItem('user-lang') || 'zh');
    window.addEventListener('langChange', update);
    update();
    return () => window.removeEventListener('langChange', update);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (loadingUnmountTimerRef.current) window.clearTimeout(loadingUnmountTimerRef.current);
    loadingUnmountTimerRef.current = window.setTimeout(() => {
      setShowLoadingScreen(false);
    }, 1300);
    return () => {
      if (loadingUnmountTimerRef.current) window.clearTimeout(loadingUnmountTimerRef.current);
    };
  }, [isLoaded]);

  const applyPerfectMaterial = (model: any) => {
    if (!model) return;
    model.materials.forEach((material: any) => {
      const name = material.name; 
      const lowerName = name.toLowerCase();
      const isMetalPart = 
        lowerName.includes('metal') || lowerName.includes('steel') || 
        lowerName.includes('iron') || lowerName.includes('joint') ||
        name === 'Material.001' || name === 'Material.003';

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

  const quatFromAxisAngle = (axis: [number, number, number], angle: number): [number, number, number, number] => {
    const [ax, ay, az] = axis;
    const half = angle * 0.5;
    const s = Math.sin(half);
    return [ax * s, ay * s, az * s, Math.cos(half)];
  };

  const resolveNode = (viewer: any, names: string[]) => {
    for (const name of names) {
      const node =
        viewer?.model?.getNode?.(name) ||
        viewer?.model?.getNodeByName?.(name) ||
        viewer?.model?.scene?.getObjectByName?.(name) ||
        viewer?.scene?.getObjectByName?.(name);
      if (node) return node;
    }
    return null;
  };

  const applyNodeRotation = (node: any, axis: [number, number, number], angle: number) => {
    if (!node) return;
    const q = quatFromAxisAngle(axis, angle);
    if (Array.isArray(node.rotation) && node.rotation.length === 4) {
      node.rotation = q;
      return;
    }
    if (node.quaternion && typeof node.quaternion.set === 'function') {
      node.quaternion.set(q[0], q[1], q[2], q[3]);
      return;
    }
    if (node.rotation && typeof node.rotation === 'object') {
      if ('x' in node.rotation && 'y' in node.rotation && 'z' in node.rotation) {
        node.rotation.x = axis[0] ? angle : 0;
        node.rotation.y = axis[1] ? angle : 0;
        node.rotation.z = axis[2] ? angle : 0;
      }
    }
  };

  useEffect(() => {
    const v5 = viewerRef5.current;
    const v20 = viewerRef20.current;

    const finishLoading = () => {
      setLoadingProgress(100);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => setIsLoaded(true), 320);
    };

    const onProgress = (event: any) => {
      const raw = event?.detail?.totalProgress;
      if (typeof raw !== 'number') return;
      const progress = Math.min(99, Math.max(0, Math.round(raw * 100)));
      setLoadingProgress((prev) => Math.max(prev, progress));
      if (progress >= 100) finishLoading();
    };

    const startJointSpin = (viewer: any) => {
      if (!viewer?.model) return;
      const flangeNode = resolveNode(viewer, ['J6_Flange', 'L6_flange']);
      const wristNode = resolveNode(viewer, ['Wrist_Roll', 'J4_Wrist_Roll', 'J5_Wrist_Pitch']);
      if (!flangeNode && !wristNode) return;
      let angle = 0;
      if (flangeSpinTimerRef.current) window.clearInterval(flangeSpinTimerRef.current);
      flangeSpinTimerRef.current = window.setInterval(() => {
        angle += 0.04;
        if (flangeNode) applyNodeRotation(flangeNode, [0, 1, 0], angle * 1.2);
        if (wristNode) applyNodeRotation(wristNode, [1, 0, 0], Math.sin(angle * 0.8) * 0.9);
      }, 30);
    };

    const startSimpleHeroSequence = (viewer: any) => {
      if (!viewer) return;
      
      const isMobile = window.innerWidth < 768;
      
      const targetY = isMobile ? '122%' : '110%';
      viewer.setAttribute('camera-target', `auto ${targetY} auto`); 
      
      const orbitDist = isMobile ? '1000m' : '1900m';
      viewer.setAttribute('camera-orbit', `45deg 85deg ${orbitDist}`);
      
      const fov = isMobile ? '25deg' : '15.5deg';
      viewer.setAttribute('field-of-view', fov);
      
      viewer.removeAttribute('auto-rotate');
      viewer.setAttribute('camera-controls', '');
      
      if (heroRotateDelayRef.current) window.clearTimeout(heroRotateDelayRef.current);
      heroRotateDelayRef.current = window.setTimeout(() => {
        viewer.setAttribute('auto-rotate', '');
        setShowDragHint(true);
        if (hintHideTimerRef.current) window.clearTimeout(hintHideTimerRef.current);
        hintHideTimerRef.current = window.setTimeout(() => setShowDragHint(false), 4200);
      }, 1000);
    };

    const onLoad5 = () => {
      applyPerfectMaterial(v5.model);
      startJointSpin(v5);
      startSimpleHeroSequence(v5);
      finishLoading();
    };

    const onLoad20 = () => {
      applyPerfectMaterial(v20.model);
      const isMobile = window.innerWidth < 768;
      v20.setAttribute('camera-target', isMobile ? 'auto 122% auto' : 'auto 110% auto'); 
      v20.setAttribute('camera-orbit', `-45deg 80deg ${isMobile ? '1100m' : '2000m'}`);
      v20.setAttribute('field-of-view', isMobile ? '25deg' : '15.5deg');
    };

    if (v5) {
      v5.addEventListener('progress', onProgress);
      v5.addEventListener('load', onLoad5);
    }
    
    const onHeroInteract = () => setShowDragHint(false);
    if (v5) {
      v5.addEventListener('pointerdown', onHeroInteract);
      v5.addEventListener('touchstart', onHeroInteract);
    }
    
    if (v20) v20.addEventListener('load', onLoad20);

    forceHideTimerRef.current = window.setTimeout(() => finishLoading(), 12000);

    return () => {
      if (v5) {
        v5.removeEventListener('progress', onProgress);
        v5.removeEventListener('load', onLoad5);
        v5.removeEventListener('pointerdown', onHeroInteract);
        v5.removeEventListener('touchstart', onHeroInteract);
      }
      if (v20) v20.removeEventListener('load', onLoad20);
      if (flangeSpinTimerRef.current) window.clearInterval(flangeSpinTimerRef.current);
      if (heroRotateDelayRef.current) window.clearTimeout(heroRotateDelayRef.current);
      if (hintHideTimerRef.current) window.clearTimeout(hintHideTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (forceHideTimerRef.current) window.clearTimeout(forceHideTimerRef.current);
      if (loadingUnmountTimerRef.current) window.clearTimeout(loadingUnmountTimerRef.current);
    };
  }, []);

  return (
    <main className="apple-home-wrapper">
      {/* Loading Screen */}
      {showLoadingScreen && (
        <div className={`loading-screen ${isLoaded ? 'exit' : ''}`}>
          <div className="loading-content">
            <h1 className="slogan">Let's get rolling.</h1>
            <p className="description">
              {lang === 'zh' ? '赋能双手，重塑灵感。' : 'Empowering hands, reshaping inspiration.'}
            </p>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <span className="progress-text">{loadingProgress}%</span>
          </div>
        </div>
      )}

      {/* 屏1: FR5 */}
      <section className="screen-outer" style={{ backgroundColor: '#ffffff', color: '#1d1d1f' }}>
        <div className={`hero-3d-wrap ${isLoaded ? 'fr5-entry-animation' : 'hidden-init'}`}>
          <model-viewer 
            ref={viewerRef5} 
            src="/models/fr5.glb" 
            disable-zoom 
            camera-orbit="45deg 85deg 1900m" 
            camera-target="auto 110% auto" 
            field-of-view="15.5deg" 
            shadow-intensity="0.9"
            shadow-softness="1.15"
            environment-image="neutral" 
            environment-intensity="0.82"
            exposure="0.98"
            interaction-prompt="none" 
            touch-action="pan-y" 
            style={{ width: '100%', height: '100%', outline: 'none' } as any} 
          />
        </div>
        <div className={`drag-hint ${showDragHint ? 'show' : ''}`}>
          {lang === 'zh' ? '按住鼠标拖动，可 360° 查看' : 'Drag to view in 360°'}
        </div>
        <div className="content-limit">
          <div className="text-box dark-copy">
            <h2 className="title">{lang === 'zh' ? '法奥 FR5' : 'FAIRINO FR5'}</h2>
            <p className="subtitle">{lang === 'zh' ? '极致精密，协作之巅。' : 'The new era of cobots.'}</p>
            <div className="cta-row">
              <a href="/arm" className="cta-link">{ctaLearn}</a>
              <button type="button" className="cta-link cta-btn" onClick={openInquiry}>{ctaInquiry}</button>
            </div>
          </div>
        </div>
      </section>

      {/* 屏2: FR20 */}
      <section className="screen-outer" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
        <div className={`hero-3d-wrap ${isLoaded ? 'ready-visible' : 'hidden-init'}`}>
          <model-viewer 
            ref={viewerRef20} 
            src="/models/fr20.glb" 
            auto-rotate 
            disable-zoom 
            camera-orbit="-45deg 80deg 2000m" 
            camera-target="auto 110% auto"
            shadow-intensity="0.9"
            shadow-softness="1.15"
            environment-image="neutral" 
            environment-intensity="0.82"
            exposure="1.02"
            field-of-view="15.5deg" 
            touch-action="pan-y"
            style={{ width: '100%', height: '100%', outline: 'none' } as any} 
          />
        </div>
        <div className="content-limit">
          <div className="text-box">
            <h2 className="title">{lang === 'zh' ? '法奥 FR20' : 'FAIRINO FR20'}</h2>
            <p className="subtitle">{lang === 'zh' ? '超强负载，工业核心。' : 'Born for heavy duty.'}</p>
            <div className="cta-row">
              <a href="/" className="cta-link">{ctaLearn}</a>
              <button type="button" className="cta-link cta-btn" onClick={openInquiry}>{ctaInquiry}</button>
            </div>
          </div>
        </div>
      </section>

      {/* 屏3: 详情屏 */}
      <section className="screen-outer-gap">
        <div className="grid-container">
          <div className="sharp-card">
            <div className="card-text">
              <h3>{lang === 'zh' ? '极致触觉' : 'Precise Touch'}</h3>
              <p>{lang === 'zh' ? '毫秒级碰撞响应' : 'Millisecond response.'}</p>
              <div className="cta-row card-cta">
                <a href="/" className="cta-link">{ctaLearn}</a>
                <button type="button" className="cta-link cta-btn" onClick={openInquiry}>{ctaInquiry}</button>
              </div>
            </div>
            <div className="card-image-box" style={{ backgroundImage: 'url(/images/detail1.jpg)' }}></div>
          </div>
          <div className="sharp-card">
            <div className="card-text">
              <h3>{lang === 'zh' ? '智慧核心' : 'Smart Core'}</h3>
              <p>{lang === 'zh' ? '自研轨迹规划' : 'Smart path planning.'}</p>
              <div className="cta-row card-cta">
                <a href="/" className="cta-link">{ctaLearn}</a>
                <button type="button" className="cta-link cta-btn" onClick={openInquiry}>{ctaInquiry}</button>
              </div>
            </div>
            <div className="card-image-box" style={{ backgroundImage: 'url(/images/detail2.jpg)' }}></div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .apple-home-wrapper { 
          width: 100%; 
          background: transparent; 
          overflow-x: hidden;
        }
        
        .screen-outer { 
          position: relative; 
          width: 100%; 
          height: 100vh; 
          height: 100dvh; 
          overflow: hidden;
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          margin: 0;
          padding: 0;
        }
        
        .screen-outer-gap { 
          position: relative; 
          width: 100%; 
          height: 100vh; 
          height: 100dvh; 
          padding: 10px; 
          box-sizing: border-box; 
          background: #ffffff; 
        }

        .grid-container { display: flex; width: 100%; height: 100%; gap: 10px; }
        .sharp-card { flex: 1; background: #f5f5f7; display: flex; flex-direction: column; overflow: hidden; }
        .card-text { padding: 40px; }
        .card-text h3 { font-size: 24px; font-weight: 600; color: #1d1d1f; margin: 0; }
        .card-text p { font-size: 16px; color: #86868b; margin-top: 6px; }
        .card-cta { margin-top: 14px; }
        .card-image-box { flex: 1; background-size: cover; background-position: center; margin: 0 40px 40px 40px; }
        .loading-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffffff; z-index: 100; display: flex; justify-content: center; align-items: center; transition: all 1.2s cubic-bezier(0.645, 0.045, 0.355, 1); }
        .loading-screen.exit { opacity: 0; pointer-events: none; transform: scale(1.1); }
        .loading-content { text-align: center; width: 100%; max-width: 900px; }
        .slogan { font-size: clamp(44px, 10vw, 96px); font-weight: 800; letter-spacing: -0.05em; color: #000; }
        .progress-container { width: 200px; height: 3px; background: #f2f2f2; margin: 20px auto; overflow: hidden; }
        .progress-bar { height: 100%; background: #000; transition: width 0.3s ease; }
        .hero-3d-wrap { position: absolute; width: 100%; height: 100%; z-index: 1; }
        .hidden-init { opacity: 0 !important; visibility: hidden; }
        .ready-visible { opacity: 1; visibility: visible; }
        .fr5-entry-animation { animation: fr5FullEntry 1.4s cubic-bezier(0.2, 0.75, 0.25, 1) forwards; }
        @keyframes fr5FullEntry {
          0% { opacity: 0; transform: scale(1.05) translate3d(0, 5%, 0); filter: blur(6px); }
          100% { opacity: 1; transform: scale(1) translate3d(0, 0, 0); filter: blur(0px); }
        }
        .drag-hint { position: absolute; left: 50%; bottom: 8vh; transform: translateX(-50%) translateY(8px); z-index: 3; font-size: 14px; background: rgba(0, 0, 0, 0.66); color: #fff; padding: 8px 12px; border-radius: 999px; opacity: 0; transition: opacity 0.35s ease, transform 0.35s ease; pointer-events: none; white-space: nowrap; }
        .drag-hint.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .content-limit { position: relative; z-index: 2; margin-top: 10vh; text-align: center; }
        .text-box { pointer-events: auto; }
        .title { font-size: clamp(40px, 8vw, 56px); font-weight: 600; margin: 0; }
        .subtitle { font-size: clamp(20px, 3vw, 26px); margin-top: 12px; opacity: 0.8; }
        .cta-row {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          margin-top: 14px;
        }
        .cta-link {
          color: #06c;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: -0.01em;
          text-decoration: none;
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
        }
        .cta-link:hover { text-decoration: underline; }
        .cta-btn { font-family: inherit; }
        .dark-copy .cta-link { color: #2997ff; }
        @media (max-width: 768px) {
          .grid-container { flex-direction: column; }
          .screen-outer-gap { height: auto; min-height: 100dvh; }
          .sharp-card { min-height: 50dvh; }
          .cta-link { font-size: 17px; }
          .apple-home-wrapper > .screen-outer:nth-of-type(-n + 2) {
            height: 112dvh;
            min-height: 112dvh;
          }
        }
      `}</style>
    </main>
  );
}