import { describe, expect, it } from 'vitest';
import { notePreview } from './preview';

describe('notePreview', () => {
  it('returns the first non-empty line', () => {
    expect(notePreview('\n\nlinks pra ler depois\nsegunda linha')).toBe('links pra ler depois');
  });

  it('strips block syntax', () => {
    expect(notePreview('# Mercado')).toBe('Mercado');
    expect(notePreview('- [ ] pagar a conta')).toBe('pagar a conta');
    expect(notePreview('1. primeiro passo')).toBe('primeiro passo');
    expect(notePreview('> - [x] citado')).toBe('citado');
  });

  it('strips inline syntax', () => {
    expect(notePreview('**negrito**, *itálico*, <u>sub</u>, ~~tachado~~, ==destaque==, `code`')).toBe(
      'negrito, itálico, sub, tachado, destaque, code',
    );
    expect(notePreview('veja [o link](https://example.com)')).toBe('veja o link');
    expect(notePreview('<small>obs</small>')).toBe('obs');
  });

  it('skips fences, dividers and table separators', () => {
    expect(notePreview('```ts\nconst a = 1\n```')).toBe('const a = 1');
    expect(notePreview('---\ntexto')).toBe('texto');
    expect(notePreview('| Estilo | Peso |\n| --- | --- |\n| Corpo | 400 |')).toBe('Estilo Peso');
  });

  it('returns an empty string for an empty body', () => {
    expect(notePreview('  \n\n')).toBe('');
  });
});
