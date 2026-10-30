import { describe, expect, it } from 'vitest';
import { isAllowedExternalUrl, isAppUrl } from './external-url.js';

describe('isAllowedExternalUrl', () => {
  it.each(['http://a.com', 'https://a.com/x?y=1', 'mailto:a@b.com'])('allows %s', (url) => {
    expect(isAllowedExternalUrl(url)).toBe(true);
  });

  it.each(['file:///C:/x.exe', 'javascript:alert(1)', 'data:text/html,hi', 'ms-settings:', 'nope', ''])(
    'rejects %s',
    (url) => {
      expect(isAllowedExternalUrl(url)).toBe(false);
    },
  );
});

describe('isAppUrl', () => {
  it('matches the dev server origin', () => {
    expect(isAppUrl('http://localhost:5173/x', 'http://localhost:5173/')).toBe(true);
    expect(isAppUrl('http://evil.com/', 'http://localhost:5173/')).toBe(false);
    expect(isAppUrl('http://localhost:5174/', 'http://localhost:5173/')).toBe(false);
  });

  it('matches only the app file for file URLs', () => {
    const app = 'file:///C:/app/dist/index.html';
    expect(isAppUrl('file:///C:/app/dist/index.html#x', app)).toBe(true);
    expect(isAppUrl('file:///C:/secret.txt', app)).toBe(false);
  });

  it('rejects garbage', () => {
    expect(isAppUrl('nope', 'http://localhost:5173/')).toBe(false);
  });
});
