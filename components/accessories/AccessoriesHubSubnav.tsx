'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ACCESSORIES_HUB_TOP_ID,
  ACCESSORY_LANE_ORDER,
  accessoryHubPreviewLanes,
  accessoryLaneHref,
  accessoryLaneSectionId,
  type AccessoryLaneId,
} from '@/lib/accessories-catalog';
import {
  PIN_SHELL_OFF_PX,
  PIN_SHELL_ON_PX,
  preserveScrollOnLayoutShift,
} from '@/lib/pinned-shell-scroll';
import { useSiteLang } from '@/lib/site-lang-context';

const LOCALE_PREFIX_RE = /^\/(zh|en)(\/|$)/;
const SCROLL_OFFSET_UNPINNED_PX = 96;
const SCROLL_OFFSET_PINNED_EXTRA_PX = 8;
const PROGRAMMATIC_SCROLL_MS = 900;

function programmaticScrollDurationMs(): number {
  return scrollBehavior() === 'auto' ? 120 : PROGRAMMATIC_SCROLL_MS;
}

function stripLocalePrefix(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  if (!LOCALE_PREFIX_RE.test(pathname)) return pathname;
  const next = pathname.replace(LOCALE_PREFIX_RE, '/');
  return next || '/';
}

type SubnavCopy = {
  overview: string;
  subnavAria: string;
  lanes: Record<AccessoryLaneId, { title: string }>;
};

type ActiveId = typeof ACCESSORIES_HUB_TOP_ID | AccessoryLaneId;

function scrollBehavior(): ScrollBehavior {
  if (typeof window === 'undefined') return 'auto';
  if (window.matchMedia('(max-width: 767px)').matches) return 'auto';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'auto';
  return 'smooth';
}

function scrollToSection(id: string, offsetPx: number) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offsetPx;
  window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior() });
  window.history.replaceState(null, '', `#${id}`);
}

function subnavItemHref(lane: ActiveId, variant: 'hub' | 'spoke'): string {
  if (lane === ACCESSORIES_HUB_TOP_ID) return '/accessories';
  if (variant === 'hub') return `/accessories#${accessoryLaneSectionId(lane)}`;
  return accessoryLaneHref(lane);
}

function emitMainNavProgress(progress: number, instant = false) {
  window.dispatchEvent(
    new CustomEvent('roooll-main-nav-progress', {
      detail: { progress: Math.max(0, Math.min(1, progress)), instant },
    }),
  );
}

function syncAccessoriesSubnavPinnedDataset(pinned: boolean) {
  if (pinned) {
    document.documentElement.dataset.accessoriesSubnavPinned = 'true';
  } else {
    delete document.documentElement.dataset.accessoriesSubnavPinned;
  }
}

function activeIdFromSectionDomId(sectionId: string): ActiveId {
  if (sectionId === ACCESSORIES_HUB_TOP_ID) return ACCESSORIES_HUB_TOP_ID;
  const lane = ACCESSORY_LANE_ORDER.find((item) => accessoryLaneSectionId(item) === sectionId);
  return lane ?? ACCESSORIES_HUB_TOP_ID;
}

export function AccessoriesHubSubnav({
  copy,
  current,
  variant = 'spoke',
}: {
  copy: SubnavCopy;
  current?: ActiveId;
  variant?: 'hub' | 'spoke';
}) {
  const lang = useSiteLang();
  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const pathname = stripLocalePrefix(usePathname() ?? '/');
  const isHub = pathname === '/accessories';
  const resolvedVariant = isHub ? 'hub' : variant;
  const spokeLane = pathname.startsWith('/accessories/')
    ? (pathname.replace('/accessories/', '') as AccessoryLaneId)
    : null;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(false);
  const programmaticScrollUntilRef = useRef(0);
  const activeIdRef = useRef<ActiveId>(ACCESSORIES_HUB_TOP_ID);
  const syncPinRef = useRef<(() => void) | null>(null);

  const [pinned, setPinned] = useState(false);
  const [activeId, setActiveId] = useState<ActiveId>(
    current ?? spokeLane ?? ACCESSORIES_HUB_TOP_ID,
  );

  activeIdRef.current = activeId;
  pinnedRef.current = pinned;

  const hubSectionIds = useMemo(
    () => [
      ACCESSORIES_HUB_TOP_ID,
      ...accessoryHubPreviewLanes().map((lane) => accessoryLaneSectionId(lane)),
    ],
    [],
  );

  const pinnedScrollOffsetPx = useCallback((): number => {
    const spacerH = spacerRef.current?.offsetHeight ?? 0;
    return spacerH > 0
      ? spacerH + SCROLL_OFFSET_PINNED_EXTRA_PX
      : SCROLL_OFFSET_UNPINNED_PX;
  }, []);

  const localizeHref = useCallback(
    (path: string) => {
      if (path.startsWith('#')) return path;
      const [pathnamePart, hash] = path.split('#');
      const normalized = pathnamePart.startsWith('/') ? pathnamePart : `/${pathnamePart}`;
      const localized = `/${safeLang}${normalized === '/' ? '' : normalized}`;
      return hash ? `${localized}#${hash}` : localized;
    },
    [safeLang],
  );

  const navItems = useMemo(
    () => [
      {
        id: ACCESSORIES_HUB_TOP_ID as ActiveId,
        label: copy.overview,
        href: subnavItemHref(ACCESSORIES_HUB_TOP_ID, resolvedVariant),
      },
      ...ACCESSORY_LANE_ORDER.map((lane) => ({
        id: lane as ActiveId,
        label: copy.lanes[lane].title,
        href: subnavItemHref(lane, resolvedVariant),
      })),
    ],
    [copy, resolvedVariant],
  );

  const setPinnedWithNav = useCallback((nextPinned: boolean, options?: { instant?: boolean }) => {
    if (pinnedRef.current === nextPinned) return;
    preserveScrollOnLayoutShift(sentinelRef.current, () => {
      pinnedRef.current = nextPinned;
      flushSync(() => {
        setPinned(nextPinned);
      });
    });
    emitMainNavProgress(nextPinned ? 1 : 0, options?.instant ?? false);
    syncAccessoriesSubnavPinnedDataset(nextPinned);
  }, []);

  const syncPinnedFromSentinel = useCallback(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const top = sentinel.getBoundingClientRect().top;
    if (!pinnedRef.current && top <= PIN_SHELL_ON_PX) {
      setPinnedWithNav(true);
      return;
    }
    if (pinnedRef.current && top > PIN_SHELL_OFF_PX) {
      setPinnedWithNav(false);
    }
  }, [setPinnedWithNav]);

  syncPinRef.current = syncPinnedFromSentinel;

  const resolveActiveFromScroll = useCallback(
    (offsetPx: number): ActiveId => {
      let next: ActiveId = ACCESSORIES_HUB_TOP_ID;
      for (const sectionId of hubSectionIds) {
        const el = document.getElementById(sectionId);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offsetPx + 12) {
          next = activeIdFromSectionDomId(sectionId);
        }
      }
      return next;
    },
    [hubSectionIds],
  );

  const beginProgrammaticScroll = useCallback(() => {
    programmaticScrollUntilRef.current = Date.now() + programmaticScrollDurationMs();
  }, []);

  const endProgrammaticScroll = useCallback(() => {
    programmaticScrollUntilRef.current = 0;
    syncPinRef.current?.();
    if (!current && !spokeLane && isHub) {
      const offset = pinnedRef.current ? pinnedScrollOffsetPx() : SCROLL_OFFSET_UNPINNED_PX;
      const next = resolveActiveFromScroll(offset);
      if (next !== activeIdRef.current) setActiveId(next);
    }
  }, [current, isHub, pinnedScrollOffsetPx, resolveActiveFromScroll, spokeLane]);

  useEffect(() => {
    const tick = () => {
      if (Date.now() < programmaticScrollUntilRef.current) return;
      syncPinnedFromSentinel();
    };

    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    return () => {
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
    };
  }, [syncPinnedFromSentinel]);

  useEffect(() => {
    return () => {
      emitMainNavProgress(0);
      delete document.documentElement.dataset.accessoriesSubnavPinned;
    };
  }, []);

  useEffect(() => {
    if (current) {
      setActiveId(current);
      return;
    }
    if (spokeLane && ACCESSORY_LANE_ORDER.includes(spokeLane)) {
      setActiveId(spokeLane);
      return;
    }
    if (!isHub) return;

    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
      requestAnimationFrame(() => {
        beginProgrammaticScroll();
        const targetPinned = hash !== ACCESSORIES_HUB_TOP_ID;
        setActiveId(activeIdFromSectionDomId(hash));
        if (targetPinned) {
          setPinnedWithNav(true, { instant: true });
        } else {
          setPinnedWithNav(false, { instant: true });
        }
        requestAnimationFrame(() => {
          const offset = targetPinned ? pinnedScrollOffsetPx() : SCROLL_OFFSET_UNPINNED_PX;
          scrollToSection(hash, offset);
          window.setTimeout(endProgrammaticScroll, programmaticScrollDurationMs());
        });
      });
    }
  }, [beginProgrammaticScroll, current, endProgrammaticScroll, isHub, pinnedScrollOffsetPx, setPinnedWithNav, spokeLane]);

  useEffect(() => {
    if (current || spokeLane || !isHub) return;

    let rafId = 0;
    const onScroll = () => {
      if (Date.now() < programmaticScrollUntilRef.current) return;
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const offset = pinnedRef.current ? pinnedScrollOffsetPx() : SCROLL_OFFSET_UNPINNED_PX;
        const next = resolveActiveFromScroll(offset);
        if (next !== activeIdRef.current) setActiveId(next);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [current, isHub, pinnedScrollOffsetPx, resolveActiveFromScroll, spokeLane]);

  const scrollHubTo = useCallback(
    (targetId: string, id: ActiveId) => {
      beginProgrammaticScroll();
      setActiveId(id);
      activeIdRef.current = id;

      const targetPinned = targetId !== ACCESSORIES_HUB_TOP_ID;
      setPinnedWithNav(targetPinned, { instant: true });

      requestAnimationFrame(() => {
        const offset = targetPinned ? pinnedScrollOffsetPx() : SCROLL_OFFSET_UNPINNED_PX;
        scrollToSection(targetId, offset);
        window.setTimeout(endProgrammaticScroll, programmaticScrollDurationMs());
      });
    },
    [beginProgrammaticScroll, endProgrammaticScroll, pinnedScrollOffsetPx, setPinnedWithNav],
  );

  const onHubNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: ActiveId,
    href: string,
  ) => {
    if (resolvedVariant !== 'hub') return;

    if (id === ACCESSORIES_HUB_TOP_ID) {
      event.preventDefault();
      scrollHubTo(ACCESSORIES_HUB_TOP_ID, ACCESSORIES_HUB_TOP_ID);
      return;
    }

    if (!href.includes('#')) return;
    const hash = href.split('#')[1];
    if (!hash || !document.getElementById(hash)) return;
    event.preventDefault();
    scrollHubTo(hash, id);
  };

  return (
    <>
      <div ref={sentinelRef} className="accessories-hub-subnav-sentinel" aria-hidden />
      <div
        ref={spacerRef}
        className={`accessories-hub-subnav-spacer${pinned ? ' is-active' : ''}`}
        aria-hidden
      />
      <div
        ref={shellRef}
        className={pinned ? 'accessories-hub-subnav-shell is-pinned' : 'accessories-hub-subnav-shell'}
      >
        <nav className="accessories-hub-subnav" aria-label={copy.subnavAria}>
          <div className="accessories-hub-subnav-inner roooll-hscroll">
            {navItems.map((item) => {
              const resolvedHref = localizeHref(item.href);
              const isActive = activeId === item.id;
              return (
                <Link
                  key={item.id}
                  href={resolvedHref}
                  className={`accessories-hub-subnav-link${isActive ? ' is-active' : ''}`}
                  onClick={(event) => onHubNavClick(event, item.id, item.href)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
