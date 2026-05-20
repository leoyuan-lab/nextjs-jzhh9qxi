/** GA4 + marketing tags — respect cookie consent (Consent Mode v2). */

import { analyticsAllowed, readStoredConsent, type StoredConsent } from '@/lib/consent';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    lintrk?: (a: string, b: Record<string, unknown>) => void;
    _linkedin_data_partner_ids?: string[];
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;

let marketingScriptsLoaded = false;

function ensureGtagStub() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  }
}

/** Call before any config/event — runs on every page load. */
export function initConsentDefaults() {
  if (typeof window === 'undefined') return;
  ensureGtagStub();
  window.gtag?.('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  });
}

export function applyConsentToTags(consent: StoredConsent | null) {
  if (typeof window === 'undefined') return;
  const granted = analyticsAllowed(consent);
  ensureGtagStub();
  window.gtag?.('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
  });
  if (granted) loadMarketingScripts();
}

function loadMarketingScripts() {
  if (typeof document === 'undefined' || marketingScriptsLoaded) return;
  marketingScriptsLoaded = true;

  if (GA_ID) {
    const existing = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`);
    if (!existing) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(s);
    }
    window.gtag?.('js', new Date());
    window.gtag?.('config', GA_ID, { send_page_view: true });
  }

  if (LINKEDIN_PARTNER_ID) {
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    if (!window._linkedin_data_partner_ids.includes(LINKEDIN_PARTNER_ID)) {
      window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);
    }
    const existing = document.querySelector('script[data-roooll-linkedin]');
    if (!existing) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
      s.setAttribute('data-roooll-linkedin', '1');
      document.head.appendChild(s);
    }
  }
}

export function syncConsentFromStorage() {
  applyConsentToTags(readStoredConsent());
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === 'undefined') return;
  if (!analyticsAllowed(readStoredConsent())) return;
  if (typeof window.gtag !== 'function' || !GA_ID) return;
  window.gtag('event', name, params);
}

export function trackCtaClick(
  ctaId: string,
  extra?: Record<string, string | number | boolean | undefined>,
) {
  trackEvent('cta_click', {
    cta_id: ctaId,
    page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    ...extra,
  });
}

export function trackPageView(pathname: string) {
  if (!GA_ID || typeof window.gtag !== 'function') return;
  if (!analyticsAllowed(readStoredConsent())) return;
  window.gtag('config', GA_ID, { page_path: pathname });
}
