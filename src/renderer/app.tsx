import { useEffect } from 'react';
import { NoteEditor } from './components/note-editor';
import { SaveIndicator } from './components/save-indicator';
import { Sidebar } from './components/sidebar';
import { TitleBar } from './components/title-bar';
import { TooltipLayer } from './components/tooltip-layer';
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

export default function App() {
  const status = useAppStore((state) => state.status);
  const init = useAppStore((state) => state.init);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const newNote = useAppStore((state) => state.newNote);
  const flushPending = useAppStore((state) => state.flushPending);
  const reloadFromDisk = useAppStore((state) => state.reloadFromDisk);
  const entry = useSelectedEntry();
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const theme = useAppStore((state) => state.theme);
  const acrylic = useAppStore((state) => state.acrylic);
  const locale = useLocale();
  const setUpdateReady = useAppStore((state) => state.setUpdateReady);

  useEffect(() => {
    void init();
  }, [init]);

  // Before the effect that shows the window, so it never shows in the wrong theme.
  useDocumentTheme(theme);

  // A new version finished downloading in the background (D42).
  useEffect(() => onUpdateReady(setUpdateReady), [setUpdateReady]);

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
      if (isShortcut(event, '\\')) {
        event.preventDefault();
        toggleSidebar();
      } else if (isShortcut(event, 't')) {
        event.preventDefault();
        newNote();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleSidebar, newNote]);

  return (
    <div className="app">
      {sidebarOpen && <Sidebar />}
      <div className="main">
        <TitleBar />
        <main className="app-content">
          {entry && <NoteEditor key={`${entry.id}:${entry.revision}`} entry={entry} />}
        </main>
        <SaveIndicator />
      </div>
      <TooltipLayer />
    </div>
  );
}
