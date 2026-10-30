import { describe, expect, it } from 'vitest';
import { clampSidebarWidth } from './sidebar-width';

describe('clampSidebarWidth', () => {
  it('keeps a width inside the limits', () => {
    expect(clampSidebarWidth(320)).toBe(320);
  });

  it('stops at the minimum and the maximum', () => {
    expect(clampSidebarWidth(100)).toBe(240);
    expect(clampSidebarWidth(900)).toBe(400);
  });

  it('rounds to whole pixels', () => {
    expect(clampSidebarWidth(300.6)).toBe(301);
  });

  it('leaves the note area at least 560 px', () => {
    expect(clampSidebarWidth(400, 900)).toBe(340);
  });

  it('never goes below the minimum, even in a narrow window', () => {
    expect(clampSidebarWidth(400, 700)).toBe(240);
  });
});
