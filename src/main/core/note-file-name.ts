// Note file names inside the notes folder. Same rules the Tauri version had.

export const NOTE_EXTENSION = '.md';
export const TEMP_SUFFIX = '.tmp';

/** A note is addressed by a plain file name inside the notes folder: no paths, no hidden files. */
export function isValidNoteFileName(file: string): boolean {
  return (
    file.endsWith(NOTE_EXTENSION) &&
    file.length > NOTE_EXTENSION.length &&
    !file.startsWith('.') &&
    !/[/\\:]/.test(file) &&
    !file.includes('..')
  );
}

/** Throws when `file` is not a plain note file name. */
export function assertValidNoteFileName(file: string): void {
  if (!isValidNoteFileName(file)) throw new Error(`invalid note file name: ${JSON.stringify(file)}`);
}

/** Throws when `<baseName>.md` is not a plain note file name. */
export function assertValidBaseName(baseName: string): void {
  assertValidNoteFileName(`${baseName}${NOTE_EXTENSION}`);
}

/** `<base>.md` for the first attempt, then `<base>_2.md`, `<base>_3.md`… (attempt starts at 1). */
export function noteFileCandidate(baseName: string, attempt: number): string {
  return attempt <= 1 ? `${baseName}${NOTE_EXTENSION}` : `${baseName}_${attempt}${NOTE_EXTENSION}`;
}

/** Whether a directory entry name is a listable note (hidden, `.tmp` and other extensions are not). */
export function isListableNoteName(name: string): boolean {
  return isValidNoteFileName(name);
}
