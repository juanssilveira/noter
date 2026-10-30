import { describe, expect, it } from 'vitest';
import { isVisibleOnSomeDisplay, parseWindowState, resolveSavedBounds } from './window-bounds.js';

const screen = { x: 0, y: 0, width: 1920, height: 1040 };
const min = { width: 720, height: 480 };

describe('parseWindowState', () => {
  it('accepts valid state', () => {
    expect(parseWindowState({ bounds: { x: 1, y: 2, width: 800, height: 600 }, maximized: true })).toEqual({
      bounds: { x: 1, y: 2, width: 800, height: 600 },
      maximized: true,
    });
  });

  it('treats a missing maximized flag as false', () => {
    expect(parseWindowState({ bounds: { x: 0, y: 0, width: 800, height: 600 } })?.maximized).toBe(false);
  });

  it.each([
    null,
    1,
    'x',
    {},
    { bounds: null },
    { bounds: { x: 0, y: 0, width: 0, height: 5 } },
    { bounds: { x: 'a', y: 0, width: 1, height: 1 } },
    { bounds: { x: Number.NaN, y: 0, width: 1, height: 1 } },
  ])('rejects %j', (raw) => {
    expect(parseWindowState(raw)).toBeNull();
  });
});

describe('isVisibleOnSomeDisplay', () => {
  it('is true inside a display', () => {
    expect(isVisibleOnSomeDisplay({ x: 100, y: 100, width: 800, height: 600 }, [screen])).toBe(true);
  });

  it('is false when the display is gone', () => {
    expect(isVisibleOnSomeDisplay({ x: 2500, y: 100, width: 800, height: 600 }, [screen])).toBe(false);
  });

  it('is false when only a sliver overlaps', () => {
    expect(isVisibleOnSomeDisplay({ x: 1900, y: 100, width: 800, height: 600 }, [screen])).toBe(false);
  });

  it('works with a display at negative coordinates', () => {
    const left = { x: -1920, y: 0, width: 1920, height: 1040 };
    expect(isVisibleOnSomeDisplay({ x: -1500, y: 50, width: 800, height: 600 }, [screen, left])).toBe(true);
  });
});

describe('resolveSavedBounds', () => {
  it('returns null without saved state', () => {
    expect(resolveSavedBounds(null, [screen], min)).toBeNull();
  });

  it('returns null when off screen', () => {
    const saved = { bounds: { x: 5000, y: 0, width: 800, height: 600 }, maximized: false };
    expect(resolveSavedBounds(saved, [screen], min)).toBeNull();
  });

  it('enforces the minimum size', () => {
    const saved = { bounds: { x: 10, y: 10, width: 300, height: 200 }, maximized: false };
    expect(resolveSavedBounds(saved, [screen], min)).toEqual({ x: 10, y: 10, width: 720, height: 480 });
  });
});
