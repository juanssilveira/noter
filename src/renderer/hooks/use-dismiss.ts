import { type RefObject, useEffect } from 'react';

/** Menus open right now. While any is open, the drag regions stop dragging (see below). */
let openMenus = 0;

/**
 * Closes a menu on Esc, a pointer down outside it, window blur or resize. Pointer downs inside
 * `ignore` (e.g. the button that toggles the menu) are left to that element. A menu that handles
 * Esc itself stops the event's propagation.
 *
 * Windows keeps the clicks on a drag region (the title bar) to itself, so the page never sees them
 * and the menu would stay open. While a menu is open, the html gets `has-open-menu` and the drag
 * regions turn into normal areas (app.css): a click there closes the menu.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
  ignore: RefObject<HTMLElement | null>[] = [],
) {
  useEffect(() => {
    openMenus++;
    document.documentElement.classList.add('has-open-menu');
    return () => {
      openMenus--;
      if (openMenus === 0) document.documentElement.classList.remove('has-open-menu');
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (ref.current?.contains(target)) return;
      if (ignore.some((other) => other.current?.contains(target))) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('blur', onClose);
    window.addEventListener('resize', onClose);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('blur', onClose);
      window.removeEventListener('resize', onClose);
    };
    // `ignore` holds refs, which are stable.
  }, [ref, onClose]);
}
