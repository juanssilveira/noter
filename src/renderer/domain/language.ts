// Interface language (D41). "system" follows the Windows display language: Portuguese for pt-*,
// English for anything else.

export type Language = 'system' | 'pt' | 'en';
export type Locale = 'pt' | 'en';

/** All the options. */
export const LANGUAGES: Language[] = ['system', 'pt', 'en'];

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language);
}

/** `systemLocale` is the Windows display language as a BCP 47 tag, like "pt-BR" or "en-US". */
export function resolveLanguage(language: Language, systemLocale: string): Locale {
  if (language !== 'system') return language;
  return systemLocale.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}
