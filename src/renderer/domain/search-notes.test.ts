import { describe, expect, it } from 'vitest';
import type { Note } from './note';
import { filterNotesByQuery, noteMatchesQuery } from './search-notes';

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

const lista = note(new Date(2026, 9, 30, 12, 29), { title: 'Lista de compras', body: 'leite e pão' });
const unnamed = note(new Date(2026, 9, 30, 9, 14), { body: 'Um app de notas' });

describe('noteMatchesQuery', () => {
  it('matches everything when the query is empty or blank', () => {
    expect(noteMatchesQuery(lista, '', now, 'pt')).toBe(true);
    expect(noteMatchesQuery(lista, '   ', now, 'pt')).toBe(true);
  });

  it('finds a custom title, ignoring case', () => {
    expect(noteMatchesQuery(lista, 'LISTA', now, 'pt')).toBe(true);
    expect(noteMatchesQuery(lista, 'compras', now, 'pt')).toBe(true);
  });

  it('finds text in the body', () => {
    expect(noteMatchesQuery(lista, 'pão', now, 'pt')).toBe(true);
    expect(noteMatchesQuery(unnamed, 'app de notas', now, 'pt')).toBe(true);
  });

  it('finds the date title of an unnamed note', () => {
    expect(noteMatchesQuery(unnamed, 'sex', now, 'pt')).toBe(true);
    expect(noteMatchesQuery(unnamed, '09:14', now, 'pt')).toBe(true);
  });

  it('misses a note that has none of the text', () => {
    expect(noteMatchesQuery(lista, 'xyz', now, 'pt')).toBe(false);
  });
});

describe('filterNotesByQuery', () => {
  it('keeps every note when the query is blank', () => {
    expect(filterNotesByQuery([lista, unnamed], '  ', now, 'pt')).toEqual([lista, unnamed]);
  });

  it('keeps only the notes that match, in the same order', () => {
    expect(filterNotesByQuery([lista, unnamed], 'leite', now, 'pt')).toEqual([lista]);
    expect(filterNotesByQuery([lista, unnamed], 'app', now, 'pt')).toEqual([unnamed]);
  });
});
