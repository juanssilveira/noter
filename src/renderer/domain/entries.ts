// Pure helpers for the in-memory list of notes. Spec: docs/behavior.md, "Notas".

import { isBlankBody, type Note } from './note';
import { groupNotes } from './note-groups';

/** A note in memory. `id` is stable for the whole session, even when a draft gets its file. */
export type Entry = {
  id: string;
  note: Note;
  /** File modification time of the last read or write; null for a draft. */
  modifiedAt: number | null;
  /** Bumped when the note is reloaded from disk, so the editor remounts with the new content. */
  revision: number;
};

/** A draft has no file yet; it gets one on the first character (D10). */
export function isDraft(entry: Entry): boolean {
  return entry.note.file === '';
}

export function isBlankDraft(entry: Entry): boolean {
  return isDraft(entry) && isBlankBody(entry.note.body);
}

export function createDraftNote(now: Date): Note {
  return { file: '', meta: { created: now, updated: now, title: null, extra: {} }, body: '' };
}

/** Entries in the order the sidebar shows them: by group, newest first. */
export function sidebarOrder(entries: Entry[], now: Date = new Date()): Entry[] {
  const byNote = new Map(entries.map((entry) => [entry.note, entry]));
  const groups = groupNotes(
    entries.map((entry) => entry.note),
    now,
  );
  return groups.flatMap((group) => group.notes).map((note) => byNote.get(note)!);
}

/** Note to open after `removedId` is deleted: the one below it in the sidebar, else the one above. */
export function neighborAfterRemoval(entries: Entry[], removedId: string, now: Date = new Date()): Entry | null {
  const order = sidebarOrder(entries, now);
  const index = order.findIndex((entry) => entry.id === removedId);
  if (index === -1) return null;
  return order[index + 1] ?? order[index - 1] ?? null;
}
