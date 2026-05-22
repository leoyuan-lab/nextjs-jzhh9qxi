import { getMessages, type AppLocale } from '@/lib/messages';

export type FaqProductKey = 'r_lite' | 'r_ultra';

export type FaqPair = {
  id: number;
  question: string;
  answer: string;
};

function pairsFromItemRecord(items: Record<string, string>): FaqPair[] {
  const pairs: FaqPair[] = [];
  for (let i = 1; i <= 12; i += 1) {
    const question = items[`q${i}`];
    const answer = items[`a${i}`];
    if (question && answer) pairs.push({ id: i, question, answer });
  }
  return pairs;
}

export function getFaqSectionTitle(locale: AppLocale, productKey: FaqProductKey): string {
  const block = getMessages(locale)[productKey === 'r_lite' ? 'FAQ_r_lite' : 'FAQ_r_ultra'];
  return block.title;
}

export function getProductFaqPairs(locale: AppLocale, productKey: FaqProductKey): FaqPair[] {
  const block = getMessages(locale)[productKey === 'r_lite' ? 'FAQ_r_lite' : 'FAQ_r_ultra'];
  return pairsFromItemRecord(block.items as Record<string, string>);
}
