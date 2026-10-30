import { describe, expect, it } from 'vitest';
import { noteListItemText } from './list-item';
import type { Note } from './note';

const now = new Date(2026, 9, 30, 15, 0); // Fri, 30 Oct 2026

function note(created: Date, options: { title?: string; body?: string } = {}): Note {
  return {
    file: `${created.getTime()}.md`,
    meta: {
      created,
      updated: created,
      title: options.title ?? null,
      extra: {},
    },
    body: options.body ?? '',
  };
}

describe('noteListItemText', () => {
  it('uses the date as title and the body as preview', () => {
    const item = noteListItemText(note(new Date(2026, 9, 30, 12, 29), { body: 'Um app de notas' }), now);
    expect(item).toEqual({ title: 'Sex, 30 out · 12:29', preview: 'Um app de notas' });
  });

  it('prefixes the preview with weekday and time for renamed notes', () => {
    const item = noteListItemText(
      note(new Date(2026, 9, 30, 9, 14), { title: 'Ligar pro contador', body: 'amanhã às 10h' }),
      now,
    );
    expect(item).toEqual({ title: 'Ligar pro contador', preview: 'Sex 09:14 · amanhã às 10h' });
  });

  it('drops the separator for a renamed note without text', () => {
    const item = noteListItemText(note(new Date(2026, 9, 30, 9, 14), { title: 'Ideias' }), now);
    expect(item).toEqual({ title: 'Ideias', preview: 'Sex 09:14' });
  });

  it('has no preview for an unnamed note without text', () => {
    expect(noteListItemText(note(new Date(2026, 9, 30, 9, 14)), now).preview).toBe('');
  });
});
