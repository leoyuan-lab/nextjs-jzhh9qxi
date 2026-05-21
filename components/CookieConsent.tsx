'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CONSENT_STORAGE_KEY,
  CONSENT_UPDATED_EVENT,
  readStoredConsent,
  writeStoredConsent,
  type ConsentChoice,
} from '@/lib/consent';
import { applyConsentToTags, syncConsentFromStorage } from '@/lib/analytics';
import { liquidGlassToneForPath } from '@/lib/liquid-glass-route';
import { useSiteLang } from '@/lib/site-lang-context';
import enLocale from '@/locales/en.json';
import zhLocale from '@/locales/zh.json';

const LOCALE_PREFIX_RE = /^\/(zh|en)(\/|$)/;

/** URL prefix is canonical; context covers pre-navigation edge cases. */
function resolveConsentLang(pathname: string, contextLang: 'zh' | 'en'): 'zh' | 'en' {
  const match = pathname.match(LOCALE_PREFIX_RE);
  if (match?.[1] === 'en') return 'en';
  if (match?.[1] === 'zh') return 'zh';
  return contextLang;
}

export function CookieConsent() {
  const pathname = usePathname() ?? '/';
  const contextLang = useSiteLang();
  const lang = useMemo(() => resolveConsentLang(pathname, contextLang), [pathname, contextLang]);
  const glassTone = useMemo(() => liquidGlassToneForPath(pathname), [pathname]);
  const copy = lang === 'en' ? enLocale.chrome.cookieConsent : zhLocale.chrome.cookieConsent;
  const [visible, setVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const privacyHref = `/${lang}/legal/privacy`;

  const hideIfStored = useCallback(() => {
    setVisible(!readStoredConsent());
  }, []);

  useEffect(() => {
    hideIfStored();
    syncConsentFromStorage();
    const onUpdate = () => hideIfStored();
    const onMobileMenu = (event: Event) => {
      setMobileMenuOpen(Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open));
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onUpdate);
    window.addEventListener('roooll-mobile-menu', onMobileMenu);
    return () => {
      window.removeEventListener(CONSENT_UPDATED_EVENT, onUpdate);
      window.removeEventListener('roooll-mobile-menu', onMobileMenu);
    };
  }, [hideIfStored]);

  const commit = (choice: ConsentChoice) => {
    const stored = writeStoredConsent(choice);
    applyConsentToTags(stored);
    setVisible(false);
  };

  if (!visible || mobileMenuOpen) return null;

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      aria-live="polite"
    >
      <div
        className={`cookie-consent__glass roooll-liquid-glass roooll-liquid-glass--${glassTone}`}
      >
        <p id="cookie-consent-desc" className="cookie-consent__text">
          <span id="cookie-consent-title" className="cookie-consent__sr-only">
            {copy.title}
          </span>
          {copy.body}{' '}
          <Link href={privacyHref} className="cookie-consent__link">
            {copy.privacyLink}
          </Link>
        </p>
        <div className="cookie-consent__actions">
          <button
            type="button"
            className="cookie-consent__btn"
            onClick={() => commit('essential')}
          >
            {copy.essentialOnly}
          </button>
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--primary"
            onClick={() => commit('all')}
          >
            {copy.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer control to reopen banner (does not revoke prior choice until user picks again). */
export function CookieSettingsButton({ label }: { label: string }) {
  const reopen = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT));
  };
  return (
    <button type="button" className="cookie-settings-btn" onClick={reopen}>
      {label}
    </button>
  );
}
