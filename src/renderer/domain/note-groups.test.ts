import { describe, expect, it } from 'vitest';
import type { Note } from './note';
import { groupNotes } from './note-groups';

const now = new Date(2026, 9, 30, 15, 0); // Fri, 30 Oct 2026

function note(created: Date): Note {
  return {
    file: `${created.getTime()}.md`,
    meta: { created, updated: created, title: null, extra: {} },
    body: '',
  };
}

describe('groupNotes', () => {
  it('groups by age, newest first, then by month', () => {
    const notes = [
      note(new Date(2026, 9, 1, 9, 0)), // 29 days ago
      note(new Date(2026, 9, 30, 12, 29)),
      note(new Date(2025, 11, 3)),
      note(new Date(2026, 9, 24, 11, 2)), // 6 days ago
      note(new Date(2026, 9, 29, 18, 3)),
      note(new Date(2026, 8, 30)), // 30 days ago
      note(new Date(2026, 9, 23, 20, 15)), // 7 days ago
      note(new Date(2026, 9, 28, 8, 0)), // 2 days ago
    ];

    const groups = groupNotes(notes, now);

    expect(groups.map(({ label, detail }) => [label, detail])).toEqual([
      ['Hoje', '30 out'],
      ['Ontem', '29 out'],
      ['Últimos 7 dias', '24 – 28 out'],
      ['Últimos 30 dias', '1 – 23 out'],
      ['Setembro', ''],
      ['Dezembro de 2025', ''],
    ]);
    expect(groups[2].notes.map((n) => n.meta.created.getDate())).toEqual([28, 24]);
    expect(groups[3].notes.map((n) => n.meta.created.getDate())).toEqual([23, 1]);
  });

  it('uses calendar days: last night is Ontem', () => {
    expect(groupNotes([note(new Date(2026, 9, 29, 23, 59))], now)[0].label).toBe('Ontem');
  });

  it('puts a creation date ahead of the clock in Hoje', () => {
    expect(groupNotes([note(new Date(2026, 9, 31, 10, 0))], now)[0].label).toBe('Hoje');
  });

  it('shows the years in ranges across years', () => {
    const january = new Date(2027, 0, 3, 12, 0);
    const groups = groupNotes([note(new Date(2026, 11, 30)), note(new Date(2026, 11, 20))], january);
    expect(groups.map(({ label, detail }) => [label, detail])).toEqual([
      ['Últimos 7 dias', '28 dez 2026 – 1 jan 2027'],
      ['Últimos 30 dias', '5 – 27 dez 2026'],
    ]);
  });

  it('labels the groups in English (D41)', () => {
    const notes = [note(new Date(2026, 9, 30, 12)), note(new Date(2026, 9, 29)), note(new Date(2026, 9, 26))];
    notes.push(note(new Date(2026, 9, 10)), note(new Date(2026, 8, 1)));
    expect(groupNotes(notes, now, 'en').map(({ label, detail }) => [label, detail])).toEqual([
      ['Today', 'Oct 30'],
      ['Yesterday', 'Oct 29'],
      ['Last 7 days', 'Oct 24 – 28'],
      ['Last 30 days', 'Oct 1 – 23'],
      ['September', ''],
    ]);
  });

  it('omits groups without notes', () => {
    expect(groupNotes([note(new Date(2026, 9, 30)), note(new Date(2026, 8, 1))], now)).toHaveLength(2);
  });
});
