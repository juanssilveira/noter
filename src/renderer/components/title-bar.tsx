import { useCallback, useEffect, useRef, useState } from 'react';
import { formatHeaderDate } from '../domain/dates';
import { useLocale, useStrings } from '../i18n/use-strings';
import {
  closeWindow,
  isWindowMaximized,
  minimizeWindow,
  onMaximizedChange,
  toggleMaximizeWindow,
} from '../services/app-window';
import { useAppStore, useSelectedEntry } from '../state/app-store';
import { CloseIcon, MaximizeIcon, MinimizeIcon, MoreIcon, PlusIcon, RestoreIcon, SidebarIcon } from './icons';
import { OptionsMenu } from './options-menu';

// Screens: app-sidebar-open.html and app-sidebar-closed.html. With the sidebar open,
// its toggle lives in the sidebar header instead.
// Formatting and tables moved to the right click in the text (D36), so only the date follows the
// toggle. Nova nota can be hidden from the options menu (app-all-hidden.html).
export function TitleBar() {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsButton = useRef<HTMLButtonElement>(null);
  const closeOptions = useCallback(() => setOptionsOpen(false), []);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const layout = useAppStore((state) => state.layout);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const newNote = useAppStore((state) => state.newNote);
  const entry = useSelectedEntry();
  const noteCreated = entry?.note.meta.created ?? null;
  const [maximized, setMaximized] = useState(false);
  const locale = useLocale();
  const s = useStrings();

  useEffect(() => {
    isWindowMaximized().then(setMaximized);
    return onMaximizedChange(setMaximized);
  }, []);

  return (
    <header className={sidebarOpen ? 'title-bar title-bar-sidebar-open' : 'title-bar'} data-drag-region>
      {!sidebarOpen && (
        <button
          type="button"
          className="icon-button"
          aria-label={s.showList}
          title={s.showListTitle}
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </button>
      )}

      {noteCreated && (
        <span className="title-bar-date" data-drag-region>
          {formatHeaderDate(noteCreated, new Date(), locale)}
        </span>
      )}

      <div className="title-bar-spacer" data-drag-region />

      <div className="title-bar-actions">
        {layout.showNewNoteButton && (
          <button
            type="button"
            className="new-note-button"
            aria-label={s.newNote}
            title={s.newNoteTitle}
            onClick={newNote}
          >
            <PlusIcon />
          </button>
        )}
        <button
          type="button"
          ref={optionsButton}
          className="icon-button"
          aria-label={s.moreOptions}
          aria-haspopup="menu"
          aria-expanded={optionsOpen}
          onClick={() => setOptionsOpen((open) => !open)}
        >
          <MoreIcon />
        </button>
        {/* The "…" is always last, so a thin line always separates the app buttons from the window ones. */}
        <div className="title-bar-divider" aria-hidden="true" />
      </div>
      {optionsOpen && <OptionsMenu anchor={optionsButton} onClose={closeOptions} />}

      <div className="window-controls">
        <button type="button" className="window-control" aria-label={s.minimize} onClick={() => minimizeWindow()}>
          <MinimizeIcon />
        </button>
        <button
          type="button"
          className="window-control"
          aria-label={maximized ? s.restore : s.maximize}
          onClick={() => toggleMaximizeWindow()}
        >
          {maximized ? <RestoreIcon /> : <MaximizeIcon />}
        </button>
        <button type="button" className="window-control" aria-label={s.close} onClick={() => closeWindow()}>
          <CloseIcon />
        </button>
      </div>
    </header>
  );
}
