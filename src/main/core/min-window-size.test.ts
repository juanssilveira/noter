import { describe, expect, it } from 'vitest';
import { minWindowSize, sizeToGrowTo } from './min-window-size.js';

describe('minWindowSize', () => {
  it('is 720x480 with the sidebar closed', () => {
    expect(minWindowSize(false)).toEqual({ width: 720, height: 480 });
  });

  it('is 860x480 with the sidebar open', () => {
    expect(minWindowSize(true)).toEqual({ width: 860, height: 480 });
  });
});

describe('sizeToGrowTo', () => {
  const min = { width: 860, height: 480 };

  it('is null when the window is big enough', () => {
    expect(sizeToGrowTo({ width: 900, height: 500 }, min)).toBeNull();
    expect(sizeToGrowTo(min, min)).toBeNull();
  });

  it('grows only the smaller dimension', () => {
    expect(sizeToGrowTo({ width: 720, height: 700 }, min)).toEqual({ width: 860, height: 700 });
    expect(sizeToGrowTo({ width: 1000, height: 400 }, min)).toEqual({ width: 1000, height: 480 });
  });
});
