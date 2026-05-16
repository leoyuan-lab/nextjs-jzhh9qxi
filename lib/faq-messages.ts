import { getMessages, type AppLocale } from '@/lib/messages';

export const FAQ_ITEM_COUNT = 6;

export type FaqPair = {
  id: number;
  question: string;
  answer: string;
};

/** Reads `FAQ.items.q1` / `a1` … from locale JSON (no hardcoded copy in components). */
export function getFaqPairs(locale: AppLocale): FaqPair[] {
  const { items } = getMessages(locale).FAQ;
  const pairs: FaqPair[] = [];
  for (let i = 1; i <= FAQ_ITEM_COUNT; i += 1) {
    const question = items[`q${i}` as keyof typeof items];
    const answer = items[`a${i}` as keyof typeof items];
    if (question && answer) pairs.push({ id: i, question, answer });
  }
  return pairs;
}
