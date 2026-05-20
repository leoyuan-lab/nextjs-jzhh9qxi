'use client';
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  createContext,
} from 'react';
import { usePathname } from 'next/navigation';
import { rSeriesData } from '@/data/products';
import enLocale from '@/locales/en.json';
import zhLocale from '@/locales/zh.json';
import { SiteLangContext } from '@/lib/site-lang-context';
import { trackEvent } from '@/lib/analytics';

function navFamilyName(familyId: string) {
  return rSeriesData.find((f) => f.id === familyId)?.displayName ?? familyId;
}

function parseColorToRgba(color: string): [number, number, number, number] | null {
  const nums = color.match(/[\d.]+/g);
  if (!nums || nums.length < 3) return null;
  const [r, g, b, a] = nums.map(Number);
  return [r, g, b, Number.isFinite(a) ? a : 1];
}

/** Same rule as former rAF tone detect: sample pixel under nav, walk to opaque bg, luma < 150 → dark nav. */
function computeHomeNavDarkFromUnderNav(): boolean {
  const sampleY = 88;
  const sampleX = Math.floor(window.innerWidth / 2);
  const target = document.elementFromPoint(sampleX, sampleY) as HTMLElement | null;

  let node: HTMLElement | null = target;
  let bgColor = 'rgb(255, 255, 255)';
  while (node && node !== document.body) {
    const candidate = window.getComputedStyle(node).backgroundColor;
    const parsed = parseColorToRgba(candidate);
    if (parsed && parsed[3] > 0.03) {
      bgColor = candidate;
      break;
    }
    node = node.parentElement;
  }
  if (!node) bgColor = window.getComputedStyle(document.body).backgroundColor || bgColor;

  const rgba = parseColorToRgba(bgColor);
  if (!rgba) return false;
  const [r, g, b] = rgba;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma < 150;
}

// --- Roooll chrome: standard Context 接口 ---
const InquiryContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
});
type NavSubLink = { label: string; url: string };
type NavSection = { label: string; url: string; links: NavSubLink[] };

const ARM_NAV_PATHS = new Set(['/cobots/r-lite', '/cobots/r-ultra']);

const SELECTOR_NAV_PATHS = new Set(['/selector/advisor', '/selector/comparison']);

/** 与 `/cobots/r-lite` 相同：`main` 顶内边距为 0，首屏 3D 从视口顶铺满至透明导航下沿。 */
const ADVISOR_HERO_PEEK_PATH = '/selector/advisor';

/** Same chrome behavior as homepage (immersive hero, clear nav baseline). */
const HOME_CHROME_PATHS = new Set(['/']);
const LOCALE_PREFIX_RE = /^\/(zh|en)(\/|$)/;

function stripLocalePrefix(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  if (!LOCALE_PREFIX_RE.test(pathname)) return pathname;
  const next = pathname.replace(LOCALE_PREFIX_RE, '/');
  return next || '/';
}

function navSubLabel(link: NavSubLink | string): string {
  return typeof link === 'string' ? link : link.label;
}

function navSubUrl(section: NavSection, link: NavSubLink | string): string {
  return typeof link === 'string' ? section.url : link.url;
}

function followNavUrl(url: string, closeUi?: () => void) {
  if (url === '__inquiry__') {
    closeUi?.();
    window.dispatchEvent(
      new CustomEvent('roooll-inquiry-open', { detail: { source: 'nav' } }),
    );
    return;
  }
  /**
   * Safari dev 环境下，先执行一组 setState 再用 microtask 跳转，偶发会出现首击不导航。
   * 对真实页面跳转优先立即导航；UI 收拢交给页面卸载处理，避免需要点两次。
   */
  window.location.assign(url);
}

function isPrimaryPointerDown(event: React.MouseEvent<HTMLElement>) {
  return event.button === 0;
}

type MessagesFile = typeof zhLocale;

/** Main nav mega-menu + URLs; labels from `locales/*.json`. */
function buildNav(messages: MessagesFile): NavSection[] {
  const n = messages.nav;
  return [
    {
      label: n.cobots_section,
      url: '/',
      links: [
        { label: n.cobots.all_specs, url: '/cobots/all-cobots-specs' },
        { label: `${navFamilyName('r-lite')}${n.cobots.r_lite_suffix}`, url: '/cobots/r-lite' },
        { label: `${navFamilyName('r-ultra')}${n.cobots.r_ultra_suffix}`, url: '/cobots/r-ultra' },
        { label: n.cobots.humanoid, url: '/cobots/humanoid' },
      ],
    },
    {
      label: n.selector_section,
      url: '/',
      links: [
        { label: n.selector.comparison, url: '/selector/comparison' },
        { label: n.selector.advisor, url: '/selector/advisor' },
      ],
    },
    {
      label: n.applications_section,
      url: '/',
      links: [
        { label: n.applications.retail_service, url: '/applications/retail-service' },
        { label: n.applications.manufacturing, url: '/applications/manufacturing' },
        { label: n.applications.medical_lab, url: '/applications/medical-lab' },
        { label: n.applications.education, url: '/applications/education' },
      ],
    },
    {
      label: n.support_section,
      url: '/',
      links: [
        { label: n.support.resources, url: '/support/resources' },
        { label: n.support.service, url: '/support/service' },
      ],
    },
    {
      label: n.accessories_section,
      url: '/accessories',
      links: [{ label: n.accessories.catalog, url: '/accessories' }],
    },
    {
      label: n.about_section,
      url: '/',
      links: [
        { label: n.about.story, url: '/about/story' },
        { label: n.about.news, url: '/news' },
        { label: n.about.contact, url: '/contact' },
      ],
    },
  ];
}

// Roooll 主导航／页脚脚注／搜索占位：文案来自 locales/*.json（R 系列产品名仍由 navFamilyName 运行时拼接）。
const GLOBAL_CONFIG = {
  zh: {
    nav: buildNav(zhLocale),
    search: zhLocale.chrome.search,
    ui: zhLocale.chrome.ui,
    footnotes: zhLocale.footnotes,
    drawer: zhLocale.drawer,
    brandLogoAria: zhLocale.nav.brandLogoAria,
  },
  en: {
    nav: buildNav(enLocale),
    search: enLocale.chrome.search,
    ui: enLocale.chrome.ui,
    footnotes: enLocale.footnotes,
    drawer: enLocale.drawer,
    brandLogoAria: enLocale.nav.brandLogoAria,
  },
};

export default function ClientLayout({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: 'zh' | 'en';
}) {
  const pathname = usePathname();
  const logicalPathname = useMemo(() => stripLocalePrefix(pathname || '/'), [pathname]);
  const isHome = HOME_CHROME_PATHS.has(logicalPathname);
  const isArm = ARM_NAV_PATHS.has(logicalPathname);
  const isSelector = SELECTOR_NAV_PATHS.has(logicalPathname);
  const isAdvisorHeroPeek = logicalPathname === ADVISOR_HERO_PEEK_PATH;
  const [lang, setLang] = useState<'zh' | 'en'>(initialLang);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileExpandedApp, setMobileExpandedApp] = useState<string | null>(null);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [footerExpandedSection, setFooterExpandedSection] = useState<string | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryPrefillBody, setInquiryPrefillBody] = useState<string | undefined>(undefined);
  const [inquirySource, setInquirySource] = useState('unknown');
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [inquiryFormKey, setInquiryFormKey] = useState(0);
  const [isChildSubNavVisible, setIsChildSubNavVisible] = useState(false);
  const [mainNavScrollProgress, setMainNavScrollProgress] = useState(0);
  const [navToneOverride, setNavToneOverride] = useState<'dark' | 'light' | null>(null);
  const [isSelectorComparePinned, setIsSelectorComparePinned] = useState(false);
  const [sampledNavDark, setSampledNavDark] = useState<boolean | null>(null);
  /** True only at literal top of home — full clear bar; any scroll → whisper-glass (`home-ghost`). */
  const [homePinnedClear, setHomePinnedClear] = useState(true);
  const lastInquiryCloseAtRef = React.useRef(0);
  const mobileToggleLockRef = React.useRef(false);
  const mobileToggleUnlockTimerRef = React.useRef<number | null>(null);
  const mobileQueuedToggleRef = React.useRef(false);
  const mobileExpandedResetTimerRef = React.useRef<number | null>(null);

  /** `localStorage` may contain garbage; never index `GLOBAL_CONFIG` with a non-key. */
  const resolvedLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const config = useMemo(() => GLOBAL_CONFIG[resolvedLang], [resolvedLang]);
  const localizePath = React.useCallback(
    (url: string, targetLang: 'zh' | 'en' = resolvedLang) => {
      if (
        url === '__inquiry__' ||
        url.startsWith('mailto:') ||
        url.startsWith('tel:') ||
        url.startsWith('#') ||
        /^https?:\/\//.test(url)
      ) {
        return url;
      }
      const normalized = url.startsWith('/') ? url : `/${url}`;
      if (LOCALE_PREFIX_RE.test(normalized)) return normalized;
      return `/${targetLang}${normalized === '/' ? '/' : normalized}`;
    },
    [resolvedLang],
  );

  useLayoutEffect(() => {
    document.body.style.margin = '0';
    document.documentElement.style.width = '100%';
    document.body.style.width = '100%';
    /* `overflow-x: hidden` on html/body breaks `position: sticky` in the film scroll (r-lite / r-ultra). */
    const overflowX = isArm ? 'clip' : 'hidden';
    document.documentElement.style.overflowX = overflowX;
    document.body.style.overflowX = overflowX;
    document.body.style.backgroundColor =
      isHome
        ? 'transparent'
        : isArm
          ? '#000'
          : isDark
            ? '#000'
            : '#fff';
  }, [isArm, isDark, isHome, pathname]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', resolvedLang);
  }, [resolvedLang]);

  const handleInquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inquiryStatus === 'submitting') return;

    const formData = new FormData(e.currentTarget);
    const honeypot = String(formData.get('company') ?? '').trim();
    if (honeypot) return;

    const name = String(formData.get('Name') ?? '').trim();
    const email = String(formData.get('Email') ?? '').trim();
    const industry = String(formData.get('Industry') ?? '').trim();
    const msg = String(formData.get('Body') ?? '').trim();

    setInquiryStatus('submitting');

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          industry,
          body: msg,
          locale: resolvedLang,
          source: inquirySource,
          pagePath: logicalPathname,
        }),
      });

      if (!res.ok) {
        setInquiryStatus('error');
        return;
      }

      setInquiryStatus('success');
      trackEvent('inquiry_submit', {
        source: inquirySource,
        page_path: logicalPathname,
        locale: resolvedLang,
      });
    } catch {
      setInquiryStatus('error');
    }
  };

  const handleCloseInquiry = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    lastInquiryCloseAtRef.current = Date.now();
    const active = document.activeElement as HTMLElement | null;
    active?.blur?.();
    setIsInquiryOpen(false);
    window.setTimeout(() => {
      setInquiryPrefillBody(undefined);
      setInquiryStatus('idle');
      setInquirySource('unknown');
    }, 420);
  };

  useEffect(() => {
    const handleInquirySignal = (ev: Event) => {
      if (Date.now() - lastInquiryCloseAtRef.current < 360) return;
      const detail = (ev as CustomEvent<{ body?: string; source?: string }>).detail;
      if (detail && typeof detail.body === 'string') {
        setInquiryPrefillBody(detail.body);
      } else {
        setInquiryPrefillBody(undefined);
      }
      const source =
        detail && typeof detail.source === 'string' && detail.source.trim()
          ? detail.source.trim()
          : logicalPathname;
      setInquirySource(source);
      setInquiryStatus('idle');
      setInquiryFormKey((k) => k + 1);
      setIsInquiryOpen(true);
      trackEvent('inquiry_open', {
        source,
        page_path: logicalPathname,
        locale: resolvedLang,
      });
    };
    window.addEventListener('roooll-inquiry-open', handleInquirySignal as EventListener);
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
    const handleLangChange = () => {
      try {
        const next = localStorage.getItem('user-lang') === 'en' ? 'en' : 'zh';
        setLang(next);
        document.cookie = `user-lang=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
      } catch {
        setLang('zh');
      }
    };
    const handleSubNavVisibility = (event: Event) => {
      const customEvent = event as CustomEvent<{ visible?: boolean }>;
      setIsChildSubNavVisible(Boolean(customEvent.detail?.visible));
    };
    const handleNavTone = (event: Event) => {
      const customEvent = event as CustomEvent<{ tone?: 'dark' | 'light' | null }>;
      const tone = customEvent.detail?.tone;
      if (tone === 'dark' || tone === 'light') setNavToneOverride(tone);
      else setNavToneOverride(null);
    };
    const handleMainNavProgress = (event: Event) => {
      const customEvent = event as CustomEvent<{ progress?: number }>;
      const raw = customEvent.detail?.progress ?? 0;
      const clamped = Math.max(0, Math.min(1, raw));
      setMainNavScrollProgress(clamped);
    };
    const handleSelectorComparePin = (event: Event) => {
      const customEvent = event as CustomEvent<{ pinned?: boolean }>;
      setIsSelectorComparePinned(Boolean(customEvent.detail?.pinned));
    };
    window.addEventListener('langChange', handleLangChange);
    window.addEventListener('roooll-subnav-visibility', handleSubNavVisibility as EventListener);
    window.addEventListener('roooll-nav-tone', handleNavTone as EventListener);
    window.addEventListener('roooll-main-nav-progress', handleMainNavProgress as EventListener);
    window.addEventListener('selector-compare-sticky-pin', handleSelectorComparePin as EventListener);
    return () => {
      window.removeEventListener('langChange', handleLangChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('roooll-inquiry-open', handleInquirySignal as EventListener);
      window.removeEventListener('roooll-subnav-visibility', handleSubNavVisibility as EventListener);
      window.removeEventListener('roooll-nav-tone', handleNavTone as EventListener);
      window.removeEventListener('roooll-main-nav-progress', handleMainNavProgress as EventListener);
      window.removeEventListener('selector-compare-sticky-pin', handleSelectorComparePin as EventListener);
      clearInterval(themeTimer);
    };
  }, [logicalPathname, resolvedLang]);

  useLayoutEffect(() => {
    if (isHome || isArm || isSelector) {
      setIsChildSubNavVisible(false);
      setMainNavScrollProgress(0);
    }
    if (logicalPathname !== '/selector/comparison') {
      setIsSelectorComparePinned(false);
    }
  }, [logicalPathname, isArm, isHome, isSelector]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setMobileMenuVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setMobileMenuVisible(false), 620);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      if (mobileExpandedResetTimerRef.current) {
        window.clearTimeout(mobileExpandedResetTimerRef.current);
        mobileExpandedResetTimerRef.current = null;
      }
      return;
    }
    mobileExpandedResetTimerRef.current = window.setTimeout(() => {
      setMobileExpandedApp(null);
      mobileExpandedResetTimerRef.current = null;
    }, 620);
    return () => {
      if (mobileExpandedResetTimerRef.current) {
        window.clearTimeout(mobileExpandedResetTimerRef.current);
        mobileExpandedResetTimerRef.current = null;
      }
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    html.style.overscrollBehavior = 'none';

    const blockBackgroundTouchMove = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.mobile-overlay-fixed')) return;
      event.preventDefault();
    };
    const blockBackgroundWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.mobile-overlay-fixed')) return;
      event.preventDefault();
    };
    const blockBackgroundScrollKeys = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;
      if ([' ', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
      }
    };
    document.addEventListener('touchmove', blockBackgroundTouchMove, { passive: false });
    document.addEventListener('wheel', blockBackgroundWheel, { passive: false });
    document.addEventListener('keydown', blockBackgroundScrollKeys);

    return () => {
      document.removeEventListener('touchmove', blockBackgroundTouchMove);
      document.removeEventListener('wheel', blockBackgroundWheel);
      document.removeEventListener('keydown', blockBackgroundScrollKeys);
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
      html.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!HOME_CHROME_PATHS.has(logicalPathname)) {
      setSampledNavDark(null);
      return;
    }

    const isMobileViewport = window.matchMedia('(max-width: 734px)').matches;
    const HOME_NAV_TONE_SAMPLE_MIN_INTERVAL = isMobileViewport ? 240 : 120;
    const HOME_NAV_TONE_SAMPLE_MIN_SCROLL_DELTA = isMobileViewport ? 42 : 24;
    const HOME_NAV_TONE_ACTIVE_VIEWPORTS = isMobileViewport ? 2.7 : 2.35;
    let rafId: number | null = null;
    let lastToneSampleAt = 0;
    let lastToneSampleY = -1;
    const syncHomeScrollAndTone = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const y = window.scrollY;
        setHomePinnedClear(y < 2);
        const toneActiveMaxY = window.innerHeight * HOME_NAV_TONE_ACTIVE_VIEWPORTS;
        // Past hero zones, keep a stable light nav and stop expensive top hit-testing.
        if (y > toneActiveMaxY) {
          setSampledNavDark(false);
          return;
        }
        const now = performance.now();
        const shouldSampleByTime = now - lastToneSampleAt >= HOME_NAV_TONE_SAMPLE_MIN_INTERVAL;
        const shouldSampleByDistance = lastToneSampleY < 0 || Math.abs(y - lastToneSampleY) >= HOME_NAV_TONE_SAMPLE_MIN_SCROLL_DELTA;
        if (!shouldSampleByTime && !shouldSampleByDistance) return;
        lastToneSampleAt = now;
        lastToneSampleY = y;
        const nextDark = computeHomeNavDarkFromUnderNav();
        setSampledNavDark((prev) => (prev === nextDark ? prev : nextDark));
      });
    };

    syncHomeScrollAndTone();
    window.addEventListener('scroll', syncHomeScrollAndTone, { passive: true });
    window.addEventListener('resize', syncHomeScrollAndTone, { passive: true });
    window.visualViewport?.addEventListener('resize', syncHomeScrollAndTone);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', syncHomeScrollAndTone);
      window.removeEventListener('resize', syncHomeScrollAndTone);
      window.visualViewport?.removeEventListener('resize', syncHomeScrollAndTone);
    };
  }, [logicalPathname]);

  useEffect(() => {
    return () => {
      if (mobileToggleUnlockTimerRef.current) {
        window.clearTimeout(mobileToggleUnlockTimerRef.current);
      }
      if (mobileExpandedResetTimerRef.current) {
        window.clearTimeout(mobileExpandedResetTimerRef.current);
      }
    };
  }, []);

  const triggerMobileMenuToggle = React.useCallback(() => {
    mobileToggleLockRef.current = true;
    setShowSearch(false);
    setIsMobileMenuOpen((prev) => !prev);

    if (mobileToggleUnlockTimerRef.current) {
      window.clearTimeout(mobileToggleUnlockTimerRef.current);
    }
    mobileToggleUnlockTimerRef.current = window.setTimeout(() => {
      mobileToggleLockRef.current = false;
      if (mobileQueuedToggleRef.current) {
        mobileQueuedToggleRef.current = false;
        triggerMobileMenuToggle();
      }
    }, 680);
  }, []);

  /** r‑Core 黑底页：首帧即深色顶栏，避免 isDark 尚未采样时出现浅色「白条」再变黑 */
  const navIsDark =
    isHome
      ? (sampledNavDark ?? isDark)
      : isArm
        ? navToneOverride === 'light'
          ? false
          : true
        : navToneOverride
          ? navToneOverride === 'dark'
          : isDark;
  const subPageNavProgress = isHome ? 0 : Math.max(mainNavScrollProgress, isChildSubNavVisible ? 1 : 0);

  const searchConfig = useMemo(() => {
    const rawIndex: { name: string; url: string }[] = [];
    config.nav.forEach((item) => {
      rawIndex.push({ name: String(item.label), url: item.url });
      item.links.forEach((link) =>
        rawIndex.push({
          name: `${item.label} - ${navSubLabel(link)}`,
          url: navSubUrl(item, link),
        }),
      );
    });
    return { index: rawIndex, quickLinks: config.nav.slice(0, 3).map((i) => i.label), labels: config.search };
  }, [config]);

  const filteredResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return searchConfig.index.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 6);
  }, [searchQuery, searchConfig]);

  const toggleLang = () => {
    const newLang = resolvedLang === 'zh' ? 'en' : 'zh';
    try {
      localStorage.setItem('user-lang', newLang);
      document.cookie = `user-lang=${newLang}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {
      /* ignore */
    }
    setLang(newLang);
    window.dispatchEvent(new Event('langChange'));
    const targetPath = localizePath(logicalPathname, newLang);
    const query = window.location.search || '';
    const hash = window.location.hash || '';
    window.location.assign(`${targetPath}${query}${hash}`);
    setIsMobileMenuOpen(false);
  };

  const industries = config.drawer.industries;

  return (
    <>
      <SiteLangContext.Provider value={resolvedLang}>
        <InquiryContext.Provider value={{ isOpen: isInquiryOpen, open: () => setIsInquiryOpen(true), close: () => setIsInquiryOpen(false) }}>
          
          {(isMobileMenuOpen || showSearch || isInquiryOpen) && (
            <div className="nav-mask-master" onClick={() => { setActiveMenu(null); setIsMobileMenuOpen(false); setShowSearch(false); setIsInquiryOpen(false); setSearchQuery(''); }} />
          )}

          <nav
            className={`roooll-nav ${isHome ? 'is-home' : ''} ${navIsDark ? 'is-dark' : ''} ${showSearch ? 'search-mode' : ''} ${isHome && homePinnedClear ? 'home-clear' : ''} ${isHome && !homePinnedClear && !showSearch ? 'home-ghost' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}${isArm && !showSearch ? (subPageNavProgress < 0.02 ? ' arm-nav-top-clear' : ' arm-nav-scroll-glass') : ''}${isSelector && !showSearch ? (subPageNavProgress < 0.02 ? ' selector-nav-top-clear' : ' selector-nav-scroll-glass') : ''}`}
            style={
              isHome
                ? undefined
                : {
                    /* 选型页顶栏不随 progress 上滑隐藏，仅用 progress 切换透明 / 毛玻璃（与 r‑Core 首屏透底一致） */
                    transform: isSelector
                      ? logicalPathname === '/selector/comparison' && isSelectorComparePinned
                        ? 'translate3d(0, -104%, 0)'
                        : 'translate3d(0, 0, 0)'
                      : `translate3d(0, -${(subPageNavProgress * 104).toFixed(2)}%, 0)`,
                    opacity:
                      isSelector && logicalPathname === '/selector/comparison' && isSelectorComparePinned
                        ? 0
                        : isSelector
                          ? 1
                          : Math.max(0, 1 - subPageNavProgress),
                    pointerEvents:
                      isSelector && logicalPathname === '/selector/comparison' && isSelectorComparePinned
                        ? 'none'
                        : isSelector
                          ? 'auto'
                          : subPageNavProgress > 0.98
                            ? 'none'
                            : 'auto',
                    ...(isSelector
                      ? subPageNavProgress < 0.02
                        ? {
                            background: 'transparent',
                            borderBottom: '1px solid transparent',
                            backdropFilter: 'none',
                            WebkitBackdropFilter: 'none',
                            transition:
                              'background 0.28s ease, border-color 0.22s ease, backdrop-filter 0.28s ease, -webkit-backdrop-filter 0.28s ease',
                          }
                        : {
                            background: 'rgba(251, 251, 253, 0.76)',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                            backdropFilter: 'saturate(180%) blur(18px)',
                            WebkitBackdropFilter: 'saturate(180%) blur(18px)',
                            transition:
                              'background 0.28s ease, border-color 0.22s ease, backdrop-filter 0.28s ease, -webkit-backdrop-filter 0.28s ease',
                          }
                      : isArm
                        ? subPageNavProgress < 0.02
                          ? {
                              background: 'transparent',
                              borderBottom: '1px solid transparent',
                              backdropFilter: 'none',
                              WebkitBackdropFilter: 'none',
                              transition:
                                'background 0.38s ease, backdrop-filter 0.38s ease, -webkit-backdrop-filter 0.38s ease, border-color 0.38s ease',
                            }
                          : {
                              background: 'rgba(22, 22, 23, 0.34)',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                              backdropFilter: 'saturate(160%) blur(12px)',
                              WebkitBackdropFilter: 'saturate(160%) blur(12px)',
                              transition:
                                'background 0.38s ease, backdrop-filter 0.38s ease, -webkit-backdrop-filter 0.38s ease, border-color 0.38s ease',
                            }
                        : {
                            transition: 'background 0.3s',
                          }),
                  }
            }
          >
            <div className="nav-container">
              <div
                className="logo-box"
                onMouseDown={(event) => {
                  if (!isPrimaryPointerDown(event)) return;
                  event.preventDefault();
                  window.location.assign(localizePath('/'));
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    window.location.assign(localizePath('/'));
                  }
                }}
                tabIndex={0}
                role="link"
              >
                {/* Geometry matches `app/icon.svg` (favicon); keep both in sync if the mark changes. */}
                <svg width={26} height={26} viewBox="0 0 128 128" aria-label={config.brandLogoAria} role="img">
                  <circle cx="64" cy="66" r="34" fill="currentColor" />
                  <path d="M18 67C18 58 37 51 63 51C89 51 110 58 110 67C110 76 89 83 63 83C37 83 18 76 18 67Z" stroke="currentColor" strokeWidth="9" fill="none" strokeLinecap="round" />
                  <path d="M32 74C52 80 82 78 98 71" stroke="var(--logo-cutout)" strokeWidth="9" strokeLinecap="round" />
                </svg>
              </div>
              <div className="desktop-links-group">
                {config.nav.map((item) => (
                  <span
                    key={item.label}
                    onMouseEnter={() => {
                      setActiveMenu(item.label);
                      setShowSearch(false);
                    }}
                    onClick={() => {
                      setShowSearch(false);
                      /* 配置里一级 url 多为 '/'：在首页点文字会整页重载，误像「要点两次」。有子菜单时只开关 mega。 */
                      if (item.links.length > 0 && item.url === '/') {
                        setActiveMenu((prev) => (prev === item.label ? null : item.label));
                        return;
                      }
                      window.location.href = localizePath(item.url);
                    }}
                  >
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
                  <span
                    className="mobile-nav-search-hit"
                    onClick={() => {
                      setShowSearch(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 18 18"><path fill="currentColor" d="M17.766 16.66l-4.55-4.55C14.113 10.993 14.75 9.57 14.75 8 14.75 4.27 11.73 1.25 8 1.25S1.25 4.27 1.25 8 4.27 14.75 8 14.75c1.57 0 2.993-.637 4.11-1.534l4.55 4.55a.749.749 0 0 0 1.06 0 .75.75 0 0 0 0-1.06zM2.75 8c0-2.895 2.355-5.25 5.25-5.25 2.895 0 5.25 2.355 5.25 5.25s-2.355 5.25-5.25 5.25A5.256 5.256 0 0 1 2.75 8z"></path></svg>
                  </span>
                  <span className="lang-cap-pill" onClick={toggleLang}>{config.ui.mobileLang}</span>
                  <div
                    className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                      width: 18,
                      minWidth: 18,
                      flexShrink: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 10002,
                    }}
                    onClick={() => {
                      if (mobileToggleLockRef.current) {
                        mobileQueuedToggleRef.current = true;
                        return;
                      }
                      triggerMobileMenuToggle();
                    }}
                  >
                    <div
                      className="line"
                      style={{
                        width: '100%',
                        height: 1.5,
                        borderRadius: 999,
                        background: 'currentColor',
                        flexShrink: 0,
                        display: 'block',
                        transformOrigin: 'center',
                      }}
                    />
                    <div
                      className="line"
                      style={{
                        width: '100%',
                        height: 1.5,
                        borderRadius: 999,
                        background: 'currentColor',
                        flexShrink: 0,
                        display: 'block',
                        transformOrigin: 'center',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {activeMenu && (
              <div className={`mega-menu-hard-layer ${navIsDark ? 'is-dark' : ''}`} onMouseLeave={() => setActiveMenu(null)}>
                <div className="nav-container menu-inner">
                  <div className="menu-col">
                    <h4 className="menu-label">{config.ui.explore}</h4>
                    <ul>
                      {config.nav
                        .find((i) => i.label === activeMenu)
                        ?.links.map((link, idx) => (
                          <li
                            key={navSubLabel(link)}
                            style={{ ['--menu-item-index' as string]: idx } as React.CSSProperties}
                            onMouseDown={(event) => {
                              if (!isPrimaryPointerDown(event)) return;
                              event.preventDefault();
                              const section = config.nav.find((i) => i.label === activeMenu)!;
                              followNavUrl(localizePath(navSubUrl(section, link)), () => setActiveMenu(null));
                            }}
                          >
                            {navSubLabel(link)}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <div className={`search-panel-layer ${showSearch ? 'active' : ''} ${navIsDark ? 'is-dark' : ''}`}>
              <div className="nav-container search-inner">
                <div className="search-bar">
                  <span className="search-leading-icon">🔍</span>
                  <input
                    id="site-nav-search"
                    name="site_nav_search"
                    type="search"
                    placeholder={config.search.placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus={showSearch}
                    autoComplete="off"
                    enterKeyHint="search"
                  />
                  <button className="close-x" onClick={() => { setShowSearch(false); setSearchQuery(''); }} aria-label={config.search.closeAria}>✕</button>
                </div>
                <div className="search-results-box">
                  {searchQuery ? (
                    <div className="live-results">
                      {filteredResults.length > 0 ? filteredResults.map((res) => (
                          <div
                            key={res.name}
                            className="s-item"
                            onMouseDown={(event) => {
                              if (!isPrimaryPointerDown(event)) return;
                              event.preventDefault();
                              followNavUrl(localizePath(res.url), () => {
                                setShowSearch(false);
                                setSearchQuery('');
                              });
                            }}
                          >
                            {res.name}
                          </div>
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
          </nav>

          {mobileMenuVisible && (
            <div className={`mobile-overlay-fixed ${isMobileMenuOpen ? 'open' : 'closing'} ${navIsDark ? 'is-dark' : ''}`}>
              <div className="nav-container mobile-col">
                {config.nav.map((item, idx) => (
                  <div
                    key={item.label}
                    className={`m-sec ${mobileExpandedApp === item.label ? 'open' : ''}`}
                    style={{ ['--i' as string]: idx }}
                  >
                    <div className="m-row" onClick={() => setMobileExpandedApp(mobileExpandedApp === item.label ? null : item.label)}>
                      <span>{item.label}</span>
                    </div>
                    <div className="m-subs" aria-hidden={mobileExpandedApp !== item.label}>
                      {item.links.map((sub) => (
                        <div
                          key={navSubLabel(sub)}
                          className="m-sub-i"
                          onMouseDown={(event) => {
                            if (!isPrimaryPointerDown(event)) return;
                            event.preventDefault();
                            followNavUrl(localizePath(navSubUrl(item, sub)), () => setIsMobileMenuOpen(false));
                          }}
                        >
                          {navSubLabel(sub)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <main
            style={{
              position: 'relative',
              zIndex: 1,
              /* r‑Core、Advisor 首屏：顶对齐，3D 可从固定导航下沿透出（透明顶栏下无空带） */
              paddingTop: isHome || isArm || isAdvisorHeroPeek ? '0px' : '44px',
              minHeight: '80vh',
            }}
          >
            {children}
          </main>

          <div className={`roooll-footer-wrapper ${isDark ? 'is-dark' : ''}`}>
            <div className="nav-container footer-content-stack">
              <section className="footnotes">
                <h3 className="fn-title">{config.ui.footnotesTitle}</h3>
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
                      <h4 onClick={() => setFooterExpandedSection(footerExpandedSection === section.label ? null : section.label)}>{section.label}<span className="f-chevron-roooll"></span></h4>
                      <div className="f-list">
                        <div className="f-list-inner">
                          {section.links.map((link) => (
                            <span
                              key={navSubLabel(link)}
                              onMouseDown={(event) => {
                                if (!isPrimaryPointerDown(event)) return;
                                event.preventDefault();
                                followNavUrl(localizePath(navSubUrl(section, link)));
                              }}
                            >
                              {navSubLabel(link)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="f-bottom"><div className="copyright-line">{config.ui.copyright}</div></div>
              </footer>
            </div>
          </div>

          {/* Roooll：咨询抽屉 */}
          <div
            className={`exclusive-final-drawer ${isInquiryOpen ? 'open' : ''}`}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '480px',
              backgroundColor: 'rgba(28, 28, 30, 0.32)', 
              backdropFilter: 'blur(44px) saturate(185%) brightness(88%)',
              WebkitBackdropFilter: 'blur(44px) saturate(185%) brightness(88%)',
              zIndex: 1000000,
              transform: isInquiryOpen ? 'translate3d(0, 0, 0)' : 'translate3d(104%, 0, 0)',
              opacity: isInquiryOpen ? 1 : 0,
              transition: `transform 0.72s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.38s ease, visibility 0s linear ${isInquiryOpen ? '0s' : '0.72s'}`,
              visibility: isInquiryOpen ? 'visible' : 'hidden',
              pointerEvents: isInquiryOpen ? 'auto' : 'none',
              borderLeft: '1px solid rgba(255,255,255,0.1)', color: '#fff',
              display: 'flex', flexDirection: 'column', boxShadow: '-24px 0 80px rgba(0,0,0,0.34)',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={handleCloseInquiry}
              style={{
                position: 'absolute',
                top: 'max(env(safe-area-inset-top), 14px)',
                right: '18px',
                zIndex: 30,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '14px',
                opacity: isInquiryOpen ? 1 : 0,
                transform: isInquiryOpen ? 'translate3d(0,0,0)' : 'translate3d(10px,0,0)',
                transition: 'opacity 0.26s ease 0.12s, transform 0.52s cubic-bezier(0.22, 1, 0.36, 1) 0.12s',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              ✕
            </button>
            <div className="drawer-scroll-container" style={{
              flex: 1,
              overflowY: 'auto',
              padding: '88px 40px 40px',
              boxSizing: 'border-box',
              opacity: isInquiryOpen ? 1 : 0,
              transform: isInquiryOpen ? 'translate3d(0,0,0)' : 'translate3d(24px,0,0)',
              transition: 'opacity 0.32s ease 0.14s, transform 0.62s cubic-bezier(0.22, 1, 0.36, 1) 0.14s',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
            }}>
              <h2 style={{ fontSize: '42px', fontWeight: 700, margin: '0 0 12px 0', letterSpacing: '-1.5px' }}>{config.drawer.title}</h2>
              {inquiryStatus === 'success' ? (
                <div style={{ paddingBottom: '60px' }}>
                  <p style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 12px 0' }}>{config.drawer.successTitle}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', lineHeight: 1.5, margin: 0 }}>{config.drawer.successMessage}</p>
                </div>
              ) : (
                <>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '17px', lineHeight: 1.4, marginBottom: '40px' }}>{config.drawer.subtitle}</p>
                  <form key={inquiryFormKey} onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
                    <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label htmlFor="client-name-final" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>{config.drawer.nameLabel}</label><input name="Name" id="client-name-final" autoComplete="name" placeholder={config.drawer.namePlaceholder} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', color: '#fff', fontSize: '16px', outline: 'none' }} required disabled={inquiryStatus === 'submitting'} /></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label htmlFor="client-email-final" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>{config.drawer.emailLabel}</label><input name="Email" id="client-email-final" type="email" autoComplete="email" placeholder={config.drawer.emailPlaceholder} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', color: '#fff', fontSize: '16px', outline: 'none' }} required disabled={inquiryStatus === 'submitting'} /></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label htmlFor="client-industry-final" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>{config.drawer.industryLabel}</label><div style={{ position: 'relative' }}><select name="Industry" id="client-industry-final" autoComplete="off" required defaultValue="" disabled={inquiryStatus === 'submitting'} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', color: '#fff', fontSize: '16px', outline: 'none', appearance: 'none', cursor: 'pointer' }}><option value="" disabled>{config.drawer.industryPlaceholder}</option>{industries.map((item) => (<option key={item} value={item} style={{ background: '#1c1c1e' }}>{item}</option>))}</select><span style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none', fontSize: '12px' }}>▼</span></div></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label htmlFor="client-body-final" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>{config.drawer.bodyLabel}</label><textarea name="Body" id="client-body-final" key={`body-${inquiryFormKey}`} autoComplete="off" defaultValue={inquiryPrefillBody ?? ''} placeholder={config.drawer.bodyPlaceholder} rows={10} required disabled={inquiryStatus === 'submitting'} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', color: '#fff', fontSize: '16px', outline: 'none', resize: 'vertical', minHeight: '140px' }} /></div>
                    {inquiryStatus === 'error' ? (
                      <p role="alert" style={{ color: '#ff6b6b', fontSize: '14px', margin: 0 }}>{config.drawer.errorMessage}</p>
                    ) : null}
                    <div style={{ paddingBottom: '60px' }}><button type="submit" disabled={inquiryStatus === 'submitting'} style={{ background: '#0071e3', color: '#fff', border: 'none', borderRadius: '16px', padding: '20px', width: '100%', fontSize: '18px', fontWeight: 600, cursor: inquiryStatus === 'submitting' ? 'wait' : 'pointer', opacity: inquiryStatus === 'submitting' ? 0.7 : 1, boxShadow: '0 4px 15px rgba(0,113,227,0.3)' }}>{inquiryStatus === 'submitting' ? config.drawer.submitting : config.drawer.submit}</button></div>
                  </form>
                </>
              )}
            </div>
          </div>
        </InquiryContext.Provider>
      </SiteLangContext.Provider>

        <style jsx global>{`
          :root { --nav-h: 44px; --roooll-w: 1024px; --z-nav: 9999; --z-ui: 10001; --bg-grey: #f5f5f7; }
          html {
            background: transparent;
            min-height: 100%;
          }
          body { margin: 0; overflow-x: hidden; }
          .nav-container { width: 100%; max-width: var(--roooll-w); margin: 0 auto; padding: 0 22px; display: flex; justify-content: space-between; align-items: center; height: 100%; box-sizing: border-box; }
          .roooll-nav { position: fixed; top: 0; left: 0; width: 100%; height: var(--nav-h); background: rgba(251,251,253,0.2); backdrop-filter: saturate(135%) blur(8px); z-index: var(--z-nav); border-bottom: 1px solid rgba(0,0,0,0.012); transition: background 0.38s ease, backdrop-filter 0.38s ease, -webkit-backdrop-filter 0.38s ease, transform 0.78s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.42s ease, border-color 0.24s ease, color 0.32s ease; will-change: transform, opacity; transform: translate3d(0, 0, 0); backface-visibility: hidden; }
          .roooll-nav.slide-up { transform: translateY(-104%); opacity: 0; pointer-events: none; }
          .roooll-nav.is-dark { background: rgba(22, 22, 23, 0.16); color: #f5f5f7; border-bottom-color: rgba(255,255,255,0.02); }
          .roooll-nav.is-home:not(.search-mode) {
            border-bottom: none !important;
            box-shadow: none !important;
          }
          .roooll-nav.home-clear {
            background: transparent !important;
            border-bottom: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          .roooll-nav.home-ghost:not(.search-mode) {
            background: rgba(251, 251, 253, 0.026) !important;
            backdrop-filter: saturate(165%) blur(4px) !important;
            -webkit-backdrop-filter: saturate(165%) blur(4px) !important;
          }
          .roooll-nav.home-ghost.is-dark:not(.search-mode) {
            background: rgba(22, 22, 23, 0.038) !important;
            color: #f5f5f7;
            backdrop-filter: saturate(155%) blur(5px) !important;
            -webkit-backdrop-filter: saturate(155%) blur(5px) !important;
          }
          .roooll-nav.search-mode { background: #fff !important; border-bottom: 1px solid rgba(0,0,0,0.06) !important; }
          .roooll-nav { --logo-cutout: #ffffff; }
          .roooll-nav.is-dark { --logo-cutout: #161617; }
          /* Desktop-only (styled-jsx loads after globals.css; unscoped rules override max-width:734px) */
          @media (min-width: 735px) {
            .desktop-links-group { display: flex !important; flex: 1; justify-content: center; gap: 32px; font-size: 12px; align-items: center; z-index: var(--z-ui); min-width: 0; }
            .desktop-links-group span { cursor: pointer; opacity: 0.68; transition: opacity 0.2s ease; white-space: nowrap; }
            .desktop-links-group span:hover { opacity: 0.92; }
            .pc-search-trigger { cursor: pointer; opacity: 0.62; padding: 5px; display: flex; align-items: center; transition: opacity 0.2s ease; }
            .pc-search-trigger:hover { opacity: 0.9; }
            .lang-pc-switch {
              display: block;
              background: transparent;
              border: none;
              color: inherit;
              padding: 4px 10px;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 500;
              cursor: pointer;
              opacity: 0.86;
              transition: background 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
            }
            .lang-pc-switch:hover { background: rgba(0,0,0,0.08); opacity: 1; }
            .lang-pc-switch:focus-visible { outline: none; background: rgba(0,0,0,0.12); opacity: 1; }
            .is-dark .lang-pc-switch:hover { background: rgba(255,255,255,0.14); }
            .is-dark .lang-pc-switch:focus-visible { background: rgba(255,255,255,0.18); }
            .mobile-utility { display: none; align-items: center; gap: 15px; }
          }
          .mega-menu-hard-layer { position: absolute; top: var(--nav-h); left: 0; width: 100%; background: #fbfbfd; height: 320px; border-bottom: 1px solid #d2d2d7; z-index: 9998; animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
          .mega-menu-hard-layer.is-dark { background: #161617; border-bottom-color: #424245; color: #f5f5f7; }
          @keyframes slideDown { from { height: 0; opacity: 0; } to { height: 320px; opacity: 1; } }
          .menu-inner { align-items: flex-start !important; padding-top: 40px !important; }
          .menu-label { font-size: 12px; color: #6e6e73; margin-bottom: 15px; }
          .menu-col li {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            cursor: pointer;
            list-style: none;
            opacity: 0;
            transform: translateY(4px);
            animation: menuItemFadeIn 260ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            animation-delay: calc(var(--menu-item-index, 0) * 24ms + 24ms);
            transition: transform 180ms ease, opacity 180ms ease, color 180ms ease;
          }
          .menu-col li:hover { transform: translateY(0) translateX(1px); }
          @keyframes menuItemFadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .search-panel-layer { position: absolute; top: 0; left: 0; width: 100%; height: 0; background: rgba(251,251,253,0.96); backdrop-filter: saturate(180%) blur(26px); -webkit-backdrop-filter: saturate(180%) blur(26px); overflow: hidden; transition: height 0.36s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.24s ease; z-index: 10000; visibility: hidden; opacity: 0; border-bottom: 1px solid rgba(0,0,0,0.08); }
          .search-panel-layer.is-dark { background: rgba(22,22,23,0.92) !important; color: #f5f5f7; border-bottom-color: rgba(255,255,255,0.1); }
          .search-panel-layer.active { height: 460px; visibility: visible; opacity: 1; }
          .search-inner { padding-top: 54px !important; padding-bottom: 34px !important; flex-direction: column !important; align-items: flex-start !important; }
          .search-bar { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 56px; border: 1px solid rgba(0,0,0,0.08); border-radius: 14px; padding: 0 14px; box-sizing: border-box; background: rgba(255,255,255,0.72); box-shadow: 0 8px 30px rgba(0,0,0,0.06); overflow: hidden; }
          .search-panel-layer.is-dark .search-bar { background: rgba(45,45,48,0.75); border-color: rgba(255,255,255,0.12); box-shadow: none; }
          .search-leading-icon { font-size: 15px; opacity: 0.6; }
          .search-bar input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; color: currentColor; }
          .search-bar input::placeholder { color: rgba(110,110,115,0.85); }
          .search-panel-layer.is-dark .search-bar input::placeholder { color: rgba(174,174,178,0.85); }
          .close-x { border: none; background: rgba(0,0,0,0.08); color: inherit; width: 28px; min-width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; font-size: 14px; line-height: 1; opacity: 0.8; flex-shrink: 0; }
          .search-panel-layer.is-dark .close-x { background: rgba(255,255,255,0.14); }
          .search-results-box { margin-top: 24px; width: 100%; padding-bottom: 10px; }
          .s-section-title { margin: 0 0 10px 2px; font-size: 12px; letter-spacing: 0.02em; text-transform: uppercase; color: #6e6e73; font-weight: 600; }
          .search-panel-layer.is-dark .s-section-title { color: #a1a1a6; }
          .s-item { padding: 11px 12px; font-size: 15px; cursor: pointer; color: #1d1d1f; border-radius: 10px; transition: background 0.18s ease, transform 0.18s ease; }
          .s-item:hover { background: rgba(0,0,0,0.04); transform: translateX(2px); }
          .search-panel-layer.is-dark .s-item { color: #f5f5f7; }
          .search-panel-layer.is-dark .s-item:hover { background: rgba(255,255,255,0.08); }
          .s-no-results { margin: 4px 0 0 2px; font-size: 14px; color: #8e8e93; }
        `}</style>
    </>
  );
}