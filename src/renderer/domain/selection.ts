import type { Note } from './note';

/** Note to open at startup (D12): the last opened one if it still exists, else the newest. */
export function pickInitialNote(notes: Note[], lastNote: string | null): Note | null {
  const last = lastNote ? notes.find((note) => note.file === lastNote) : undefined;
  if (last) return last;

  let newest: Note | null = null;
  for (const note of notes) {
    if (!newest || note.meta.created > newest.meta.created) newest = note;
  }
  return newest;
}
