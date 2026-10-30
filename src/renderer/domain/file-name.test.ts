import { describe, expect, it } from 'vitest';
import { dateFromFileName, noteBaseName } from './file-name';

describe('noteBaseName', () => {
  it('encodes the local creation time with seconds', () => {
    expect(noteBaseName(new Date(2026, 9, 30, 12, 29, 5))).toBe('2026-10-30_122905');
  });
});

describe('dateFromFileName', () => {
  it('reads the date back', () => {
    expect(dateFromFileName('2026-10-30_122905.md')).toEqual(new Date(2026, 9, 30, 12, 29, 5));
  });

  it('accepts a collision suffix', () => {
    expect(dateFromFileName('2026-10-30_122905_2.md')).toEqual(new Date(2026, 9, 30, 12, 29, 5));
  });

  it('rejects other names', () => {
    expect(dateFromFileName('mercado.md')).toBeNull();
    expect(dateFromFileName('2026-10-30_122905.txt')).toBeNull();
  });

  it('rejects impossible dates', () => {
    expect(dateFromFileName('2026-13-30_122905.md')).toBeNull();
    expect(dateFromFileName('2026-02-30_122905.md')).toBeNull();
  });
});
