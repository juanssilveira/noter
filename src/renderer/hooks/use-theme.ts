import { useEffect } from 'react';
import { resolveTheme, type Theme } from '../domain/theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Puts the theme on <html> as data-theme (the dark tokens hang off it). */
export function applyDocumentTheme(theme: Theme): void {
  document.documentElement.dataset.theme = resolveTheme(theme, window.matchMedia(DARK_QUERY).matches);
}

/** Applies the theme and, for "system", follows Windows when it switches while the app is open (D39). */
export function useDocumentTheme(theme: Theme): void {
  useEffect(() => {
    applyDocumentTheme(theme);
    if (theme !== 'system') return;
    const query = window.matchMedia(DARK_QUERY);
    const onChange = () => applyDocumentTheme(theme);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [theme]);
}
