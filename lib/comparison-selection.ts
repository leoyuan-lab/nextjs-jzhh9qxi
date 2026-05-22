import { variantIdFromPublicUrlToken, variantPublicSlug } from '@/lib/variant-public-slug';

/** Apple compare-style share param: `?modelList=r-lite,r-core,r-max-16` */
export const COMPARE_MODEL_LIST_PARAM = 'modelList';

export type CompareSlotIds = [string, string, string];

const DEFAULT_COMPARE_IDS: CompareSlotIds = ['fr3-std', 'fr5-std', 'fr16-std'];

function tokensToCompareSlotIds(
  tokens: readonly string[],
  lineupIds: readonly string[],
): CompareSlotIds | null {
  if (tokens.length !== 3) return null;
  const ids = tokens.map((token) => variantIdFromPublicUrlToken(token)) as CompareSlotIds;
  const ok = (id: string | null) => typeof id === 'string' && id.length > 0 && lineupIds.includes(id);
  if (!ids.every(ok)) return null;
  if (new Set(ids).size !== 3) return null;
  return ids;
}

export function defaultCompareSlotIds(
  lineupIds: readonly string[],
  preferred: CompareSlotIds = DEFAULT_COMPARE_IDS,
): CompareSlotIds {
  const ok = (id: string) => lineupIds.includes(id);
  const a = ok(preferred[0]) ? preferred[0] : lineupIds[0] ?? '';
  const b =
    ok(preferred[1]) && preferred[1] !== a
      ? preferred[1]
      : lineupIds.find((id) => id !== a) ?? a;
  const c =
    ok(preferred[2]) && preferred[2] !== a && preferred[2] !== b
      ? preferred[2]
      : lineupIds.find((id) => id !== a && id !== b) ?? a;
  return [a, b, c];
}

export function compareIdsFromSearchParams(
  searchParams: URLSearchParams,
  lineupIds: readonly string[],
): CompareSlotIds | null {
  const modelList = searchParams.get(COMPARE_MODEL_LIST_PARAM)?.trim();
  if (!modelList) return null;
  const tokens = modelList.split(',').map((part) => part.trim()).filter(Boolean);
  return tokensToCompareSlotIds(tokens, lineupIds);
}

export function writeCompareIdsToUrl(ids: CompareSlotIds) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const slugs = ids.map((id) => variantPublicSlug(id)).join(',');
  // Literal commas (Apple-style), not `%2C` from URLSearchParams serialization.
  const next = `${url.pathname}?${COMPARE_MODEL_LIST_PARAM}=${slugs}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (current !== next) {
    window.history.replaceState(null, '', next);
  }
}
