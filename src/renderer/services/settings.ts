// User settings in config.json, read and written by the main process (src/main/). It debounces the
// writes and flushes them before quitting (D09). Window size and position are handled there too.

import type { Language } from '../domain/language';
import { SIDEBAR_WIDTH_DEFAULT } from '../domain/sidebar-width';
import type { Theme } from '../domain/theme';
import { platform } from './platform';

export type Settings = {
  /** Notes folder; null means Documentos\Notas. */
  notesDir: string | null;
  /** File of the last opened note. */
  lastNote: string | null;
  /** Last cursor position per note file (D12). */
  cursors: Record<string, number>;
  sidebarOpen: boolean;
  /** Sidebar width in px (D38), clamped when read. */
  sidebarWidth: number;
  showNewNoteButton: boolean;
  /** The editor's spell checker. */
  spellcheck: boolean;
  /** Light, dark or follow Windows (D39); an unknown value falls back to "system". */
  theme: Theme;
  /** Acrylic behind the sidebar (D40). */
  acrylic: boolean;
  /** Interface language (D41); an unknown value falls back to "system". */
  language: Language;
};

export const DEFAULT_SETTINGS: Settings = {
  notesDir: null,
  lastNote: null,
  cursors: {},
  sidebarOpen: true,
  sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
  showNewNoteButton: true,
  spellcheck: true,
  theme: 'system',
  acrylic: false,
  language: 'system',
};

/** Reads the settings, ignoring values with the wrong type (for example after a hand edit). */
export async function loadSettings(): Promise<Settings> {
  const settings = { ...DEFAULT_SETTINGS };
  for (const [key, value] of Object.entries(await platform.settings.load())) {
    if (!(key in DEFAULT_SETTINGS)) continue;
    const typedKey = key as keyof Settings;
    const expected = typeof DEFAULT_SETTINGS[typedKey];
    const nullable = DEFAULT_SETTINGS[typedKey] === null;
    if (
      (nullable && (value === null || typeof value === 'string')) ||
      (value !== null && !Array.isArray(value) && typeof value === expected)
    ) {
      Object.assign(settings, { [typedKey]: value });
    }
  }
  return settings;
}

export async function saveSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await platform.settings.set(key, value);
}
