import { useEffect, useState } from 'react';
import { NoteEditor } from './components/note-editor';
import { SaveIndicator } from './components/save-indicator';
import { Sidebar } from './components/sidebar';
import { TitleBar } from './components/title-bar';
import { TooltipLayer } from './components/tooltip-layer';
import { ZoomControl } from './components/zoom-control';
import { useDocumentTheme } from './hooks/use-theme';
import { useLocale } from './i18n/use-strings';
import { confirmClose, onCloseRequested, setWindowAppearance, showWindow } from './services/app-window';
import { onUpdateReady } from './services/updater';
import { applyMinWindowSize } from './services/window-size';
import { useAppStore, useSelectedEntry } from './state/app-store';

/** Show the window even if loading the notes hangs, so the app never stays invisible. */
const SHOW_WINDOW_FALLBACK_MS = 2000;

function isShortcut(event: KeyboardEvent, key: string): boolean {
  return event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && event.key.toLowerCase() === key;
}

/** Ctrl with "+" (on "=" or the keypad, with or without Shift), "-" or "0": the note zoom keys. */
function zoomDirection(event: KeyboardEvent): 1 | -1 | 0 | null {
  if (!event.ctrlKey || event.altKey || event.metaKey) return null;
  if (event.key === '=' || event.key === '+') return 1;
  if (event.key === '-') return -1;
  if (event.key === '0' && !event.shiftKey) return 0;
  return null;
}

/** The sidebar slide (--ui-slide in tokens.css): how long a closing sidebar stays on screen. */
const SIDEBAR_SLIDE_MS = 180;

export default function App() {
  const status = useAppStore((state) => state.status);
  const init = useAppStore((state) => state.init);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const newNote = useAppStore((state) => state.newNote);
  const zoomNote = useAppStore((state) => state.zoomNote);
  const flushPending = useAppStore((state) => state.flushPending);
  const reloadFromDisk = useAppStore((state) => state.reloadFromDisk);
  const entry = useSelectedEntry();
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  // The sidebar slides in and out only once the app has loaded: at startup the saved state just applies
  // (it arrives with the notes, while the window is still hidden).
  const [settled, setSettled] = useState(false);
  // Still on screen while it slides out after closing.
  const [sidebarShown, setSidebarShown] = useState(sidebarOpen);
  useEffect(() => {
    if (sidebarOpen || !settled) {
      setSidebarShown(sidebarOpen);
      return;
    }
    const timer = window.setTimeout(() => setSidebarShown(false), SIDEBAR_SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [sidebarOpen, settled]);
  useEffect(() => {
    if (status !== 'loading') setSettled(true);
  }, [status]);
  const theme = useAppStore((state) => state.theme);
  const acrylic = useAppStore((state) => state.acrylic);
  const locale = useLocale();
  const setUpdateReady = useAppStore((state) => state.setUpdateReady);
  const refreshTransparency = useAppStore((state) => state.refreshTransparency);

  useEffect(() => {
    void init();
  }, [init]);

  // Before the effect that shows the window, so it never shows in the wrong theme.
  useDocumentTheme(theme);

  // A new version finished downloading in the background (D42).
  useEffect(() => onUpdateReady(setUpdateReady), [setUpdateReady]);

  // Windows transparency effects, known before the options menu opens (its acrylic warning shows at
  // once). Read again on focus: the user may have changed it in the settings meanwhile.
  useEffect(() => {
    void refreshTransparency();
    const onFocus = () => void refreshTransparency();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshTransparency]);

  // Screen readers and the spell checker read the page language (D41).
  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
  }, [locale]);

  // The page side of the acrylic (app.css) and the window side: material, theme of the tint (D40).
  useEffect(() => {
    document.documentElement.classList.toggle('acrylic', acrylic);
    setWindowAppearance(theme, acrylic).catch((error) => console.error('failed to set the window appearance', error));
  }, [theme, acrylic]);

  useEffect(() => {
    // The window starts hidden (src/main/main-window.ts) to avoid a blank flash; show it once the notes are in.
    if (status !== 'loading') {
      void showWindow();
      return;
    }
    const fallback = window.setTimeout(() => void showWindow(), SHOW_WINDOW_FALLBACK_MS);
    return () => window.clearTimeout(fallback);
  }, [status]);

  useEffect(() => {
    if (status === 'loading') return;
    applyMinWindowSize(sidebarOpen).catch((error) => console.error('failed to set the minimum size', error));
  }, [status, sidebarOpen]);

  useEffect(() => {
    // Closing the window (X, Alt+F4): save what is pending, then let the main process close it.
    const stopCloseListener = onCloseRequested(async () => {
      try {
        await flushPending();
      } finally {
        confirmClose();
      }
    });
    // Save when the app loses focus (D07).
    const onBlur = () => void flushPending();
    // Pick up changes made outside the app (D08).
    const onFocus = () => void reloadFromDisk();
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      stopCloseListener();
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [flushPending, reloadFromDisk]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isShortcut(event, ']')) {
        event.preventDefault();
        toggleSidebar();
      } else if (isShortcut(event, 't')) {
        event.preventDefault();
        newNote();
      } else {
        const zoom = zoomDirection(event);
        if (zoom === null) return;
        event.preventDefault();
        zoomNote(zoom);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleSidebar, newNote, zoomNote]);

  return (
    <div className="app">
      {/* Open: at once, in the same render; closed: kept until it has slid out. */}
      {(sidebarOpen || sidebarShown) && <Sidebar closing={!sidebarOpen} animated={settled} />}
      <div className="main">
        <TitleBar />
        <main className="app-content">
          {entry && <NoteEditor key={`${entry.id}:${entry.revision}`} entry={entry} />}
        </main>
        <ZoomControl />
        <SaveIndicator />
      </div>
      <TooltipLayer />
    </div>
  );
}
