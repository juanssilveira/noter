// Minimum window size by sidebar state. Sizes are DIP (device independent pixels), as in Electron.

export type Size = { width: number; height: number };

export const MIN_SIZE_SIDEBAR_CLOSED: Size = { width: 720, height: 480 };
/** 300 px of sidebar + 560 px so the title bar still fits (quick actions, date, buttons, window controls). */
export const MIN_SIZE_SIDEBAR_OPEN: Size = { width: 860, height: 480 };

export function minWindowSize(sidebarOpen: boolean): Size {
  return sidebarOpen ? MIN_SIZE_SIDEBAR_OPEN : MIN_SIZE_SIDEBAR_CLOSED;
}

/** The size the window must grow to so it respects `min`; null when it already does. */
export function sizeToGrowTo(current: Size, min: Size): Size | null {
  if (current.width >= min.width && current.height >= min.height) return null;
  return { width: Math.max(current.width, min.width), height: Math.max(current.height, min.height) };
}
