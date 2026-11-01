// App state shared by the title bar, the sidebar and the note area.
// Behavior: docs/behavior.md. Every disk write goes through one queue, in order.

import type { Editor } from '@tiptap/core';
import { create } from 'zustand';
import { createDraftNote, type Entry, isBlankDraft, isDraft, neighborAfterRemoval } from '../domain/entries';
import { isLanguage, type Language } from '../domain/language';
import { isBlankBody, type Note, type NoteMeta } from '../domain/note';
import { clampNoteZoom, NOTE_ZOOM_DEFAULT, stepNoteZoom } from '../domain/note-zoom';
import { pickInitialNote } from '../domain/selection';
import { clampSidebarWidth, SIDEBAR_WIDTH_DEFAULT } from '../domain/sidebar-width';
import { isTheme, type Theme } from '../domain/theme';
import { isTransparencyEnabled } from '../services/app-window';
import {
  createNote,
  type LoadedNote,
  listNotes,
  openNotesDir,
  saveNote,
  deleteNote as trashNote,
} from '../services/notes-api';
import { DEFAULT_SETTINGS, loadSettings, type Settings, saveSetting } from '../services/settings';
import { installUpdate } from '../services/updater';

type Status = 'loading' | 'ready' | 'error';

export type LayoutOptions = Pick<Settings, 'showNewNoteButton'>;

/** Debounce of the automatic save (D07). */
const SAVE_DELAY_MS = 500;
const CURSOR_SAVE_DELAY_MS = 1000;

type AppState = {
  status: Status;
  error: string | null;
  entries: Entry[];
  selectedId: string | null;
  sidebarOpen: boolean;
  /** Within the limits of D38; the CSS also caps it to leave the note area its minimum. */
  sidebarWidth: number;
  /** Zoom of the note area only, 0.8 to 1.5. */
  noteZoom: number;
  /** Title bar buttons the user can hide from the options menu. */
  layout: LayoutOptions;
  /** The editor's spell checker, switched in the options menu. */
  spellcheck: boolean;
  /** Light, dark or follow Windows (D39). */
  theme: Theme;
  /** Acrylic behind the sidebar (D40). */
  acrylic: boolean;
  /** Interface language (D41); see i18n/use-strings.ts for the one in use. */
  language: Language;
  /** Entry whose title is being edited inline in the sidebar. */
  renamingId: string | null;
  /** Bumped to ask the editor for focus (Ctrl T on an empty draft). */
  focusToken: number;
  /** Text in the sidebar search field. Not saved. */
  searchQuery: string;
  /** Bumped by Ctrl F to focus the search field (and open the sidebar if it is closed). */
  searchFocusToken: number;
  /** Group keys the user folded in the sidebar (D48). Not saved. */
  collapsedGroups: string[];
  /** A downloaded version waiting for a restart (D42), or null. */
  updateVersion: string | null;
  /** Windows transparency effects: off, the acrylic shows solid and the options menu warns (D40). */
  transparencyEnabled: boolean;
  /** Bumped after every successful write: drives the "Salvo" indicator. */
  saveCount: number;
  /** Editor of the open note, used by the title bar menus. */
  editor: Editor | null;

  init: () => Promise<void>;
  selectNote: (id: string) => void;
  newNote: () => void;
  toggleSidebar: () => void;
  /** Opens the sidebar if needed and focuses the search field. */
  openSearch: () => void;
  setSearchQuery: (query: string) => void;
  toggleGroup: (key: string) => void;
  /** Bumps `focusToken` so the editor takes the caret. */
  focusEditor: () => void;
  /** While dragging: updates the width without saving it. */
  setSidebarWidth: (width: number) => void;
  saveSidebarWidth: () => void;
  /** One 10% step in (1) or out (-1), or back to 100% (0); saved. */
  zoomNote: (direction: 1 | -1 | 0) => void;
  setLayoutOption: (option: keyof LayoutOptions, value: boolean) => void;
  setSpellcheck: (value: boolean) => void;
  setTheme: (theme: Theme) => void;
  setAcrylic: (value: boolean) => void;
  setLanguage: (language: Language) => void;
  setUpdateReady: (version: string) => void;
  /** Reads the Windows transparency switch again (at startup and when the window gets focus). */
  refreshTransparency: () => Promise<void>;
  /** Saves what is pending, then quits into the installer of the downloaded version. */
  restartToUpdate: () => Promise<void>;
  /** Records an edit; `readBody` serializes the editor and is called only when saving. */
  markDirty: (id: string, readBody: () => string) => void;
  /** Saves the pending edit now; resolves when every queued write is done. */
  flushPending: () => Promise<void>;
  startRename: (id: string) => void;
  /** `title` null removes the custom title; undefined cancels. */
  finishRename: (id: string, title: string | null | undefined) => void;
  deleteNote: (id: string) => void;
  /** Re-reads the folder after outside changes (D08). */
  reloadFromDisk: () => Promise<void>;
  rememberCursor: (file: string, position: number) => void;
  cursorFor: (file: string) => number | null;
  setEditor: (editor: Editor | null) => void;
};

let initStarted = false;
let nextId = 0;
let pending: { id: string; readBody: () => string } | null = null;
let saveTimer: number | undefined;
let writeQueue: Promise<void> = Promise.resolve();
let writesInFlight = 0;
/** Entries whose last write failed; retried on the next flush. */
const failedWrites = new Set<string>();
let cursors: Record<string, number> = {};
let cursorTimer: number | undefined;

const newId = () => `n${++nextId}`;

function toEntry({ note, modifiedAt }: LoadedNote): Entry {
  return { id: newId(), note, modifiedAt, revision: 0 };
}

function newDraft(): Entry {
  return { id: newId(), note: createDraftNote(new Date()), modifiedAt: null, revision: 0 };
}

export const useAppStore = create<AppState>()((set, get) => {
  const find = (id: string | null) => get().entries.find((entry) => entry.id === id);

  const patchEntry = (id: string, patch: Partial<Entry>) =>
    set({ entries: get().entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)) });

  const enqueue = (task: () => Promise<void>): Promise<void> => {
    writesInFlight++;
    writeQueue = writeQueue
      .then(task)
      .catch((error) => console.error('write failed', error))
      .finally(() => {
        writesInFlight--;
      });
    return writeQueue;
  };

  /** Writes `snapshot` for entry `id`: creates the file of a draft, or saves an existing note. */
  const enqueueWrite = (id: string, snapshot: Note) =>
    enqueue(async () => {
      const current = find(id);
      if (!current) return; // deleted meanwhile
      const note: Note = { ...snapshot, file: current.note.file };
      try {
        if (note.file === '') {
          if (isBlankBody(note.body)) return;
          const created = await createNote(note);
          const latest = find(id);
          if (!latest) return;
          patchEntry(id, {
            note: { ...latest.note, file: created.note.file },
            modifiedAt: created.modifiedAt,
          });
          if (get().selectedId === id) void saveSetting('lastNote', created.note.file);
        } else {
          const modifiedAt = await saveNote(note);
          if (find(id)) patchEntry(id, { modifiedAt });
        }
        failedWrites.delete(id);
        set({ saveCount: get().saveCount + 1 });
      } catch (error) {
        // Keep the edit in memory; the next flush tries again (D07).
        console.error(`failed to save ${note.file || 'draft'}`, error);
        failedWrites.add(id);
      }
    });

  /** Applies a change to an entry's note right away and queues the write. */
  const commit = (id: string, change: (note: Note) => Note) => {
    const entry = find(id);
    if (!entry) return;
    const note = change(entry.note);
    patchEntry(id, { note });
    void enqueueWrite(id, note);
  };

  /** Leaving a blank draft discards it, unless it is the only note (D10, D13). */
  const withoutAbandonedDraft = (entries: Entry[], leavingId: string | null): Entry[] => {
    const leaving = entries.find((entry) => entry.id === leavingId);
    if (!leaving || !isBlankDraft(leaving) || entries.length === 1) return entries;
    return entries.filter((entry) => entry.id !== leavingId);
  };

  return {
    status: 'loading',
    error: null,
    entries: [],
    selectedId: null,
    sidebarOpen: true,
    sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
    noteZoom: NOTE_ZOOM_DEFAULT,
    layout: {
      showNewNoteButton: DEFAULT_SETTINGS.showNewNoteButton,
    },
    spellcheck: DEFAULT_SETTINGS.spellcheck,
    theme: DEFAULT_SETTINGS.theme,
    acrylic: DEFAULT_SETTINGS.acrylic,
    language: DEFAULT_SETTINGS.language,
    renamingId: null,
    focusToken: 0,
    searchQuery: '',
    searchFocusToken: 0,
    collapsedGroups: [],
    saveCount: 0,
    updateVersion: null,
    transparencyEnabled: true,
    editor: null,

    init: async () => {
      // StrictMode runs effects twice in development; load once.
      if (initStarted) return;
      initStarted = true;
      try {
        const settings = await loadSettings();
        cursors = settings.cursors;
        await openNotesDir(settings.notesDir);
        const entries = (await listNotes()).map(toEntry);
        const initial = pickInitialNote(
          entries.map((entry) => entry.note),
          settings.lastNote,
        );
        const selected = entries.find((entry) => entry.note === initial) ?? newDraft();
        set({
          status: 'ready',
          entries: initial ? entries : [selected],
          selectedId: selected.id,
          sidebarOpen: settings.sidebarOpen,
          sidebarWidth: clampSidebarWidth(settings.sidebarWidth),
          noteZoom: clampNoteZoom(settings.noteZoom),
          layout: {
            showNewNoteButton: settings.showNewNoteButton,
          },
          spellcheck: settings.spellcheck,
          theme: isTheme(settings.theme) ? settings.theme : DEFAULT_SETTINGS.theme,
          acrylic: settings.acrylic,
          language: isLanguage(settings.language) ? settings.language : DEFAULT_SETTINGS.language,
        });
      } catch (error) {
        console.error('failed to load notes', error);
        set({ status: 'error', error: String(error) });
      }
    },

    selectNote: (id) => {
      const { selectedId } = get();
      if (selectedId === id) return;
      void get().flushPending();
      set({
        entries: withoutAbandonedDraft(get().entries, selectedId),
        selectedId: id,
        renamingId: null,
      });
      const file = find(id)?.note.file;
      if (file) void saveSetting('lastNote', file);
    },

    newNote: () => {
      void get().flushPending();
      const current = find(get().selectedId);
      if (current && isBlankDraft(current)) {
        set({ focusToken: get().focusToken + 1 });
        return;
      }
      const draft = newDraft();
      set({
        entries: [draft, ...withoutAbandonedDraft(get().entries, get().selectedId)],
        selectedId: draft.id,
        renamingId: null,
      });
    },

    toggleSidebar: () => {
      const sidebarOpen = !get().sidebarOpen;
      set({ sidebarOpen });
      void saveSetting('sidebarOpen', sidebarOpen);
    },

    openSearch: () => {
      const sidebarOpen = get().sidebarOpen;
      set({ sidebarOpen: true, searchFocusToken: get().searchFocusToken + 1 });
      if (!sidebarOpen) void saveSetting('sidebarOpen', true);
    },

    setSearchQuery: (searchQuery) => {
      set({ searchQuery });
    },

    toggleGroup: (key) => {
      const collapsed = get().collapsedGroups;
      const folding = !collapsed.includes(key);
      set({
        collapsedGroups: folding ? [...collapsed, key] : collapsed.filter((item) => item !== key),
        ...(folding ? { renamingId: null } : {}),
      });
    },

    focusEditor: () => {
      set({ focusToken: get().focusToken + 1 });
    },

    setSidebarWidth: (width) => {
      set({ sidebarWidth: clampSidebarWidth(width) });
    },

    saveSidebarWidth: () => {
      void saveSetting('sidebarWidth', get().sidebarWidth);
    },

    zoomNote: (direction) => {
      const noteZoom = direction === 0 ? NOTE_ZOOM_DEFAULT : stepNoteZoom(get().noteZoom, direction);
      set({ noteZoom });
      void saveSetting('noteZoom', noteZoom);
    },

    setLayoutOption: (option, value) => {
      set({ layout: { ...get().layout, [option]: value } });
      void saveSetting(option, value);
    },

    setSpellcheck: (value) => {
      set({ spellcheck: value });
      void saveSetting('spellcheck', value);
    },

    setTheme: (theme) => {
      set({ theme });
      void saveSetting('theme', theme);
    },

    setAcrylic: (value) => {
      set({ acrylic: value });
      void saveSetting('acrylic', value);
    },

    setLanguage: (language) => {
      set({ language });
      void saveSetting('language', language);
    },

    setUpdateReady: (version) => {
      set({ updateVersion: version });
    },

    refreshTransparency: async () => {
      set({ transparencyEnabled: await isTransparencyEnabled() });
    },

    restartToUpdate: async () => {
      await get().flushPending();
      await installUpdate();
    },

    markDirty: (id, readBody) => {
      if (pending && pending.id !== id) void get().flushPending();
      pending = { id, readBody };
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => void get().flushPending(), SAVE_DELAY_MS);
    },

    flushPending: () => {
      window.clearTimeout(saveTimer);
      const current = pending;
      pending = null;

      if (current) {
        let body: string | null = null;
        try {
          // Read synchronously, before the editor can be destroyed.
          body = current.readBody();
        } catch (error) {
          console.error('failed to read the editor', error);
        }
        const entry = find(current.id);
        if (entry && body !== null && body !== entry.note.body) {
          commit(current.id, (note) => ({ ...note, body: body!, meta: { ...note.meta, updated: new Date() } }));
          failedWrites.delete(current.id);
        }
      }

      for (const id of failedWrites) {
        const entry = find(id);
        failedWrites.delete(id);
        if (entry) void enqueueWrite(id, entry.note);
      }
      return writeQueue;
    },

    startRename: (id) => {
      const entry = find(id);
      if (entry && !isDraft(entry)) set({ renamingId: id });
    },

    finishRename: (id, title) => {
      if (get().renamingId === id) set({ renamingId: null });
      const entry = find(id);
      if (!entry || title === undefined) return;
      const normalized = title?.trim() || null;
      if (normalized === entry.note.meta.title) return;
      void get().flushPending();
      commit(id, (note) => withMeta(note, { title: normalized }));
    },

    deleteNote: (id) => {
      const entry = find(id);
      if (!entry || isDraft(entry)) return;
      void get().flushPending();

      const { entries, selectedId } = get();
      let remaining = entries.filter((other) => other.id !== id);
      let nextSelected = selectedId;
      if (selectedId === id) {
        const neighbor = neighborAfterRemoval(entries, id);
        if (neighbor) {
          nextSelected = neighbor.id;
        } else {
          const draft = newDraft();
          remaining = [draft];
          nextSelected = draft.id;
        }
      }
      set({ entries: remaining, selectedId: nextSelected, renamingId: null });
      const nextFile = find(nextSelected)?.note.file;
      if (selectedId === id && nextFile) void saveSetting('lastNote', nextFile);

      // Queued after any pending save of the same note, so the file is never recreated.
      const file = entry.note.file;
      void enqueue(() => trashNote(file));
    },

    reloadFromDisk: async () => {
      if (get().status !== 'ready') return;
      // Our own writes win (D08); try again on the next focus.
      if (pending || writesInFlight > 0) return;
      const disk = await listNotes();
      if (pending || writesInFlight > 0) return;

      const byFile = new Map(disk.map((loaded) => [loaded.note.file, loaded]));
      const entries: Entry[] = [];
      let changed = false;
      for (const entry of get().entries) {
        if (isDraft(entry)) {
          entries.push(entry);
          continue;
        }
        const loaded = byFile.get(entry.note.file);
        byFile.delete(entry.note.file);
        if (!loaded) {
          changed = true; // deleted outside the app
        } else if (loaded.modifiedAt !== entry.modifiedAt) {
          entries.push({ ...entry, note: loaded.note, modifiedAt: loaded.modifiedAt, revision: entry.revision + 1 });
          changed = true;
        } else {
          entries.push(entry);
        }
      }
      for (const loaded of byFile.values()) {
        entries.push(toEntry(loaded));
        changed = true;
      }
      if (!changed) return;

      let selectedId = get().selectedId;
      if (!entries.some((entry) => entry.id === selectedId)) {
        const initial = pickInitialNote(
          entries.map((entry) => entry.note),
          null,
        );
        const selected = entries.find((entry) => entry.note === initial) ?? newDraft();
        if (!initial) entries.push(selected);
        selectedId = selected.id;
      }
      set({ entries, selectedId });
    },

    rememberCursor: (file, position) => {
      if (!file || cursors[file] === position) return;
      cursors = { ...cursors, [file]: position };
      window.clearTimeout(cursorTimer);
      cursorTimer = window.setTimeout(() => void saveSetting('cursors', cursors), CURSOR_SAVE_DELAY_MS);
    },

    cursorFor: (file) => (file ? (cursors[file] ?? null) : null),

    setEditor: (editor) => set({ editor }),
  };
});

function withMeta(note: Note, change: Partial<NoteMeta>): Note {
  return { ...note, meta: { ...note.meta, ...change, updated: new Date() } };
}

export function useSelectedEntry(): Entry | null {
  return useAppStore((state) => state.entries.find((entry) => entry.id === state.selectedId) ?? null);
}
