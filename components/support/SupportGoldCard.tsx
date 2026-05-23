'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

const SHIMMER_ANIMATION = 'support-card-shimmer-once 1.25s ease-out 1 forwards';

type SharedProps = {
  className?: string;
  children: ReactNode;
  badge?: string;
};

type ArticleGoldCardProps = SharedProps &
  Omit<ComponentPropsWithoutRef<'article'>, 'className' | 'children'>;

type LinkGoldCardProps = SharedProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, 'className' | 'children'> & {
    href: string;
  };

function useGoldCardShimmer() {
  const layerRef = useRef<HTMLSpanElement>(null);

  const replayShimmer = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const node = layerRef.current;
    if (!node) return;

    node.style.animation = 'none';
    void node.offsetWidth;
    node.style.animation = SHIMMER_ANIMATION;
  }, []);

  useEffect(() => {
    replayShimmer();
  }, [replayShimmer]);

  const shimmerLayer = (
    <span ref={layerRef} className="support-card-shimmer-layer" aria-hidden />
  );

  return { replayShimmer, shimmerLayer };
}

function GoldCardBadge({ badge }: { badge?: string }) {
  if (!badge) return null;
  return <span className="support-partner-badge support-partner-badge--on-gold">{badge}</span>;
}

export function SupportGoldCard({
  className,
  children,
  badge,
  onMouseEnter,
  ...rest
}: ArticleGoldCardProps) {
  const { replayShimmer, shimmerLayer } = useGoldCardShimmer();

  return (
    <article
      className={`support-card support-card--gold ${className ?? ''}`.trim()}
      onMouseEnter={(event) => {
        replayShimmer();
        onMouseEnter?.(event);
      }}
      {...rest}
    >
      {shimmerLayer}
      <div className="support-gold-card-inner">
        {badge ? (
          <div className="support-gold-card-badge-row">
            <GoldCardBadge badge={badge} />
          </div>
        ) : null}
        {children}
      </div>
    </article>
  );
}

export function SupportGoldCardLink({
  className,
  children,
  badge,
  onMouseEnter,
  href,
  ...rest
}: LinkGoldCardProps) {
  const { replayShimmer, shimmerLayer } = useGoldCardShimmer();

  return (
    <Link
      href={href}
      className={`support-card support-card--gold ${className ?? ''}`.trim()}
      onMouseEnter={(event) => {
        replayShimmer();
        onMouseEnter?.(event);
      }}
      {...rest}
    >
      {shimmerLayer}
      <div className="support-gold-card-inner">
        {badge ? (
          <div className="support-gold-card-badge-row">
            <GoldCardBadge badge={badge} />
          </div>
        ) : null}
        {children}
      </div>
    </Link>
  );
}
