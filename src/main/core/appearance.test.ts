import { describe, expect, it } from 'vitest';
import { isAppTheme, windowBackground } from './appearance.js';

describe('isAppTheme', () => {
  it('accepts the three themes and nothing else', () => {
    expect(isAppTheme('system')).toBe(true);
    expect(isAppTheme('light')).toBe(true);
    expect(isAppTheme('dark')).toBe(true);
    expect(isAppTheme('blue')).toBe(false);
    expect(isAppTheme(null)).toBe(false);
  });
});

describe('windowBackground', () => {
  it('is transparent with acrylic, whatever the theme', () => {
    expect(windowBackground(true, false)).toBe('#00000000');
    expect(windowBackground(true, true)).toBe('#00000000');
  });

  it('matches --ui-bg of the theme without acrylic', () => {
    expect(windowBackground(false, false)).toBe('#FFFFFF');
    expect(windowBackground(false, true)).toBe('#181818');
  });
});
