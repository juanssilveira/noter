// Sidebar grouping by creation date (D16): Hoje, Ontem, Últimos 7 dias, Últimos 30 dias, then one
// group per month. Groups never overlap: "Últimos 7 dias" starts after Ontem, and so on.

import { STRINGS } from '../i18n/strings';
import { addDays, daysBetween, formatDateRange, formatMonthLabel, formatShortDate, startOfDay } from './dates';
import type { Locale } from './language';
import type { Note } from './note';

export type NoteGroup = {
  /** Stable React key: "today", "yesterday", "last-7-days", "last-30-days" or "AAAA-MM". */
  key: string;
  /** Left side of the group header. */
  label: string;
  /** Right side: the day or range the group covers; empty for months. */
  detail: string;
  notes: Note[];
};

type GroupHeader = Omit<NoteGroup, 'notes'>;

const byNewestCreated = (a: Note, b: Note) => b.meta.created.getTime() - a.meta.created.getTime();

function headerFor(created: Date, now: Date, locale: Locale): GroupHeader {
  const strings = STRINGS[locale];
  const today = startOfDay(now);
  const age = daysBetween(created, today);
  // A creation date ahead of the clock (another machine, a hand edit) counts as today.
  if (age <= 0) return { key: 'today', label: strings.today, detail: formatShortDate(today, now, locale) };
  if (age === 1) {
    return { key: 'yesterday', label: strings.yesterday, detail: formatShortDate(addDays(today, -1), now, locale) };
  }
  if (age <= 6) {
    return {
      key: 'last-7-days',
      label: strings.last7Days,
      detail: formatDateRange(addDays(today, -6), addDays(today, -2), now, locale),
    };
  }
  if (age <= 29) {
    return {
      key: 'last-30-days',
      label: strings.last30Days,
      detail: formatDateRange(addDays(today, -29), addDays(today, -7), now, locale),
    };
  }
  const month = String(created.getMonth() + 1).padStart(2, '0');
  return { key: `${created.getFullYear()}-${month}`, label: formatMonthLabel(created, now, locale), detail: '' };
}

/** Groups newest first; groups without notes are left out. The order does not depend on `locale`. */
export function groupNotes(notes: Note[], now: Date = new Date(), locale: Locale = 'pt'): NoteGroup[] {
  const groups: NoteGroup[] = [];
  for (const note of [...notes].sort(byNewestCreated)) {
    const header = headerFor(note.meta.created, now, locale);
    let group = groups[groups.length - 1];
    if (!group || group.key !== header.key) {
      group = { ...header, notes: [] };
      groups.push(group);
    }
    group.notes.push(note);
  }
  return groups;
}
