'use client';

import { GLB_MIME_TYPE, glbWarmupFetchInit } from '@/lib/glb-preload-constants';

const inflight = new Map<string, Promise<void>>();
const linked = new Set<string>();

function hasPreloadInDocument(url: string): boolean {
  if (typeof document === 'undefined') return false;
  const nodes = document.querySelectorAll('link[rel="preload"]');
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i]!.getAttribute('href') === url) return true;
  }
  return false;
}

function ensurePreloadLink(url: string, highPriority: boolean) {
  if (linked.has(url)) return;
  if (hasPreloadInDocument(url)) {
    linked.add(url);
    return;
  }
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'fetch';
  link.type = GLB_MIME_TYPE;
  link.setAttribute('type', GLB_MIME_TYPE);
  // Must precede `href`; matches `glbWarmupFetchInit()` / CORS for preload reuse.
  link.crossOrigin = 'anonymous';
  link.setAttribute('crossorigin', 'anonymous');
  if (highPriority) {
    (link as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = 'high';
  }
  link.href = url;
  document.head.appendChild(link);
  linked.add(url);
}

export function preloadGlb(url: string, options?: { highPriority?: boolean }) {
  if (typeof window === 'undefined') return Promise.resolve();
  const highPriority = Boolean(options?.highPriority);
  ensurePreloadLink(url, highPriority);
  if (inflight.has(url)) return inflight.get(url)!;

  const task = fetch(url, glbWarmupFetchInit())
    .then(() => undefined)
    .catch(() => undefined);
  inflight.set(url, task);
  return task;
}
