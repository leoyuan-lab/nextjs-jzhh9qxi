'use client';
import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from 'react';

// --- 🍎 1. 标准 Context 接口 ---
const InquiryContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
});
export const useInquiry = () => useContext(InquiryContext);

// 🍎 你的 600 行配置字典 🍎
const GLOBAL_CONFIG = {
  zh: {
    nav: [
      {
        label: '机器人手臂',
        url: '/arm',
        links: ['AX-1', '技术规格', '工业应用', '开发者平台'],
      },
      {
        label: '家用机器人',
        url: '/',
        links: ['HomeBot 2', '厨房助手', '扫地机器人', '智能家居控制'],
      },
      {
        label: '服务机器人',
        url: '/',
        links: ['酒店配送', '医疗辅助', '教育套件'],
      },
      { label: '支持', url: '/', links: ['保修查询', '手册下载', '预约维修'] },
      { label: '关于', url: '/', links: ['企业愿景', 'Newsroom', '联系我们'] },
    ],
    search: {
      title: '快速链接',
      noResult: '未找到匹配结果',
      placeholder: '搜索机器人...',
    },
    ui: {
      explore: '探索',
      copyright: 'Copyright © 2026 Apple Robot Inc. 保留所有权利。',
      langBtn: 'English',
      mobileLang: 'EN',
    },
    footnotes: [
      {
        q: '核心优势',
        a: '我们在机器人手臂领域拥有超过 5 年中的专业分销与技术支持经验；所有产品在离厂前均通过 100% 严格质量检测，确保一流品质与卓越性能。',
      },
      {
        q: '订购咨询',
        a: '销售代表提供 24/7 在线咨询服务。只需发送业务询价邮件并提供您的具体需求，我们保证在 12 小时内为您提供正式回复。',
      },
      {
        q: '现货订单',
        a: '标准规格的现货产品在确认付款后 3-5 个工作日内安排发货。大宗订单或特殊定制订单的交货周期请以销售合同最终确认时间为准。',
      },
      {
        q: '性能数据',
        a: '所有技术参数（如重复定位精度 ±0.02mm）均在受控实验室环境下测得。实际运行表现可能因有效负载、移动速度及环境湿度波动而产生细微差异。',
      },
      {
        q: '定制服务',
        a: '我们支持深度 OEM/ODM 定制，包括但不限于机身涂装、Logo 丝印及针对特定行业开发的专用末端执行器。定制周期通常为 20-30 个工作日。',
      },
      {
        q: '保修服务',
        a: '核心机械部件（电机、减速机）及控制系统享有 2 年有限保修。我们提供全球范围内的技术支持响应，确保您的生产线始终保持高效运转。',
      },
      {
        q: '合规认证',
        a: '本网站展示的所有产品均符合国际 RoHS 环保标准，不含有害物质，并已通过欧盟 CE 强制性安全认证及 ISO9001 质量管理体系认证。',
      },
    ],
  },
  en: {
    nav: [
      {
        label: 'Robot Arm',
        url: '/arm',
        links: ['AX-1', 'Specs', 'Industrial', 'Dev Platform'],
      },
      {
        label: 'Home Bot',
        url: '/',
        links: ['HomeBot 2', 'Kitchen Aid', 'Vacuum Bot', 'Smart Home'],
      },
      {
        label: 'Service Bot',
        url: '/',
        links: ['Hotel Delivery', 'Medical', 'Edu Kits'],
      },
      {
        label: 'Support',
        url: '/',
        links: ['Warranty', 'Manuals', 'Genius Bar'],
      },
      {
        label: 'About',
        url: '/',
        links: ['Our Vision', 'Newsroom', 'Contact'],
      },
    ],
    search: {
      title: 'Quick Links',
      noResult: 'No results found',
      placeholder: 'Search Robot...',
    },
    ui: {
      explore: 'Explore',
      copyright: 'Copyright © 2026 Apple Robot Inc. All rights reserved.',
      langBtn: '中文',
      mobileLang: '中',
    },
    footnotes: [
      {
        q: 'Advantage',
        a: 'Professional robot arms provider with OVER 5 years of experience. 100% quality inspection before shipment ensures top-tier reliability.',
      },
      {
        q: 'Ordering',
        a: 'Sales representatives online 24/7. Send us an inquiry with your specs and expect an official email response within 12 hours.',
      },
      {
        q: 'Delivery',
        a: 'Standard stock products are shipped within 3-5 business days upon payment. Lead time for bulk or custom orders is subject to contract confirmation.',
      },
      {
        q: 'Performance',
        a: 'Specs like repeatability (±0.02mm) are tested in controlled lab environments. Actual results may vary based on load, speed, and environmental humidity.',
      },
      {
        q: 'Customization',
        a: 'Full OEM/ODM services supported, including custom colors, Logo printing, and specialized end-effectors. Custom lead time is typically 20-30 days.',
      },
      {
        q: 'Warranty',
        a: 'Core mechanical parts (motors, reducers) come with a 2-year limited warranty. Global technical support is available to ensure minimal production downtime.',
      },
      {
        q: 'Compliance',
        a: 'All products comply with international RoHS standards and have passed official CE safety certifications and ISO9001 quality management standards.',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [isReady, setIsReady] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileExpandedApp, setMobileExpandedApp] = useState<string | null>(null);
  const [footerExpandedSection, setFooterExpandedSection] = useState<string | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const config = useMemo(() => GLOBAL_CONFIG[lang], [lang]);

  const handleInquirySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('Name');
    const email = formData.get('Email');
    const industry = formData.get('Industry');
    const msg = formData.get('Body');
    const subject = encodeURIComponent(`AX-1 Inquiry from ${name} (${industry})`);
    const body = encodeURIComponent(`Name: ${name}\r\nEmail: ${email}\r\nIndustry: ${industry}\r\n\r\nMessage:\r\n${msg}`);
    window.location.href = `mailto:info@roooll.com?subject=${subject}&body=${body}`;
  };

  useEffect(() => {
    const handleInquirySignal = () => setIsInquiryOpen(true);
    window.addEventListener('apple-inquiry-open', handleInquirySignal);
    const savedLang = (localStorage.getItem('user-lang') as 'zh' | 'en') || 'zh';
    setLang(savedLang);
    setIsReady(true);
    const checkTheme = () => {
      const bgColor = window.getComputedStyle(document.body).backgroundColor;
      setIsDark(bgColor === 'rgb(0, 0, 0)' || bgColor === '#000' || bgColor === 'rgb(22, 22, 23)');
    };
    checkTheme();
    const themeTimer = setInterval(checkTheme, 500);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
        setIsInquiryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const handleLangChange = () => setLang((localStorage.getItem('user-lang') as 'zh' | 'en') || 'zh');
    window.addEventListener('langChange', handleLangChange);
    return () => {
      window.removeEventListener('langChange', handleLangChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('apple-inquiry-open', handleInquirySignal);
      clearInterval(themeTimer);
    };
  }, []);

  const searchConfig = useMemo(() => {
    const rawIndex: { name: string; url: string }[] = [];
    config.nav.forEach((item) => {
      rawIndex.push({ name: String(item.label), url: item.url });
      item.links.forEach((link) => rawIndex.push({ name: `${item.label} - ${link}`, url: item.url }));
    });
    return { index: rawIndex, quickLinks: config.nav.slice(0, 3).map((i) => i.label), labels: config.search };
  }, [config]);

  const filteredResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return searchConfig.index.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 6);
  }, [searchQuery, searchConfig]);

  const toggleLang = () => {
    const newLang = lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('user-lang', newLang);
    window.dispatchEvent(new Event('langChange'));
    setIsMobileMenuOpen(false);
  };

  const industries = lang === 'zh' ? ['医疗/生物', '汽车制造', '精密电子', '科研教育', '物流仓储', '餐饮/零售', '其他'] : ['Medical & Bio', 'Automotive', 'Electronics', 'Education', 'Logistics', 'Retail', 'Others'];

  return (
    <html lang={lang}>
      <body style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.3s ease', margin: 0, backgroundColor: isDark ? '#000' : '#fff', overflowX: 'hidden' }}>
        <InquiryContext.Provider value={{ isOpen: isInquiryOpen, open: () => setIsInquiryOpen(true), close: () => setIsInquiryOpen(false) }}>
          
          {(activeMenu || isMobileMenuOpen || showSearch || isInquiryOpen) && (
            <div className="nav-mask-master" onClick={() => { setActiveMenu(null); setIsMobileMenuOpen(false); setShowSearch(false); setIsInquiryOpen(false); setSearchQuery(''); }} />
          )}

          <nav className={`apple-nav ${isDark ? 'is-dark' : ''} ${showSearch ? 'search-mode' : ''}`}>
            <div className="nav-container">
              <div className="logo-box" onClick={() => (window.location.href = '/')}>
                <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="28" fill="currentColor" />
                  <path d="M15 55 C 10 45, 90 25, 85 45 C 82 52, 60 62, 50 62 C 40 62, 18 60, 15 55 Z" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
                  <path d="M30 42 C 40 35, 60 30, 75 35" stroke="white" className="logo-stroke-fix" strokeWidth="8" fill="none" />
                </svg>
              </div>
              <div className="desktop-links-group">
                {config.nav.map((item) => (
                  <span key={item.label} onMouseEnter={() => { setActiveMenu(item.label); setShowSearch(false); }} onClick={() => (window.location.href = item.url)}>
                    {item.label}
                  </span>
                ))}
                <span className="pc-search-trigger" onClick={() => setShowSearch(true)}>
                  <svg width="15" height="15" viewBox="0 0 18 18"><path fill="currentColor" d="M17.766 16.66l-4.55-4.55C14.113 10.993 14.75 9.57 14.75 8 14.75 4.27 11.73 1.25 8 1.25S1.25 4.27 1.25 8 4.27 14.75 8 14.75c1.57 0 2.993-.637 4.11-1.534l4.55 4.55a.749.749 0 0 0 1.06 0 .75.75 0 0 0 0-1.06zM2.75 8c0-2.895 2.355-5.25 5.25-5.25 2.895 0 5.25 2.355 5.25 5.25s-2.355 5.25-5.25 5.25A5.256 5.256 0 0 1 2.75 8z"></path></svg>
                </span>
              </div>
              <div className="action-area">
                <button className="lang-pc-switch" onClick={toggleLang}>{config.ui.langBtn}</button>
                <div className="mobile-utility">
                  <span onClick={() => { setShowSearch(true); setIsMobileMenuOpen(false); }}>
                    <svg width="15" height="15" viewBox="0 0 18 18"><path fill="currentColor" d="M17.766 16.66l-4.55-4.55C14.113 10.993 14.75 9.57 14.75 8 14.75 4.27 11.73 1.25 8 1.25S1.25 4.27 1.25 8 4.27 14.75 8 14.75c1.57 0 2.993-.637 4.11-1.534l4.55 4.55a.749.749 0 0 0 1.06 0 .75.75 0 0 0 0-1.06zM2.75 8c0-2.895 2.355-5.25 5.25-5.25 2.895 0 5.25 2.355 5.25 5.25s-2.355 5.25-5.25 5.25A5.256 5.256 0 0 1 2.75 8z"></path></svg>
                  </span>
                  <span className="lang-cap-pill" onClick={toggleLang}>{config.ui.mobileLang}</span>
                </div>
                <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setShowSearch(false); }}>
                  <div className="line"></div>
                  <div className="line"></div>
                </div>
              </div>
            </div>

            {activeMenu && (
              <div className={`mega-menu-hard-layer ${isDark ? 'is-dark' : ''}`} onMouseLeave={() => setActiveMenu(null)}>
                <div className="nav-container menu-inner">
                  <div className="menu-col">
                    <h4 className="menu-label">{config.ui.explore}</h4>
                    <ul>
                      {config.nav.find((i) => i.label === activeMenu)?.links.map((link) => (
                          <li key={link} onClick={() => { window.location.href = config.nav.find((i) => i.label === activeMenu)!.url; setActiveMenu(null); }}>{link}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <div className={`search-panel-layer ${showSearch ? 'active' : ''} ${isDark ? 'is-dark' : ''}`}>
              <div className="nav-container search-inner">
                <div className="search-bar">
                  <span>🔍</span>
                  <input type="text" placeholder={config.search.placeholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus={showSearch} />
                  <span className="close-x" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>✕</span>
                </div>
                <div className="search-results-box">
                  {searchQuery ? (
                    <div className="live-results">
                      {filteredResults.length > 0 ? filteredResults.map((res) => (
                          <div key={res.name} className="s-item" onClick={() => { window.location.href = res.url; setShowSearch(false); setSearchQuery(''); }}>{res.name}</div>
                        )) : <p className="s-no-results">{config.search.noResult}</p>}
                    </div>
                  ) : (
                    <div className="quick-links">
                      <p className="s-section-title">{config.search.title}</p>
                      {searchConfig.quickLinks.map((link) => (<div key={link} className="s-item" onClick={() => setSearchQuery(link)}>{link}</div>))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {isMobileMenuOpen && (
              <div className={`mobile-overlay-fixed visible ${isDark ? 'is-dark' : ''}`}>
                <div className="nav-container mobile-col">
                  {config.nav.map((item) => (
                    <div key={item.label} className={`m-sec ${mobileExpandedApp === item.label ? 'open' : ''}`}>
                      <div className="m-row" onClick={() => setMobileExpandedApp(mobileExpandedApp === item.label ? null : item.label)}>
                        <span>{item.label}</span>
                        <span className="m-plus">{mobileExpandedApp === item.label ? '−' : '+'}</span>
                      </div>
                      <div className="m-subs">
                        {mobileExpandedApp === item.label && item.links.map((sub) => (
                            <div key={sub} className="m-sub-i" onClick={() => { window.location.href = item.url; setIsMobileMenuOpen(false); }}>{sub}</div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <main style={{ position: 'relative', zIndex: 1, paddingTop: '44px', minHeight: '80vh' }}>
            {children}
          </main>

          <div className={`apple-footer-wrapper ${isDark ? 'is-dark' : ''}`}>
            <div className="nav-container footer-content-stack">
              <section className="footnotes">
                <ol className="fn-list">
                  {config.footnotes.map((note, index) => (
                    <li key={index} className="fn-item"><span>{index + 1}. <b>{note.q}: </b>{note.a}</span></li>
                  ))}
                </ol>
              </section>
              <footer className="footer-nav">
                <div className="footer-grid">
                  {config.nav.map((section) => (
                    <div key={section.label} className={`f-col ${footerExpandedSection === section.label ? 'is-open' : ''}`}>
                      <h4 onClick={() => setFooterExpandedSection(footerExpandedSection === section.label ? null : section.label)}>{section.label}<span className="f-chevron-apple"></span></h4>
                      <div className="f-list">{section.links.map((link) => (<span key={link} onClick={() => (window.location.href = section.url)}>{link}</span>))}</div>
                    </div>
                  ))}
                </div>
                <div className="f-bottom"><div className="copyright-line">{config.ui.copyright}</div></div>
              </footer>
            </div>
          </div>

          {/* 🍎 极致优化：苹果级毛玻璃咨询抽屉 🍎 */}
          <div
            className={`exclusive-final-drawer ${isInquiryOpen ? 'open' : ''}`}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: '480px',
              height: '100%',
              /* 🍎 核心优化：极低透明度 + 极高饱和度 🍎 */
              backgroundColor: 'rgba(28, 28, 30, 0.45)', 
              backdropFilter: 'blur(50px) saturate(210%) brightness(80%)',
              WebkitBackdropFilter: 'blur(50px) saturate(210%) brightness(80%)',
              zIndex: 1000000,
              transform: isInquiryOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.3)',
            }}
          >
            <button
              onClick={() => setIsInquiryOpen(false)}
              style={{
                position: 'absolute',
                top: '30px',
                left: '30px',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '14px',
                zIndex: 10
              }}
            >✕</button>
            
            <div className="drawer-scroll-container" style={{ flex: 1, overflowY: 'auto', padding: '100px 40px 40px', boxSizing: 'border-box' }}>
              <h2 style={{ fontSize: '42px', fontWeight: 700, margin: '0 0 12px 0', letterSpacing: '-1.5px' }}>
                {lang === 'zh' ? '开启咨询' : 'Get Quote'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '17px', lineHeight: 1.4, marginBottom: '40px' }}>
                {lang === 'zh' ? '留下您的联系方式，我们将提供正式报价。' : 'Leave contact for official quote.'}
              </p>

              <form
                onSubmit={handleInquirySubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="client-name-final" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                    {lang === 'zh' ? '您的姓名' : 'Full Name'}
                  </label>
                  <input name="Name" id="client-name-final" placeholder={lang === 'zh' ? '您的姓名' : 'Full Name'} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', color: '#fff', fontSize: '16px', outline: 'none' }} required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="client-email-final" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                    {lang === 'zh' ? '企业邮箱' : 'Business Email'}
                  </label>
                  <input name="Email" id="client-email-final" type="email" placeholder={lang === 'zh' ? '企业邮箱' : 'Business Email'} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', color: '#fff', fontSize: '16px', outline: 'none' }} required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="client-industry-final" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                    {lang === 'zh' ? '所属行业' : 'Industry'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select name="Industry" id="client-industry-final" required style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', color: '#fff', fontSize: '16px', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                      <option value="" disabled selected>{lang === 'zh' ? '所属行业' : 'Industry'}</option>
                      {industries.map((item) => (<option key={item} value={item} style={{ background: '#1c1c1e' }}>{item}</option>))}
                    </select>
                    <span style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none', fontSize: '12px' }}>▼</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="client-body-final" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                    {lang === 'zh' ? '项目简述' : 'Message'}
                  </label>
                  <textarea name="Body" id="client-body-final" placeholder={lang === 'zh' ? '项目简述...' : 'Message...'} rows={6} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', color: '#fff', fontSize: '16px', outline: 'none', resize: 'none' }} required />
                </div>

                <div style={{ paddingBottom: '60px' }}>
                  <button type="submit" style={{ background: '#0071e3', color: '#fff', border: 'none', borderRadius: '16px', padding: '20px', width: '100%', fontSize: '18px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,113,227,0.3)' }}>
                    {lang === 'zh' ? '生成咨询邮件' : 'Generate Email'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </InquiryContext.Provider>

        <style jsx global>{`
          :root { --nav-h: 44px; --apple-w: 1024px; --z-nav: 9999; --z-ui: 10001; --bg-grey: #f5f5f7; }
          body { font-family: -apple-system, sans-serif; margin: 0; overflow-x: hidden; }
          .nav-container { width: 100%; max-width: var(--apple-w); margin: 0 auto; padding: 0 22px; display: flex; justify-content: space-between; align-items: center; height: 100%; box-sizing: border-box; }
          .apple-nav { position: fixed; top: 0; left: 0; width: 100%; height: var(--nav-h); background: rgba(251,251,253,0.8); backdrop-filter: saturate(180%) blur(20px); z-index: var(--z-nav); border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.3s; }
          .apple-nav.is-dark { background: rgba(22, 22, 23, 0.8); color: #f5f5f7; }
          .apple-nav.search-mode { background: #fff !important; }
          .apple-nav.is-dark.search-mode { background: #161617 !important; }
          .logo-box { cursor: pointer; display: flex; align-items: center; z-index: var(--z-ui); }
          .logo-stroke-fix { stroke: #fff; }
          .is-dark .logo-stroke-fix { stroke: #161617; }
          .desktop-links-group { display: flex !important; flex: 1; justify-content: center; gap: 35px; font-size: 12px; align-items: center; z-index: var(--z-ui); }
          .desktop-links-group span { cursor: pointer; opacity: 0.8; transition: 0.2s; white-space: nowrap; }
          .pc-search-trigger { cursor: pointer; opacity: 0.7; padding: 5px; display: flex; align-items: center; }
          .action-area { display: flex; align-items: center; gap: 20px; z-index: var(--z-ui); }
          .lang-pc-switch { display: block; background: none; border: 1px solid #d2d2d7; color: inherit; padding: 2px 10px; border-radius: 12px; font-size: 11px; cursor: pointer; }
          .is-dark .lang-pc-switch { border-color: #424245; }
          .mobile-utility { display: none; align-items: center; gap: 15px; }
          .mega-menu-hard-layer { position: absolute; top: var(--nav-h); left: 0; width: 100%; background: #fbfbfd; height: 320px; border-bottom: 1px solid #d2d2d7; z-index: 9998; animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
          .mega-menu-hard-layer.is-dark { background: #161617; border-bottom-color: #424245; color: #f5f5f7; }
          @keyframes slideDown { from { height: 0; opacity: 0; } to { height: 320px; opacity: 1; } }
          .menu-inner { align-items: flex-start !important; padding-top: 40px !important; }
          .menu-label { font-size: 12px; color: #6e6e73; margin-bottom: 15px; }
          .menu-col li { font-size: 24px; font-weight: 600; margin-bottom: 8px; cursor: pointer; list-style: none; }
          .search-panel-layer { position: absolute; top: 0; left: 0; width: 100%; height: 0; background: #fff; overflow: hidden; transition: 0.4s; z-index: 10000; visibility: hidden; }
          .search-panel-layer.is-dark { background: #161617 !important; color: #f5f5f7; }
          .search-panel-layer.active { height: 450px; border-bottom: 1px solid #d2d2d7; visibility: visible; }
          .search-inner { padding-top: 60px !important; flex-direction: column !important; align-items: flex-start !important; }
          .search-bar { display: flex; align-items: center; gap: 15px; width: 100%; border-bottom: 1px solid #d2d2d7; padding-bottom: 8px; }
          .search-bar input { flex: 1; border: none; outline: none; background: transparent; font-size: 24px; font-weight: 600; color: currentColor; }
          .search-results-box { margin-top: 30px; width: 100%; }
          .s-item { padding: 10px 0; font-size: 14px; cursor: pointer; color: #06c; }
          .apple-footer-wrapper { background: var(--bg-grey); color: #6e6e73; padding: 40px 0; transition: background 0.3s; border-top: 1px solid #d2d2d7; }
          .apple-footer-wrapper.is-dark { background: #000; border-top-color: #333; color: #86868b; }
          .footer-content-stack { flex-direction: column !important; align-items: stretch !important; height: auto !important; }
          .footnotes { font-size: 11px; line-height: 1.6; border-bottom: 1px solid #d2d2d7; padding-bottom: 20px; margin-bottom: 20px; }
          .apple-footer-wrapper.is-dark .footnotes { border-bottom-color: #333; }
          .fn-list { padding: 0; list-style: none; margin: 0; }
          .fn-item { margin-bottom: 10px; }
          .footer-nav { width: 100%; }
          .footer-grid { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
          .f-col h4 { font-size: 12px; color: #1d1d1f; margin-bottom: 10px; font-weight: 600; cursor: default; }
          .apple-footer-wrapper.is-dark .f-col h4 { color: #f5f5f7; }
          .f-list { display: flex; flex-direction: column; gap: 8px; font-size: 12px; }
          .f-list span { cursor: pointer; display: block; }
          .f-list span:hover { text-decoration: underline; }
          .f-bottom { border-top: 1px solid #d2d2d7; padding-top: 20px; margin-top: 20px; font-size: 11px; }
          .apple-footer-wrapper.is-dark .f-bottom { border-top-color: #333; }
          .nav-mask-master { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 9997; backdrop-filter: blur(4px); }
          @media (max-width: 734px) {
            .desktop-links-group, .lang-pc-switch { display: none !important; }
            .mobile-utility { display: flex; }
            .lang-cap-pill { font-size: 10px; font-weight: bold; border: 1.5px solid currentColor; padding: 1px 4px; border-radius: 4px; cursor: pointer; }
            .hamburger { display: flex; flex-direction: column; gap: 6px; cursor: pointer; width: 18px; position: relative; z-index: 10002; }
            .line { width: 100%; height: 1.2px; background: currentColor; transition: 0.3s; }
            .hamburger.active .line:nth-child(1) { transform: translateY(3.5px) rotate(45deg); }
            .hamburger.active .line:nth-child(2) { transform: translateY(-3.5px) rotate(-45deg); }
            .mobile-overlay-fixed { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: #fff; z-index: 999; padding-top: var(--nav-h); overflow-y: auto; }
            .mobile-overlay-fixed.is-dark { background: #000; color: #f5f5f7; }
            .mobile-col { flex-direction: column; align-items: stretch !important; padding: 30px 40px !important; }
            .m-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(0,0,0,0.1); font-size: 28px; font-weight: 600; cursor: pointer; }
            .is-dark .m-row { border-bottom-color: #333; }
            .footer-grid { flex-direction: column; gap: 0; }
            .f-col { border-bottom: 1px solid #d2d2d7; width: 100%; box-sizing: border-box; }
            .apple-footer-wrapper.is-dark .f-col { border-bottom-color: #333; }
            .f-col h4 { padding: 12px 0; margin: 0; cursor: pointer; display: flex; justify-content: space-between; font-weight: 400; }
            .f-chevron-apple { display: block; width: 8px; height: 8px; border-right: 1px solid currentColor; border-bottom: 1px solid currentColor; transform: rotate(45deg); transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0.6; }
            .f-col.is-open .f-chevron-apple { transform: rotate(-135deg); }
            .f-list { max-height: 0; overflow: hidden; opacity: 0; transition: max-height 0.2s ease-out, opacity 0.1s; padding-bottom: 0; }
            .f-col.is-open .f-list { max-height: 400px; opacity: 1; transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s; padding-bottom: 15px; }
            
            /* 🍎 移动端表单垂直排列锁定 🍎 */
            .drawer-form { display: flex !important; flex-direction: column !important; }
            .exclusive-final-drawer { max-width: 100% !important; }
          }
        `}</style>
      </body>
    </html>
  );
}