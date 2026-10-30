import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Hover time before a tooltip shows. */
const DELAY_MS = 500;
/** Space between the element and the tooltip, and the least distance to the window edges. */
const GAP = 6;
const EDGE = 8;

type Tip = { text: string; anchor: DOMRect };

// Tooltips for any element with data-tooltip, in place of the native title: one at a time, fixed on
// the screen (so a scrolling menu doesn't clip it), above the element, or under it when there is no room
// (the title bar buttons).
export function TooltipLayer() {
  const [tip, setTip] = useState<Tip | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer = 0;
    let current: HTMLElement | null = null;
    const hide = () => {
      window.clearTimeout(timer);
      current = null;
      setTip(null);
    };
    const onOver = (event: PointerEvent) => {
      const target = (event.target as Element).closest<HTMLElement>('[data-tooltip]');
      if (target === current) return;
      hide();
      if (!target) return;
      current = target;
      timer = window.setTimeout(() => {
        setTip({ text: target.dataset.tooltip ?? '', anchor: target.getBoundingClientRect() });
      }, DELAY_MS);
    };
    // Leaving the window.
    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) hide();
    };
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    // A click, a key or a scroll changes what is under the pointer.
    document.addEventListener('pointerdown', hide, true);
    document.addEventListener('keydown', hide, true);
    document.addEventListener('scroll', hide, true);
    window.addEventListener('blur', hide);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('pointerdown', hide, true);
      document.removeEventListener('keydown', hide, true);
      document.removeEventListener('scroll', hide, true);
      window.removeEventListener('blur', hide);
    };
  }, []);

  // Measured hidden first, then placed in whole pixels.
  useLayoutEffect(() => {
    if (!tip || !ref.current) {
      setPosition(null);
      return;
    }
    const { width, height } = ref.current.getBoundingClientRect();
    let top = tip.anchor.top - GAP - height;
    if (top < EDGE) top = tip.anchor.bottom + GAP;
    const centered = tip.anchor.left + tip.anchor.width / 2 - width / 2;
    const left = Math.min(Math.max(centered, EDGE), window.innerWidth - EDGE - width);
    setPosition({ left: Math.round(left), top: Math.round(top) });
  }, [tip]);

  if (!tip) return null;
  return (
    <div ref={ref} className={position ? 'tooltip is-shown' : 'tooltip'} role="tooltip" style={position ?? undefined}>
      {tip.text}
    </div>
  );
}
