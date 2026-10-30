import { type Locale, resolveLanguage } from '../domain/language';
import { useAppStore } from '../state/app-store';
import { STRINGS, type Strings } from './strings';

/** The interface language in use: the chosen one, or the Windows display language for "Sistema" (D41). */
export function useLocale(): Locale {
  const language = useAppStore((state) => state.language);
  // In Electron, navigator.language is the Windows display language.
  return resolveLanguage(language, navigator.language);
}

export function useStrings(): Strings {
  return STRINGS[useLocale()];
}
