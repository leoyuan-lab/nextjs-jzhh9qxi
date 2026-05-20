'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  CONSENT_UPDATED_EVENT,
  readStoredConsent,
  writeStoredConsent,
  type ConsentChoice,
} from '@/lib/consent';
import { applyConsentToTags, syncConsentFromStorage } from '@/lib/analytics';
import { useSiteLang } from '@/lib/site-lang-context';
import enLocale from '@/locales/en.json';
import zhLocale from '@/locales/zh.json';

export function CookieConsent() {
  const lang = useSiteLang();
  const copy = lang === 'en' ? enLocale.chrome.cookieConsent : zhLocale.chrome.cookieConsent;
  const [visible, setVisible] = useState(false);
  const privacyHref = `/${lang}/legal/privacy`;

  const hideIfStored = useCallback(() => {
    setVisible(!readStoredConsent());
  }, []);

  useEffect(() => {
    hideIfStored();
    syncConsentFromStorage();
    const onUpdate = () => hideIfStored();
    window.addEventListener(CONSENT_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onUpdate);
  }, [hideIfStored]);

  const commit = (choice: ConsentChoice) => {
    const stored = writeStoredConsent(choice);
    applyConsentToTags(stored);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title" aria-live="polite">
      <div className="cookie-consent__panel">
        <h2 id="cookie-consent-title" className="cookie-consent__title">
          {copy.title}
        </h2>
        <p className="cookie-consent__body">{copy.body}</p>
        <p className="cookie-consent__legal">
          <Link href={privacyHref} className="cookie-consent__link">
            {copy.privacyLink}
          </Link>
        </p>
        <div className="cookie-consent__actions">
          <button type="button" className="cookie-consent__btn cookie-consent__btn--primary" onClick={() => commit('all')}>
            {copy.acceptAll}
          </button>
          <button type="button" className="cookie-consent__btn" onClick={() => commit('essential')}>
            {copy.essentialOnly}
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
    localStorage.removeItem('roooll-cookie-consent');
    window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT));
    window.location.reload();
  };
  return (
    <button type="button" className="cookie-settings-btn" onClick={reopen}>
      {label}
    </button>
  );
}
