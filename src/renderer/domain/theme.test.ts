import { describe, expect, it } from 'vitest';
import { isTheme, resolveTheme } from './theme';

describe('resolveTheme', () => {
  it('follows Windows for "system"', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('keeps a forced theme whatever Windows uses', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('isTheme', () => {
  it('accepts only the three options', () => {
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('sepia')).toBe(false);
    expect(isTheme(1)).toBe(false);
  });
});
