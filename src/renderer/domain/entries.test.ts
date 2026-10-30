import { describe, expect, it } from 'vitest';
import { createDraftNote, type Entry, isBlankDraft, isDraft, neighborAfterRemoval, sidebarOrder } from './entries';

const now = new Date(2026, 9, 30, 15, 0);

function entry(id: string, created: Date, options: { file?: string; body?: string } = {}): Entry {
  return {
    id,
    note: {
      file: options.file ?? `${id}.md`,
      meta: { created, updated: created, title: null, extra: {} },
      body: options.body ?? 'texto',
    },
    modifiedAt: 0,
    revision: 0,
  };
}

const a = entry('a', new Date(2026, 9, 30, 12));
const b = entry('b', new Date(2026, 9, 29, 12));
const c = entry('c', new Date(2026, 9, 20, 12));

describe('drafts', () => {
  it('are entries without a file', () => {
    const draft: Entry = { id: 'd', note: createDraftNote(now), modifiedAt: null, revision: 0 };
    expect(isDraft(draft)).toBe(true);
    expect(isBlankDraft(draft)).toBe(true);
    expect(isDraft(a)).toBe(false);
    expect(isBlankDraft({ ...draft, note: { ...draft.note, body: 'x' } })).toBe(false);
  });
});

describe('sidebarOrder', () => {
  it('lists newest first', () => {
    expect(sidebarOrder([c, a, b], now).map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('neighborAfterRemoval', () => {
  it('picks the note below', () => {
    expect(neighborAfterRemoval([a, b, c], 'a', now)?.id).toBe('b');
  });

  it('picks the note above when the removed one is last', () => {
    expect(neighborAfterRemoval([a, b, c], 'c', now)?.id).toBe('b');
  });

  it('follows the sidebar order across groups', () => {
    expect(neighborAfterRemoval([c, a, b], 'b', now)?.id).toBe('c');
  });

  it('returns null when nothing is left', () => {
    expect(neighborAfterRemoval([a], 'a', now)).toBeNull();
  });
});
