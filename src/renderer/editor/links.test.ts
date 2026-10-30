import { describe, expect, it } from 'vitest';
import { normalizeUrl } from './links';

describe('normalizeUrl', () => {
  it('keeps URLs with a scheme', () => {
    expect(normalizeUrl('https://example.com/a?b=1')).toBe('https://example.com/a?b=1');
    expect(normalizeUrl('mailto:ana@example.com')).toBe('mailto:ana@example.com');
  });

  it('adds https to bare domains', () => {
    expect(normalizeUrl('  example.com/docs ')).toBe('https://example.com/docs');
  });

  it('turns e-mail addresses into mailto', () => {
    expect(normalizeUrl('ana@example.com')).toBe('mailto:ana@example.com');
  });

  it('returns null for empty input', () => {
    expect(normalizeUrl('   ')).toBeNull();
  });
});
