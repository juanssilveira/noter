import { describe, expect, it } from 'vitest';
import { isLanguage, resolveLanguage } from './language';

describe('resolveLanguage', () => {
  it('follows Windows for "system": Portuguese for any pt-*, English otherwise', () => {
    expect(resolveLanguage('system', 'pt-BR')).toBe('pt');
    expect(resolveLanguage('system', 'pt-PT')).toBe('pt');
    expect(resolveLanguage('system', 'en-US')).toBe('en');
    expect(resolveLanguage('system', 'es-ES')).toBe('en');
  });

  it('keeps a chosen language whatever Windows uses', () => {
    expect(resolveLanguage('en', 'pt-BR')).toBe('en');
    expect(resolveLanguage('pt', 'de-DE')).toBe('pt');
  });
});

describe('isLanguage', () => {
  it('accepts only the three options', () => {
    expect(isLanguage('en')).toBe(true);
    expect(isLanguage('fr')).toBe(false);
    expect(isLanguage(undefined)).toBe(false);
  });
});
