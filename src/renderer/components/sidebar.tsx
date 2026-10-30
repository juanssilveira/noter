import { type KeyboardEvent, useCallback, useRef, useState } from 'react';
import { type Entry, isDraft } from '../domain/entries';
import { noteListItemText } from '../domain/list-item';
import { groupNotes } from '../domain/note-groups';
import { NOTE_AREA_MIN } from '../domain/sidebar-width';
import { useLocale, useStrings } from '../i18n/use-strings';
import { useAppStore } from '../state/app-store';
import { ContextMenu, type ContextMenuItem } from './context-menu';
import { SidebarIcon } from './icons';
import { SidebarHint } from './sidebar-hint';
import { SidebarResizer } from './sidebar-resizer';
import { UpdateNotice } from './update-notice';

type MenuState = { id: string; x: number; y: number } | null;

// Layout: docs/design/screens/app-sidebar-open.html. "Todas as notas" is plain text (D18).
export function Sidebar() {
  const entries = useAppStore((state) => state.entries);
  const selectedId = useAppStore((state) => state.selectedId);
  const renamingId = useAppStore((state) => state.renamingId);
  const selectNote = useAppStore((state) => state.selectNote);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const startRename = useAppStore((state) => state.startRename);
  const deleteNote = useAppStore((state) => state.deleteNote);
  const width = useAppStore((state) => state.sidebarWidth);
  const updateVersion = useAppStore((state) => state.updateVersion);
  const locale = useLocale();
  const s = useStrings();
  const [menu, setMenu] = useState<MenuState>(null);
  const closeMenu = useCallback(() => setMenu(null), []);

  const now = new Date();
  const byNote = new Map(entries.map((entry) => [entry.note, entry]));
  const groups = groupNotes(
    entries.map((entry) => entry.note),
    now,
    locale,
  );

  const menuItems = (entry: Entry): ContextMenuItem[] => [
    { label: s.rename, onSelect: () => startRename(entry.id) },
    { label: s.delete, onSelect: () => deleteNote(entry.id) },
  ];

  const renderItem = (entry: Entry) => {
    const { title, preview } = noteListItemText(entry.note, now, locale);
    const selected = entry.id === selectedId;

    if (entry.id === renamingId) {
      return (
        <li key={entry.id}>
          <div className="note-list-item note-list-item-renaming" aria-current={selected ? 'true' : undefined}>
            <RenameInput id={entry.id} initial={title} hasCustomTitle={entry.note.meta.title !== null} />
            {preview && <span className="note-list-item-preview">{preview}</span>}
          </div>
        </li>
      );
    }

    return (
      <li key={entry.id}>
        <button
          type="button"
          className="note-list-item"
          aria-current={selected ? 'true' : undefined}
          onClick={() => selectNote(entry.id)}
          onContextMenu={(event) => {
            event.preventDefault();
            // A draft has no file yet: nothing to rename or delete.
            if (!isDraft(entry)) setMenu({ id: entry.id, x: event.clientX, y: event.clientY });
          }}
        >
          <span className="note-list-item-title">{title}</span>
          {preview && <span className="note-list-item-preview">{preview}</span>}
        </button>
      </li>
    );
  };

  const menuEntry = menu ? entries.find((entry) => entry.id === menu.id) : undefined;

  return (
    // In a narrow window the sidebar gives way, so the note area keeps its minimum (D38).
    <aside className="sidebar" style={{ width: `min(${width}px, calc(100vw - ${NOTE_AREA_MIN}px))` }}>
      <div className="sidebar-header" data-drag-region>
        <button
          type="button"
          className="icon-button"
          aria-label={s.hideList}
          title={s.hideListTitle}
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </button>
        <span className="sidebar-title" data-drag-region>
          {s.allNotes}
        </span>
      </div>

      <nav className="sidebar-list" aria-label={s.notesList}>
        {groups.map((group) => (
          <section className="note-group" key={group.key} aria-label={group.label}>
            <h2 className="note-group-header">
              <span className="note-group-label">{group.label}</span>
              <span className="note-group-detail">{group.detail}</span>
            </h2>
            <ul>{group.notes.map((note) => renderItem(byNote.get(note)!))}</ul>
          </section>
        ))}
      </nav>

      {menu && menuEntry && (
        <ContextMenu x={menu.x} y={menu.y} label={s.noteActions} items={menuItems(menuEntry)} onClose={closeMenu} />
      )}
      {/* The footer: a shortcut hint, or the update notice in its place (D43). */}
      {updateVersion ? <UpdateNotice /> : <SidebarHint />}
      <SidebarResizer />
    </aside>
  );
}

type RenameInputProps = {
  id: string;
  /** The title as shown: the custom title or the date. */
  initial: string;
  hasCustomTitle: boolean;
};

// Inline rename: Enter or clicking away confirms, Esc cancels, empty goes back to the date.
function RenameInput({ id, initial, hasCustomTitle }: RenameInputProps) {
  const finishRename = useAppStore((state) => state.finishRename);
  const s = useStrings();
  const [value, setValue] = useState(initial);
  // Unmounting blurs the input; the first outcome (Enter, Esc or blur) wins.
  const finished = useRef(false);

  const finish = (title: string | null | undefined) => {
    if (finished.current) return;
    finished.current = true;
    finishRename(id, title);
  };

  const commit = () => {
    const unchangedDate = !hasCustomTitle && value === initial;
    finish(unchangedDate ? undefined : value.trim() || null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      finish(undefined);
    }
  };

  return (
    <input
      className="note-list-item-rename"
      aria-label={s.noteTitle}
      value={value}
      autoFocus
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={onKeyDown}
      onBlur={commit}
    />
  );
}
