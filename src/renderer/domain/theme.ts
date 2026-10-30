// Light and dark themes (D39). "system" follows Windows.

import type { AppTheme } from '../../shared/noter-api';

export type Theme = AppTheme;
export type ResolvedTheme = 'light' | 'dark';

/** All the options; the names are in i18n/strings.ts. */
export const THEMES: Theme[] = ['system', 'light', 'dark'];

export function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

export function resolveTheme(theme: Theme, systemPrefersDark: boolean): ResolvedTheme {
  if (theme === 'system') return systemPrefersDark ? 'dark' : 'light';
  return theme;
}
