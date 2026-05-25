'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import {
  PIN_SHELL_OFF_PX,
  PIN_SHELL_ON_PX,
  preserveScrollOnLayoutShift,
} from '@/lib/pinned-shell-scroll';

function emitMainNavProgress(progress: number, instant = false) {
  window.dispatchEvent(
    new CustomEvent('roooll-main-nav-progress', {
      detail: { progress: Math.max(0, Math.min(1, progress)), instant },
    }),
  );
}

function syncNewsroomSubnavPinnedDataset(pinned: boolean) {
  if (pinned) {
    document.documentElement.dataset.newsroomSubnavPinned = 'true';
  } else {
    delete document.documentElement.dataset.newsroomSubnavPinned;
  }
}

export type NewsroomSubnavProps = {
  title: string;
  ariaLabel: string;
  newsroomHref: string;
  /** When true, title is the current page (not a link). */
  isIndex?: boolean;
};

export function NewsroomSubnav({
  title,
  ariaLabel,
  newsroomHref,
  isIndex = false,
}: NewsroomSubnavProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(false);
  const [pinned, setPinned] = useState(false);

  pinnedRef.current = pinned;

  const setPinnedWithNav = useCallback((nextPinned: boolean, options?: { instant?: boolean }) => {
    if (pinnedRef.current === nextPinned) return;
    preserveScrollOnLayoutShift(sentinelRef.current, () => {
      pinnedRef.current = nextPinned;
      flushSync(() => {
        setPinned(nextPinned);
      });
    });
    emitMainNavProgress(nextPinned ? 1 : 0, options?.instant ?? false);
    syncNewsroomSubnavPinnedDataset(nextPinned);
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

  useEffect(() => {
    syncPinnedFromSentinel();
    window.addEventListener('scroll', syncPinnedFromSentinel, { passive: true });
    window.addEventListener('resize', syncPinnedFromSentinel);
    return () => {
      window.removeEventListener('scroll', syncPinnedFromSentinel);
      window.removeEventListener('resize', syncPinnedFromSentinel);
    };
  }, [syncPinnedFromSentinel]);

  useEffect(() => {
    return () => {
      emitMainNavProgress(0);
      delete document.documentElement.dataset.newsroomSubnavPinned;
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="newsroom-subnav-sentinel" aria-hidden />
      <div
        ref={spacerRef}
        className={`newsroom-subnav-spacer${pinned ? ' is-active' : ''}`}
        aria-hidden
      />
      <div className={pinned ? 'newsroom-subnav-shell is-pinned' : 'newsroom-subnav-shell'}>
        <nav className="newsroom-subnav" aria-label={ariaLabel}>
          <div className="newsroom-subnav-inner">
            {isIndex ? (
              <span className="newsroom-subnav-title is-current" aria-current="page">
                {title}
              </span>
            ) : (
              <Link href={newsroomHref} className="newsroom-subnav-title">
                {title}
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
