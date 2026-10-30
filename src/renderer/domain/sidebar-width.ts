// Sidebar width the user drags (D38): 240 to 400 px, 300 by default.

export const SIDEBAR_WIDTH_MIN = 240;
export const SIDEBAR_WIDTH_MAX = 400;
export const SIDEBAR_WIDTH_DEFAULT = 300;

/** The note area keeps at least this much: 860 px minimum window with the default 300 px sidebar. */
export const NOTE_AREA_MIN = 560;

/**
 * Width to use for `width`, within the limits. With `windowWidth`, the sidebar also stops where the
 * note area would get narrower than NOTE_AREA_MIN (never below the minimum width).
 */
export function clampSidebarWidth(width: number, windowWidth?: number): number {
  const max = windowWidth === undefined ? SIDEBAR_WIDTH_MAX : Math.min(SIDEBAR_WIDTH_MAX, windowWidth - NOTE_AREA_MIN);
  return Math.round(Math.max(SIDEBAR_WIDTH_MIN, Math.min(width, max)));
}
