import { type RefObject, useLayoutEffect, useState } from 'react';

const VIEWPORT_MARGIN = 8;

/**
 * Places a menu at the mouse position, moved back inside the window when it would overflow.
 * Whole pixels only, so the menu never renders blurry. `layoutKey` re-measures after the menu
 * changes size (another view inside the same menu).
 */
export function useMenuPosition(ref: RefObject<HTMLElement | null>, x: number, y: number, layoutKey?: unknown) {
  const [position, setPosition] = useState({ left: Math.round(x), top: Math.round(y) });

  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    const { width, height } = menu.getBoundingClientRect();
    setPosition({
      left: Math.round(Math.max(VIEWPORT_MARGIN, Math.min(x, window.innerWidth - width - VIEWPORT_MARGIN))),
      top: Math.round(Math.max(VIEWPORT_MARGIN, Math.min(y, window.innerHeight - height - VIEWPORT_MARGIN))),
    });
  }, [ref, x, y, layoutKey]);

  return position;
}
