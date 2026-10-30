// Date formats shown in the UI, in Portuguese and English (D41). Spec: docs/note-format.md,
// "Formatos de data na interface". English is US style (month first) with a 24 h clock.
// Rule for every format: the year is shown only when it is not the current one.

import type { Locale } from './language';

type Names = { weekdays: string[]; months: string[]; monthsShort: string[] };

const NAMES: Record<Locale, Names> = {
  pt: {
    weekdays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    months: [
      'janeiro',
      'fevereiro',
      'março',
      'abril',
      'maio',
      'junho',
      'julho',
      'agosto',
      'setembro',
      'outubro',
      'novembro',
      'dezembro',
    ],
    monthsShort: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  },
  en: {
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
};

const pad = (value: number) => String(value).padStart(2, '0');

function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isCurrentYear(date: Date, now: Date): boolean {
  return date.getFullYear() === now.getFullYear();
}

/** Note header: "Sex, 30 de outubro · 12:29" / "Fri, October 30 · 12:29". */
export function formatHeaderDate(date: Date, now: Date = new Date(), locale: Locale = 'pt'): string {
  const { weekdays, months } = NAMES[locale];
  const current = isCurrentYear(date, now);
  const weekday = weekdays[date.getDay()];
  const day =
    locale === 'en'
      ? `${weekday}, ${months[date.getMonth()]} ${date.getDate()}${current ? '' : `, ${date.getFullYear()}`}`
      : `${weekday}, ${date.getDate()} de ${months[date.getMonth()]}${current ? '' : ` de ${date.getFullYear()}`}`;
  return `${day} · ${formatTime(date)}`;
}

/** Default note title in the list: "Sex, 30 out · 12:29" / "Fri, Oct 30 · 12:29". */
export function formatListTitleDate(date: Date, now: Date = new Date(), locale: Locale = 'pt'): string {
  return `${NAMES[locale].weekdays[date.getDay()]}, ${formatShortDate(date, now, locale)} · ${formatTime(date)}`;
}

/** Preview prefix for renamed notes: "Sex 09:14 · " / "Fri 09:14 · ". */
export function formatPreviewPrefix(date: Date, locale: Locale = 'pt'): string {
  return `${NAMES[locale].weekdays[date.getDay()]} ${formatTime(date)} · `;
}

/** Single day in a group header: "30 out", "30 out 2025" / "Oct 30", "Oct 30, 2025". */
export function formatShortDate(date: Date, now: Date = new Date(), locale: Locale = 'pt'): string {
  const month = NAMES[locale].monthsShort[date.getMonth()];
  const current = isCurrentYear(date, now);
  if (locale === 'en') return `${month} ${date.getDate()}${current ? '' : `, ${date.getFullYear()}`}`;
  return `${date.getDate()} ${month}${current ? '' : ` ${date.getFullYear()}`}`;
}

/**
 * Day range in a group header. Portuguese: "24 – 28 out", "26 out – 1 nov", "29 dez 2025 – 4 jan 2026".
 * English: "Oct 24 – 28", "Oct 26 – Nov 1", "Dec 29, 2025 – Jan 4, 2026".
 */
export function formatDateRange(start: Date, end: Date, now: Date = new Date(), locale: Locale = 'pt'): string {
  const { monthsShort } = NAMES[locale];
  const startMonth = monthsShort[start.getMonth()];
  const endMonth = monthsShort[end.getMonth()];
  const sameMonth = start.getMonth() === end.getMonth();

  if (locale === 'en') {
    if (start.getFullYear() !== end.getFullYear()) {
      return `${startMonth} ${start.getDate()}, ${start.getFullYear()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
    }
    const year = isCurrentYear(end, now) ? '' : `, ${end.getFullYear()}`;
    const endDay = sameMonth ? `${end.getDate()}` : `${endMonth} ${end.getDate()}`;
    return `${startMonth} ${start.getDate()} – ${endDay}${year}`;
  }

  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.getDate()} ${startMonth} ${start.getFullYear()} – ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
  }
  const year = isCurrentYear(end, now) ? '' : ` ${end.getFullYear()}`;
  if (sameMonth) return `${start.getDate()} – ${end.getDate()} ${endMonth}${year}`;
  return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth}${year}`;
}

/** Local ISO 8601 with offset, as stored in the front matter: "2026-10-30T12:29:05-03:00". */
export function toLocalIsoString(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const offset = Math.abs(offsetMinutes);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(offset / 60))}:${pad(offset % 60)}`
  );
}

/** Month group label: "Setembro", "Dezembro de 2025" / "September", "December 2025". */
export function formatMonthLabel(date: Date, now: Date = new Date(), locale: Locale = 'pt'): string {
  const month = NAMES[locale].months[date.getMonth()];
  const capitalized = `${month[0].toUpperCase()}${month.slice(1)}`;
  if (isCurrentYear(date, now)) return capitalized;
  return locale === 'en' ? `${capitalized} ${date.getFullYear()}` : `${capitalized} de ${date.getFullYear()}`;
}

/** 00:00 (local time) of the day containing `date`. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Calendar days from `from` to `to` (local time): 0 on the same day, 1 from yesterday to today. */
export function daysBetween(from: Date, to: Date): number {
  // Rounded, because a day across a DST change is 23 or 25 hours long.
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
