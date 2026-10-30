// Contract between the Electron preload (src/preload/preload.cts) and the renderer (src/renderer/services/).
// Types only: the sandboxed preload cannot load this file at runtime, so the channel names are
// typed here and written as literals there.

/** A note file as read from disk. `modifiedAt` is the file modification time, in ms since the epoch. */
export type NoteFileDto = { file: string; content: string; modifiedAt: number };

export type NotesApi = {
  /** Sets the notes folder (`path` from the settings, or null for `Documentos\Notas`), creating it if needed. Returns the full path. Must be called before the others. */
  openDir(path: string | null): Promise<string>;
  /** Reads the `*.md` files of the folder (not recursive), skipping hidden, `.tmp` and unreadable files. */
  list(): Promise<NoteFileDto[]>;
  read(file: string): Promise<{ content: string; modifiedAt: number }>;
  /** Atomic save: writes `<file>.tmp` and renames it over the note. */
  save(file: string, content: string): Promise<{ modifiedAt: number }>;
  /** Reserves `<baseName>.md`, or `<baseName>_2.md`, `_3`… on collision. */
  create(baseName: string, content: string): Promise<{ file: string; modifiedAt: number }>;
  /** Sends the file to the Windows Recycle Bin. */
  delete(file: string): Promise<void>;
};

export type SettingsApi = {
  /** The raw content of config.json (an empty object if it is missing or invalid). Validation is the renderer's job. */
  load(): Promise<Record<string, unknown>>;
  /** Sets one key; the main process writes the file shortly after, and always before quitting. */
  set(key: string, value: unknown): Promise<void>;
};

/** Light, dark or follow Windows (D39). */
export type AppTheme = 'system' | 'light' | 'dark';

export type WindowApi = {
  show(): Promise<void>;
  minimize(): Promise<void>;
  toggleMaximize(): Promise<void>;
  /** Same as the system close (Alt+F4): goes through the close handshake of AppApi. */
  close(): Promise<void>;
  isMaximized(): Promise<boolean>;
  /** Returns a function that stops listening. */
  onMaximizedChange(listener: (maximized: boolean) => void): () => void;
  /** Sets the minimum size for the sidebar state and grows the window when it is smaller (unless maximized). */
  applyMinSize(sidebarOpen: boolean): Promise<void>;
  /** Theme of the native parts (and of the acrylic tint), and the acrylic material behind the page (D40). */
  setAppearance(theme: AppTheme, acrylic: boolean): Promise<void>;
};

export type AppApi = {
  /** Called when the window is about to close. Flush pending saves, then call `confirmClose`. Returns a function that stops listening. */
  onCloseRequested(listener: () => void): () => void;
  confirmClose(): void;
};

export type UpdaterApi = {
  /** A new version finished downloading (D42). Returns a function that stops listening. */
  onReady(listener: (version: string) => void): () => void;
  /** Quits, installs the downloaded version and reopens the app. Flush pending saves first. */
  install(): Promise<void>;
};

export type ShellApi = {
  /** Opens an http(s) or mailto link in the default browser. Other protocols are ignored. */
  openExternal(url: string): Promise<void>;
};

/** Exposed by the preload as `window.noter`. */
export type NoterApi = {
  notes: NotesApi;
  settings: SettingsApi;
  window: WindowApi;
  app: AppApi;
  shell: ShellApi;
  updater: UpdaterApi;
};

/** Channels of `ipcRenderer.invoke` / `ipcMain.handle`, with their arguments and results. */
export type InvokeChannels = {
  'notes:open-dir': { args: [path: string | null]; result: string };
  'notes:list': { args: []; result: NoteFileDto[] };
  'notes:read': { args: [file: string]; result: { content: string; modifiedAt: number } };
  'notes:save': { args: [file: string, content: string]; result: { modifiedAt: number } };
  'notes:create': { args: [baseName: string, content: string]; result: { file: string; modifiedAt: number } };
  'notes:delete': { args: [file: string]; result: undefined };
  'settings:load': { args: []; result: Record<string, unknown> };
  'settings:set': { args: [key: string, value: unknown]; result: undefined };
  'window:show': { args: []; result: undefined };
  'window:minimize': { args: []; result: undefined };
  'window:toggle-maximize': { args: []; result: undefined };
  'window:close': { args: []; result: undefined };
  'window:is-maximized': { args: []; result: boolean };
  'window:apply-min-size': { args: [sidebarOpen: boolean]; result: undefined };
  'window:set-appearance': { args: [theme: AppTheme, acrylic: boolean]; result: undefined };
  'shell:open-external': { args: [url: string]; result: undefined };
  'updater:install': { args: []; result: undefined };
};

/** Renderer → main, fire and forget (`ipcRenderer.send` / `ipcMain.on`). */
export type SendChannels = {
  'app:close-confirmed': [];
};

/** Main → renderer (`webContents.send` / `ipcRenderer.on`). */
export type EventChannels = {
  'app:close-requested': [];
  'window:maximized-changed': [maximized: boolean];
  'updater:ready': [version: string];
};
