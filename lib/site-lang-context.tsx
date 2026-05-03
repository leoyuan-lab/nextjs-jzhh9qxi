'use client';

import { createContext, useContext } from 'react';

export const SiteLangContext = createContext<'zh' | 'en'>('zh');

export function useSiteLang() {
  return useContext(SiteLangContext);
}
