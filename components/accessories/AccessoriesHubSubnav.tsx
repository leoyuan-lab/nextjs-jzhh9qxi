'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ACCESSORIES_HUB_TOP_ID,
  ACCESSORY_LANE_ORDER,
  accessoryHubPreviewLanes,
  accessoryLaneHref,
  accessoryLaneSectionId,
  type AccessoryLaneId,
} from '@/lib/accessories-catalog';
import { useSiteLang } from '@/lib/site-lang-context';

const LOCALE_PREFIX_RE = /^\/(zh|en)(\/|$)/;

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

const SCROLL_OFFSET_PX = 96;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  window.history.replaceState(null, '', `#${id}`);
}

function subnavItemHref(lane: ActiveId, variant: 'hub' | 'spoke'): string {
  if (lane === ACCESSORIES_HUB_TOP_ID) return '/accessories';
  if (variant === 'hub') return `/accessories#${accessoryLaneSectionId(lane)}`;
  return accessoryLaneHref(lane);
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

  const [activeId, setActiveId] = useState<ActiveId>(
    current ?? spokeLane ?? ACCESSORIES_HUB_TOP_ID,
  );

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
        scrollToSection(hash);
        const laneFromHash = ACCESSORY_LANE_ORDER.find(
          (lane) => accessoryLaneSectionId(lane) === hash,
        );
        setActiveId(laneFromHash ?? ACCESSORIES_HUB_TOP_ID);
      });
    }
  }, [current, isHub, spokeLane]);

  useEffect(() => {
    if (current || spokeLane || !isHub) return;

    const sectionIds = [
      ACCESSORIES_HUB_TOP_ID,
      ...accessoryHubPreviewLanes().map((lane) => accessoryLaneSectionId(lane)),
    ];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const next = visible[0]?.target.id;
        if (!next) return;
        if (next === ACCESSORIES_HUB_TOP_ID) {
          setActiveId(ACCESSORIES_HUB_TOP_ID);
          return;
        }
        const lane = ACCESSORY_LANE_ORDER.find((item) => accessoryLaneSectionId(item) === next);
        if (lane) setActiveId(lane);
      },
      {
        rootMargin: `-${SCROLL_OFFSET_PX}px 0px -52% 0px`,
        threshold: [0, 0.12, 0.35, 0.6],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [current, isHub, spokeLane]);

  const onHubHashClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: ActiveId,
    href: string,
  ) => {
    if (resolvedVariant !== 'hub' || !href.includes('#')) return;
    const hash = href.split('#')[1];
    if (!hash || !document.getElementById(hash)) return;
    event.preventDefault();
    scrollToSection(hash);
    setActiveId(id);
  };

  return (
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
              onClick={(event) => onHubHashClick(event, item.id, item.href)}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
