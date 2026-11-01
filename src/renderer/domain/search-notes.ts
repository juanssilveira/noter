// Filter the sidebar list by a query. Spec: docs/behavior.md, "Busca".

import type { Locale } from './language';
import { noteListItemText } from './list-item';
import type { Note } from './note';

function fold(text: string): string {
  return text.toLowerCase();
}

/** True when the query is empty or it appears in the shown title, the preview or the body. */
export function noteMatchesQuery(note: Note, query: string, now: Date, locale: Locale): boolean {
  const needle = fold(query.trim());
  if (!needle) return true;
  const { title, preview } = noteListItemText(note, now, locale);
  return fold(title).includes(needle) || fold(preview).includes(needle) || fold(note.body).includes(needle);
}

/** Notes that match `query`, in the same order they came in. Empty or blank query returns all of them. */
export function filterNotesByQuery(notes: Note[], query: string, now: Date, locale: Locale): Note[] {
  const needle = query.trim();
  if (!needle) return notes;
  return notes.filter((note) => noteMatchesQuery(note, needle, now, locale));
}
