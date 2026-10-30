// Text of a note in the sidebar list. Spec: docs/behavior.md, "Item da lista".

import { formatListTitleDate, formatPreviewPrefix } from './dates';
import type { Locale } from './language';
import type { Note } from './note';
import { notePreview } from './preview';

export type ListItemText = {
  title: string;
  preview: string;
};

export function noteListItemText(note: Note, now: Date = new Date(), locale: Locale = 'pt'): ListItemText {
  const { created, title } = note.meta;
  const preview = notePreview(note.body);

  if (title === null) {
    return { title: formatListTitleDate(created, now, locale), preview };
  }
  // Renamed notes keep weekday and time in the preview; without text there's nothing after the "·".
  const prefix = formatPreviewPrefix(created, locale);
  return { title, preview: preview ? prefix + preview : prefix.replace(/ · $/, '') };
}
