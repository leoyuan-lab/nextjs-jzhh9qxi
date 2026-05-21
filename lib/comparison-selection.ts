export const COMPARE_QUERY_KEYS = ['c1', 'c2', 'c3'] as const;

export type CompareSlotIds = [string, string, string];

export function defaultCompareSlotIds(
  lineupIds: readonly string[],
  preferred: CompareSlotIds = ['fr3-std', 'fr5-std', 'fr16-std'],
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
  const ids = COMPARE_QUERY_KEYS.map((key) => searchParams.get(key)?.trim() ?? '') as CompareSlotIds;
  const ok = (id: string) => id.length > 0 && lineupIds.includes(id);
  if (!ids.every(ok)) return null;
  if (new Set(ids).size !== 3) return null;
  return ids;
}

export function writeCompareIdsToUrl(ids: CompareSlotIds) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  COMPARE_QUERY_KEYS.forEach((key, index) => {
    url.searchParams.set(key, ids[index]!);
  });
  const next = `${url.pathname}${url.search}${url.hash}`;
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== next) {
    window.history.replaceState(null, '', next);
  }
}
