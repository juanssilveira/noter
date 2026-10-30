// Window appearance (D39, D40): theme source and the native background behind the page.

import type { AppTheme } from '../../shared/noter-api.js';

/** `--ui-bg` of each theme in src/renderer/styles/tokens.css. */
export const BACKGROUND_LIGHT = '#FFFFFF';
export const BACKGROUND_DARK = '#181818';
/** With acrylic the page must let the material through. */
export const BACKGROUND_TRANSPARENT = '#00000000';

export function isAppTheme(value: unknown): value is AppTheme {
  return value === 'system' || value === 'light' || value === 'dark';
}

/** What shows behind the page: transparent for acrylic, else the theme's background (avoids a flash). */
export function windowBackground(acrylic: boolean, dark: boolean): string {
  if (acrylic) return BACKGROUND_TRANSPARENT;
  return dark ? BACKGROUND_DARK : BACKGROUND_LIGHT;
}
