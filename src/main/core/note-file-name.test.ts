import { describe, expect, it } from 'vitest';
import {
  assertValidBaseName,
  assertValidNoteFileName,
  isListableNoteName,
  isValidNoteFileName,
  noteFileCandidate,
} from './note-file-name.js';

describe('isValidNoteFileName', () => {
  it('accepts plain note names', () => {
    expect(isValidNoteFileName('2026-10-30_122905.md')).toBe(true);
    expect(isValidNoteFileName('ideias.md')).toBe(true);
  });

  it('rejects paths and other files', () => {
    for (const file of [
      '',
      '.md',
      '.hidden.md',
      '../fora.md',
      'pasta/nota.md',
      'pasta\\nota.md',
      'C:nota.md',
      'nota.txt',
      'nota.md.tmp',
    ]) {
      expect(isValidNoteFileName(file), file).toBe(false);
    }
  });
});

describe('assertions', () => {
  it('throws a message naming the file', () => {
    expect(() => assertValidNoteFileName('../x.md')).toThrow('invalid note file name: "../x.md"');
    expect(() => assertValidBaseName('a/b')).toThrow('invalid note file name');
    expect(() => assertValidBaseName('')).toThrow('invalid note file name');
    expect(() => assertValidBaseName('ok')).not.toThrow();
  });
});

describe('noteFileCandidate', () => {
  it('adds a numeric suffix after the first attempt', () => {
    expect([1, 2, 3].map((attempt) => noteFileCandidate('2026-10-30_122905', attempt))).toEqual([
      '2026-10-30_122905.md',
      '2026-10-30_122905_2.md',
      '2026-10-30_122905_3.md',
    ]);
  });
});

describe('isListableNoteName', () => {
  it('skips hidden, temporary and non-markdown names', () => {
    expect(isListableNoteName('a.md')).toBe(true);
    expect(isListableNoteName('b.md.tmp')).toBe(false);
    expect(isListableNoteName('.oculta.md')).toBe(false);
    expect(isListableNoteName('c.txt')).toBe(false);
  });
});
