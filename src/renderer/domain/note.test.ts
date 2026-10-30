import { describe, expect, it } from 'vitest';
import { toLocalIsoString } from './dates';
import { isBlankBody, parseNote, serializeNote } from './note';

const created = new Date(2026, 9, 30, 12, 29, 5);
const updated = new Date(2026, 9, 30, 13, 2, 41);
const file = '2026-10-30_122905.md';

const fullNote = [
  '---',
  `created: ${toLocalIsoString(created)}`,
  `updated: ${toLocalIsoString(updated)}`,
  'title: Mercado',
  '---',
  'café, pão, ovos, banana',
  '',
  '- [ ] pagar a conta',
  '- [x] separar documentos',
  '',
].join('\n');

describe('parseNote', () => {
  it('reads every front matter field and the body', () => {
    const note = parseNote(file, fullNote);
    expect(note.meta).toEqual({ created, updated, title: 'Mercado', extra: {} });
    expect(note.body).toBe('café, pão, ovos, banana\n\n- [ ] pagar a conta\n- [x] separar documentos\n');
  });

  it('falls back to the file name date without front matter', () => {
    const modified = new Date(2026, 9, 31, 8, 0);
    const note = parseNote(file, 'só texto\n', modified);
    expect(note.meta.created).toEqual(created);
    expect(note.meta.updated).toEqual(modified);
    expect(note.meta.title).toBeNull();
    expect(note.body).toBe('só texto\n');
  });

  it('falls back to the file system date when the name has no date', () => {
    const modified = new Date(2026, 9, 31, 8, 0);
    const note = parseNote('ideias.md', 'texto', modified);
    expect(note.meta.created).toEqual(modified);
  });

  it('fills missing fields of a partial front matter', () => {
    const note = parseNote(file, '---\ntitle: Mercado\n---\ntexto\n');
    expect(note.meta.created).toEqual(created);
    expect(note.meta.updated).toEqual(created);
    expect(note.meta.title).toBe('Mercado');
  });

  it('keeps the removed pinned field as an unknown field', () => {
    const note = parseNote(file, '---\npinned: true\n---\ntexto\n');
    expect(note.meta.extra).toEqual({ pinned: true });
    expect(serializeNote(note)).toContain('pinned: true');
  });

  it('keeps unknown fields', () => {
    const note = parseNote(file, '---\ntags:\n  - casa\nsource: celular\n---\ntexto\n');
    expect(note.meta.extra).toEqual({ tags: ['casa'], source: 'celular' });
  });

  it('accepts CRLF and BOM', () => {
    const note = parseNote(file, `﻿${fullNote.replace(/\n/g, '\r\n')}`);
    expect(note.meta.title).toBe('Mercado');
    expect(note.body).toBe('café, pão, ovos, banana\n\n- [ ] pagar a conta\n- [x] separar documentos\n');
  });

  it('keeps invalid YAML in the body instead of dropping it', () => {
    const content = '---\ntitle: [sem fechar\n---\ntexto\n';
    const note = parseNote(file, content);
    expect(note.body).toBe(content);
    expect(note.meta.created).toEqual(created);
  });

  it('treats a horizontal rule at the top without closing as body', () => {
    const content = '---\ntexto depois de um divisor\n';
    expect(parseNote(file, content).body).toBe(content);
  });

  it('ignores an empty title', () => {
    expect(parseNote(file, "---\ntitle: '  '\n---\n").meta.title).toBeNull();
  });
});

describe('serializeNote', () => {
  it('round-trips a full note', () => {
    expect(serializeNote(parseNote(file, fullNote))).toBe(fullNote);
  });

  it('omits the title when unset', () => {
    const note = parseNote(file, fullNote);
    note.meta.title = null;
    const text = serializeNote(note);
    expect(text).not.toContain('title');
  });

  it('writes unknown fields back', () => {
    const original = '---\ntags:\n  - casa\n---\ntexto\n';
    const text = serializeNote(parseNote(file, original));
    expect(parseNote(file, text).meta.extra).toEqual({ tags: ['casa'] });
  });

  it('quotes titles that need it', () => {
    const note = parseNote(file, fullNote);
    note.meta.title = 'Reunião: prazos # e #orçamento';
    expect(parseNote(file, serializeNote(note)).meta.title).toBe('Reunião: prazos # e #orçamento');
  });

  it('does not lose a body that starts with a divider', () => {
    const note = parseNote(file, fullNote);
    note.body = '---\n\ntexto\n';
    expect(parseNote(file, serializeNote(note)).body).toBe('---\n\ntexto\n');
  });
});

describe('isBlankBody', () => {
  it('detects whitespace-only bodies', () => {
    expect(isBlankBody(' \n\t\n')).toBe(true);
    expect(isBlankBody('a')).toBe(false);
  });
});
