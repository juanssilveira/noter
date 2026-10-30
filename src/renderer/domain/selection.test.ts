import { describe, expect, it } from 'vitest';
import type { Note } from './note';
import { pickInitialNote } from './selection';

function note(file: string, created: Date): Note {
  return { file, meta: { created, updated: created, title: null, extra: {} }, body: '' };
}

const older = note('a.md', new Date(2026, 9, 1));
const newer = note('b.md', new Date(2026, 9, 30));

describe('pickInitialNote', () => {
  it('opens the last opened note', () => {
    expect(pickInitialNote([older, newer], 'a.md')).toBe(older);
  });

  it('falls back to the newest note when the last one is gone', () => {
    expect(pickInitialNote([older, newer], 'apagada.md')).toBe(newer);
    expect(pickInitialNote([older, newer], null)).toBe(newer);
  });

  it('returns null without notes', () => {
    expect(pickInitialNote([], 'a.md')).toBeNull();
  });
});
