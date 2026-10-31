import { describe, expect, it } from 'vitest';
import { clampNoteZoom, stepNoteZoom } from './note-zoom';

describe('clampNoteZoom', () => {
  it('keeps a zoom inside the limits', () => {
    expect(clampNoteZoom(1.3)).toBe(1.3);
  });

  it('stops at 80% and 150%', () => {
    expect(clampNoteZoom(0.2)).toBe(0.8);
    expect(clampNoteZoom(5)).toBe(1.5);
  });

  it('snaps to a 10% step and falls back to 100% on garbage', () => {
    expect(clampNoteZoom(1.26)).toBe(1.3);
    expect(clampNoteZoom(Number.NaN)).toBe(1);
  });
});

describe('stepNoteZoom', () => {
  it('goes 10% at a time, without floating point tails', () => {
    expect(stepNoteZoom(1.1, 1)).toBe(1.2);
    expect(stepNoteZoom(1, -1)).toBe(0.9);
  });

  it('stops at the limits', () => {
    expect(stepNoteZoom(1.5, 1)).toBe(1.5);
    expect(stepNoteZoom(0.8, -1)).toBe(0.8);
  });
});
