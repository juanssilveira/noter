import { type KeyboardEvent, type MouseEvent, type PointerEvent, useRef } from 'react';
import {
  clampSidebarWidth,
  SIDEBAR_WIDTH_DEFAULT,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
} from '../domain/sidebar-width';
import { useStrings } from '../i18n/use-strings';
import { useAppStore } from '../state/app-store';

/** Arrow keys move the edge by this much. */
const KEY_STEP = 8;

// Handle on the sidebar's right edge (D38). Dragging updates the width live; it is saved on release.
// A middle click puts the default width back.
export function SidebarResizer() {
  const width = useAppStore((state) => state.sidebarWidth);
  const setSidebarWidth = useAppStore((state) => state.setSidebarWidth);
  const saveSidebarWidth = useAppStore((state) => state.saveSidebarWidth);
  const s = useStrings();
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button === 1) {
      event.preventDefault();
      setSidebarWidth(SIDEBAR_WIDTH_DEFAULT);
      saveSidebarWidth();
      return;
    }
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: width };
    document.documentElement.classList.add('is-resizing-sidebar');
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const { startX, startWidth } = drag.current;
    setSidebarWidth(clampSidebarWidth(startWidth + event.clientX - startX, window.innerWidth));
  };

  const onPointerEnd = () => {
    if (!drag.current) return;
    drag.current = null;
    document.documentElement.classList.remove('is-resizing-sidebar');
    saveSidebarWidth();
  };

  // Chromium starts autoscroll on a middle mouse down; not on the handle.
  const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button === 1) event.preventDefault();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' ? KEY_STEP : event.key === 'ArrowLeft' ? -KEY_STEP : 0;
    if (!step) return;
    event.preventDefault();
    setSidebarWidth(clampSidebarWidth(width + step, window.innerWidth));
    saveSidebarWidth();
  };

  return (
    // A focusable separator: the ARIA pattern for a resize handle.
    <div
      className="sidebar-resizer"
      role="separator"
      aria-orientation="vertical"
      aria-label={s.listWidth}
      aria-valuemin={SIDEBAR_WIDTH_MIN}
      aria-valuemax={SIDEBAR_WIDTH_MAX}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onMouseDown={onMouseDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    />
  );
}
