import { useEffect, useState } from 'react';
import { useStrings } from '../i18n/use-strings';
import { useAppStore } from '../state/app-store';

/** How long "Salvo" stays after the last write. */
const VISIBLE_MS = 1500;

// A faint "Salvo" in the bottom right corner after each save (D37). It fades in and out via CSS;
// a new save while it shows only restarts the timer.
export function SaveIndicator() {
  const saveCount = useAppStore((state) => state.saveCount);
  const [visible, setVisible] = useState(false);
  const s = useStrings();

  useEffect(() => {
    if (saveCount === 0) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [saveCount]);

  return (
    // Decorative: a screen reader would announce it at every pause in typing.
    <div className={visible ? 'save-indicator save-indicator-visible' : 'save-indicator'} aria-hidden="true">
      {s.saved}
    </div>
  );
}
