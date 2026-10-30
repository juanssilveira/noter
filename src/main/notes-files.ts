// Note file I/O for the main process. Parsing lives in the renderer; this only reads and writes files.
import fs from 'node:fs/promises';
import path from 'node:path';
import type { NotesApi } from '../shared/noter-api.js';
import {
  assertValidBaseName,
  assertValidNoteFileName,
  isListableNoteName,
  noteFileCandidate,
  TEMP_SUFFIX,
} from './core/note-file-name.js';

const DEFAULT_NOTES_DIR_NAME = 'Notas';

export type NotesFilesOptions = {
  /** Windows Documents folder; the default notes folder is `<documentsDir>/Notas`. */
  documentsDir: string;
  /** Sends a file (absolute path) to the Recycle Bin. In the app it is Electron's shell.trashItem. */
  trash: (fullPath: string) => Promise<void>;
};

/** Writes to `<file>.tmp` and renames it over the target, so a crash never leaves half a note. */
async function writeAtomic(filePath: string, content: string): Promise<void> {
  const tempPath = `${filePath}${TEMP_SUFFIX}`;
  const temp = await fs.open(tempPath, 'w');
  try {
    await temp.writeFile(content, 'utf8');
    await temp.sync();
  } finally {
    await temp.close();
  }
  try {
    await fs.rename(tempPath, filePath);
  } catch (error) {
    await fs.rm(tempPath, { force: true }).catch(() => {});
    throw error;
  }
}

// Strict, as in the Tauri version: Node's 'utf8' would swap invalid bytes for U+FFFD, and saving
// that text back would destroy the original. The BOM is kept, as before.
const utf8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

/** Reads a note as UTF-8, failing on invalid bytes instead of replacing them. */
async function readUtf8(filePath: string): Promise<string> {
  return utf8.decode(await fs.readFile(filePath));
}

/** Milliseconds since the Unix epoch, as used by `Date` in the renderer. */
async function modifiedMillis(filePath: string): Promise<number> {
  return Math.floor((await fs.stat(filePath)).mtimeMs);
}

/** Reserves `<base>.md`, or `<base>_2.md`, `_3.md`… when the name is taken. */
async function reserveNoteFile(dir: string, baseName: string): Promise<{ file: string; fullPath: string }> {
  for (let attempt = 1; ; attempt++) {
    const file = noteFileCandidate(baseName, attempt);
    const fullPath = path.join(dir, file);
    try {
      await (await fs.open(fullPath, 'wx')).close();
      return { file, fullPath };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
  }
}

export function createNotesFiles(options: NotesFilesOptions): NotesApi {
  let notesDir: string | null = null;

  const requireDir = (): string => {
    if (notesDir === null) throw new Error('notes folder not opened yet');
    return notesDir;
  };

  const notePath = (file: string): string => {
    assertValidNoteFileName(file);
    return path.join(requireDir(), file);
  };

  return {
    async openDir(dirPath) {
      const dir =
        dirPath !== null && dirPath.trim() !== '' ? dirPath : path.join(options.documentsDir, DEFAULT_NOTES_DIR_NAME);
      await fs.mkdir(dir, { recursive: true });
      notesDir = dir;
      return dir;
    },

    async list() {
      const dir = requireDir();
      const notes = [];
      for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        if (!entry.isFile() || !isListableNoteName(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        // One unreadable file (not UTF-8, locked by another program) must not hide all the others.
        let content: string;
        try {
          content = await readUtf8(fullPath);
        } catch (error) {
          console.error(`skipping note ${JSON.stringify(entry.name)}:`, error);
          continue;
        }
        notes.push({ file: entry.name, content, modifiedAt: await modifiedMillis(fullPath) });
      }
      return notes;
    },

    async read(file) {
      const fullPath = notePath(file);
      return { content: await readUtf8(fullPath), modifiedAt: await modifiedMillis(fullPath) };
    },

    async save(file, content) {
      const fullPath = notePath(file);
      await writeAtomic(fullPath, content);
      return { modifiedAt: await modifiedMillis(fullPath) };
    },

    async create(baseName, content) {
      assertValidBaseName(baseName);
      const { file, fullPath } = await reserveNoteFile(requireDir(), baseName);
      try {
        await writeAtomic(fullPath, content);
      } catch (error) {
        await fs.rm(fullPath, { force: true }).catch(() => {});
        throw error;
      }
      return { file, modifiedAt: await modifiedMillis(fullPath) };
    },

    async delete(file) {
      await options.trash(notePath(file));
    },
  };
}
