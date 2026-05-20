/** Cookie / analytics consent — stored client-side only. */

export type ConsentChoice = 'all' | 'essential';

export type StoredConsent = {
  choice: ConsentChoice;
  /** ISO timestamp */
  updatedAt: string;
};

export const CONSENT_STORAGE_KEY = 'roooll-cookie-consent';
export const CONSENT_UPDATED_EVENT = 'roooll-consent-updated';

export function readStoredConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed?.choice !== 'all' && parsed?.choice !== 'essential') return null;
    if (typeof parsed.updatedAt !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredConsent(choice: ConsentChoice): StoredConsent {
  const next: StoredConsent = { choice, updatedAt: new Date().toISOString() };
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: next }));
  return next;
}

export function analyticsAllowed(consent: StoredConsent | null): boolean {
  return consent?.choice === 'all';
}
