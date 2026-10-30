import { describe, expect, it } from 'vitest';
import {
  daysBetween,
  formatDateRange,
  formatHeaderDate,
  formatListTitleDate,
  formatMonthLabel,
  formatPreviewPrefix,
  formatShortDate,
  toLocalIsoString,
} from './dates';

const now = new Date(2026, 9, 30, 15, 0); // Fri, 30 Oct 2026

describe('formatHeaderDate', () => {
  it('formats a date in the current year without the year', () => {
    expect(formatHeaderDate(new Date(2026, 9, 30, 12, 29), now)).toBe('Sex, 30 de outubro · 12:29');
  });

  it('pads hours and minutes', () => {
    expect(formatHeaderDate(new Date(2026, 2, 1, 8, 5), now)).toBe('Dom, 1 de março · 08:05');
  });

  it('shows the year when it is not the current one', () => {
    expect(formatHeaderDate(new Date(2025, 11, 31, 23, 59), now)).toBe('Qua, 31 de dezembro de 2025 · 23:59');
  });
});

describe('formatListTitleDate', () => {
  it('uses the short month', () => {
    expect(formatListTitleDate(new Date(2026, 9, 30, 12, 29), now)).toBe('Sex, 30 out · 12:29');
  });

  it('shows the year when it is not the current one', () => {
    expect(formatListTitleDate(new Date(2025, 4, 3, 9, 0), now)).toBe('Sáb, 3 mai 2025 · 09:00');
  });
});

describe('formatPreviewPrefix', () => {
  it('formats weekday and time', () => {
    expect(formatPreviewPrefix(new Date(2026, 9, 30, 9, 14))).toBe('Sex 09:14 · ');
  });
});

describe('formatDateRange', () => {
  it('shows the month once inside the same month', () => {
    expect(formatDateRange(new Date(2026, 9, 19), new Date(2026, 9, 25), now)).toBe('19 – 25 out');
  });

  it('shows both months across months', () => {
    expect(formatDateRange(new Date(2026, 9, 26), new Date(2026, 10, 1), now)).toBe('26 out – 1 nov');
  });

  it('shows the year for a past year', () => {
    expect(formatDateRange(new Date(2025, 9, 20), new Date(2025, 9, 26), now)).toBe('20 – 26 out 2025');
  });

  it('shows both years across years', () => {
    expect(formatDateRange(new Date(2025, 11, 29), new Date(2026, 0, 4), now)).toBe('29 dez 2025 – 4 jan 2026');
  });
});

describe('formatShortDate', () => {
  it('formats day and short month', () => {
    expect(formatShortDate(new Date(2026, 9, 30), now)).toBe('30 out');
  });

  it('shows the year when it is not the current one', () => {
    expect(formatShortDate(new Date(2025, 9, 30), now)).toBe('30 out 2025');
  });
});

describe('formatMonthLabel', () => {
  it('capitalizes the month', () => {
    expect(formatMonthLabel(new Date(2026, 8, 12), now)).toBe('Setembro');
  });

  it('shows the year when it is not the current one', () => {
    expect(formatMonthLabel(new Date(2025, 11, 3), now)).toBe('Dezembro de 2025');
  });
});

describe('daysBetween', () => {
  it('counts calendar days, not 24 h periods', () => {
    expect(daysBetween(new Date(2026, 9, 29, 23, 59), new Date(2026, 9, 30, 0, 1))).toBe(1);
    expect(daysBetween(new Date(2026, 9, 30, 0, 1), new Date(2026, 9, 30, 23, 59))).toBe(0);
  });

  it('crosses months and years', () => {
    expect(daysBetween(new Date(2025, 11, 31), new Date(2026, 0, 1))).toBe(1);
  });
});

describe('toLocalIsoString', () => {
  it('round-trips through Date', () => {
    const date = new Date(2026, 9, 30, 12, 29, 5);
    const iso = toLocalIsoString(date);
    expect(iso).toMatch(/^2026-10-30T12:29:05[+-]\d{2}:\d{2}$/);
    expect(new Date(iso).getTime()).toBe(date.getTime());
  });
});

describe('English formats (D41)', () => {
  it('puts the month first in the header and the list title', () => {
    expect(formatHeaderDate(new Date(2026, 9, 30, 12, 29), now, 'en')).toBe('Fri, October 30 · 12:29');
    expect(formatHeaderDate(new Date(2025, 11, 31, 23, 59), now, 'en')).toBe('Wed, December 31, 2025 · 23:59');
    expect(formatListTitleDate(new Date(2026, 9, 30, 17, 51), now, 'en')).toBe('Fri, Oct 30 · 17:51');
    expect(formatListTitleDate(new Date(2025, 4, 3, 9, 0), now, 'en')).toBe('Sat, May 3, 2025 · 09:00');
  });

  it('uses English weekdays in the preview prefix', () => {
    expect(formatPreviewPrefix(new Date(2026, 9, 30, 9, 14), 'en')).toBe('Fri 09:14 · ');
  });

  it('formats days and ranges month first', () => {
    expect(formatShortDate(new Date(2026, 9, 30), now, 'en')).toBe('Oct 30');
    expect(formatDateRange(new Date(2026, 9, 24), new Date(2026, 9, 28), now, 'en')).toBe('Oct 24 – 28');
    expect(formatDateRange(new Date(2026, 9, 26), new Date(2026, 10, 1), now, 'en')).toBe('Oct 26 – Nov 1');
    expect(formatDateRange(new Date(2025, 9, 20), new Date(2025, 9, 26), now, 'en')).toBe('Oct 20 – 26, 2025');
    expect(formatDateRange(new Date(2025, 11, 29), new Date(2026, 0, 4), now, 'en')).toBe('Dec 29, 2025 – Jan 4, 2026');
  });

  it('names months in English', () => {
    expect(formatMonthLabel(new Date(2026, 8, 12), now, 'en')).toBe('September');
    expect(formatMonthLabel(new Date(2025, 11, 3), now, 'en')).toBe('December 2025');
  });
});
