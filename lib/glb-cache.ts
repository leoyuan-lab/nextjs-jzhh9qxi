'use client';

const inflight = new Map<string, Promise<void>>();
const linked = new Set<string>();

function ensurePreloadLink(url: string, highPriority: boolean) {
  if (linked.has(url)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'fetch';
  link.href = url;
  link.crossOrigin = 'anonymous';
  if (highPriority) {
    (link as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = 'high';
  }
  document.head.appendChild(link);
  linked.add(url);
}

export function preloadGlb(url: string, options?: { highPriority?: boolean }) {
  if (typeof window === 'undefined') return Promise.resolve();
  const highPriority = Boolean(options?.highPriority);
  ensurePreloadLink(url, highPriority);
  if (inflight.has(url)) return inflight.get(url)!;

  const task = fetch(url, { cache: 'force-cache' })
    .then(() => undefined)
    .catch(() => undefined);
  inflight.set(url, task);
  return task;
}
