// The only place that talks to the note I/O of the main process (src/main/notes-files.ts).

import type { NoteFileDto } from '../../shared/noter-api';
import { noteBaseName } from '../domain/file-name';
import { type Note, parseNote, serializeNote } from '../domain/note';
import { platform } from './platform';

/** A note as read from disk, with the file time used to detect external changes (D08). */
export type LoadedNote = {
  note: Note;
  /** File modification time, in milliseconds since the epoch. */
  modifiedAt: number;
};

function toLoadedNote({ file, content, modifiedAt }: NoteFileDto): LoadedNote {
  return { note: parseNote(file, content, new Date(modifiedAt)), modifiedAt };
}

/** Opens the notes folder (`path` from the settings, or `Documentos\Notas`) and returns its full path. */
export function openNotesDir(path: string | null): Promise<string> {
  return platform.notes.openDir(path);
}

export async function listNotes(): Promise<LoadedNote[]> {
  const files = await platform.notes.list();
  return files.map(toLoadedNote);
}

export async function readNote(file: string): Promise<LoadedNote> {
  const { content, modifiedAt } = await platform.notes.read(file);
  return toLoadedNote({ file, content, modifiedAt });
}

/** Saves an existing note atomically and returns the new file modification time. */
export async function saveNote(note: Note): Promise<number> {
  const { modifiedAt } = await platform.notes.save(note.file, serializeNote(note));
  return modifiedAt;
}

/** Creates the file of a draft. The file name comes from the creation time, with a suffix on collision. */
export async function createNote(draft: Omit<Note, 'file'>): Promise<LoadedNote> {
  const note: Note = { ...draft, file: '' };
  const { file, modifiedAt } = await platform.notes.create(noteBaseName(draft.meta.created), serializeNote(note));
  return { note: { ...note, file }, modifiedAt };
}

/** Sends the note to the Windows Recycle Bin. */
export function deleteNote(file: string): Promise<void> {
  return platform.notes.delete(file);
}
