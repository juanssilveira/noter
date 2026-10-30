// Preferences: `config.json` in the user data folder, a plain JSON object (same file the Tauri store used).

import fs from 'node:fs';
import path from 'node:path';

const WRITE_DELAY_MS = 300;

export type SettingsFile = {
  /** The content (read from disk on first use); `{}` when the file is missing, invalid or not an object. */
  load(): Record<string, unknown>;
  /** Updates memory and schedules a write. */
  set(key: string, value: unknown): void;
  /** Writes pending changes right now. */
  flush(): void;
};

export function createSettingsFile(filePath: string): SettingsFile {
  let data: Record<string, unknown> = {};
  let loaded = false;
  let timer: NodeJS.Timeout | null = null;
  let dirty = false;

  function readFromDisk(): Record<string, unknown> {
    try {
      const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  function ensureLoaded(): void {
    if (loaded) return;
    data = readFromDisk();
    loaded = true;
  }

  function flush(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (!dirty) return;
    dirty = false;
    // Atomic: a crash mid-write must not leave a truncated config.json.
    const tmp = `${filePath}.tmp`;
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`);
      fs.renameSync(tmp, filePath);
    } catch (error) {
      dirty = true;
      console.error('could not write settings', error);
    }
  }

  return {
    load() {
      ensureLoaded();
      return { ...data };
    },
    set(key, value) {
      ensureLoaded();
      data[key] = value;
      dirty = true;
      timer ??= setTimeout(flush, WRITE_DELAY_MS);
    },
    flush,
  };
}
