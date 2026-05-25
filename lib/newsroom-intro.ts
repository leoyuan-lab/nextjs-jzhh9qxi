/** Hero orbit mark render width (px) — keep in sync with `NewsroomPageClient`. */
export const NEWSROOM_HERO_MARK_PX = 112;

/** Centered fixed box for `RooollBrandMark` at `markPx` width. */
export function newsroomMarkBoxFromRect(rect: DOMRect, markPx: number): { left: number; top: number } {
  const markH = markPx * (745 / 1024);
  return {
    left: rect.left + rect.width / 2 - markPx / 2,
    top: rect.top + rect.height / 2 - markH / 2,
  };
}
