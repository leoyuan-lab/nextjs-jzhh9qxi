'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type AppLang = 'zh' | 'en';

type LangContextValue = {
  lang: AppLang;
  setLang: (next: AppLang) => void;
  toggleLang: () => void;
};

const LangContext = createContext<LangContextValue | null>(null);

const COOKIE = 'user-lang=';
const COOKIE_ATTRS = 'Path=/; Max-Age=31536000; SameSite=Lax';

function writeLangCookie(next: AppLang) {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE}${next}; ${COOKIE_ATTRS}`;
}

function persistLang(next: AppLang) {
  try {
    localStorage.setItem('user-lang', next);
  } catch {
    /* ignore */
  }
  writeLangCookie(next);
}

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: AppLang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<AppLang>(initialLang);

  const setLang = useCallback((next: AppLang) => {
    const safe: AppLang = next === 'en' ? 'en' : 'zh';
    setLangState(safe);
    persistLang(safe);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = safe;
    }
    window.dispatchEvent(new Event('langChange'));
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next: AppLang = prev === 'zh' ? 'en' : 'zh';
      persistLang(next);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = next;
      }
      queueMicrotask(() => window.dispatchEvent(new Event('langChange')));
      return next;
    });
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'user-lang' || !e.newValue) return;
      const next: AppLang = e.newValue === 'en' ? 'en' : 'zh';
      setLangState(next);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = next;
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, toggleLang }),
    [lang, setLang, toggleLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLanguage(): LangContextValue {
  const v = useContext(LangContext);
  if (!v) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return v;
}
