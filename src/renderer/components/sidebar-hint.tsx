import { useEffect, useState } from 'react';
import { useStrings } from '../i18n/use-strings';

// Sidebar footer hint (D43): the Ctrl and T keycaps light up while held. T only lights with Ctrl down,
// so typing a "t" in the note does not flash it.
export function SidebarHint() {
  const s = useStrings();
  const [ctrl, setCtrl] = useState(false);
  const [t, setT] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      setCtrl(event.ctrlKey);
      if (event.code === 'KeyT') setT(event.type === 'keydown' && event.ctrlKey);
      else if (!event.ctrlKey) setT(false);
    };
    // Keys released in another window never send a keyup here.
    const reset = () => {
      setCtrl(false);
      setT(false);
    };
    // Capture phase: the editor and the menus may stop the events.
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKey, true);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKey, true);
      window.removeEventListener('blur', reset);
    };
  }, []);

  return (
    <p className="sidebar-hint">
      <kbd className={ctrl ? 'is-held' : undefined}>Ctrl</kbd>
      <span>+</span>
      <kbd className={t ? 'is-held' : undefined}>T</kbd>
      <span className="sidebar-hint-text">{s.newNoteHint}</span>
    </p>
  );
}
