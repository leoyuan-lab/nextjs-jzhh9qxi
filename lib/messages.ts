/** Project-root-relative JSON (bundled at build); avoids alias resolution edge cases on serverless. */
import en from '../locales/en.json';
import zh from '../locales/zh.json';

export type AppLocale = 'zh' | 'en';

export function getMessages(locale: AppLocale) {
  return locale === 'en' ? en : zh;
}
