// @vitest-environment happy-dom
// Round-trip rules: docs/note-format.md, "Regras de ida e volta" and "Testes obrigatórios".

import type { JSONContent } from '@tiptap/core';
import { describe, expect, it } from 'vitest';
import { docToMarkdown, markdownToDoc } from './markdown';

const roundTrip = (markdown: string) => docToMarkdown(markdownToDoc(markdown));

function types(doc: JSONContent): string[] {
  return (doc.content ?? []).map((node) => node.type ?? '');
}

describe('round trip keeps each mapped style', () => {
  it.each([
    ['paragraph', 'Um app de notas que abre na hora.\n'],
    ['headings', '# Título 1\n\n## Título 2\n\n### Título 3\n\n#### Título 4\n'],
    ['headings 5 and 6 from outside', '##### Título 5\n\n###### Título 6\n'],
    ['small', '<small>Texto pequeno, pra observações.</small>\n'],
    ['bold', '**negrito**\n'],
    ['italic', '*itálico*\n'],
    ['underline', '<u>sublinhado</u>\n'],
    ['strike', '~~tachado~~\n'],
    ['inline code', '`código`\n'],
    ['link', '[um link](https://example.com)\n'],
    ['highlight', '==destaque==\n'],
    ['bullet list', '- um\n- dois\n  - aninhado\n'],
    ['ordered list', '1. primeiro\n2. segundo\n'],
    ['checklist', '- [ ] pendente\n- [x] feito\n'],
    ['checklist nested in a list', '- item\n  - [ ] tarefa\n'],
    ['blockquote', '> uma citação\n'],
    ['code block', '```ts\nconst a = 1\n```\n'],
    ['divider', 'antes\n\n---\n\ndepois\n'],
    ['mixed marks', 'texto **negrito** e *itálico* com <u>sub</u> e ==destaque==\n'],
    ['escaped syntax', '\\*não é itálico\\*\n'],
    ['empty lines between paragraphs', 'a\n\n\n\nb\n'],
  ])('%s', (_name, markdown) => {
    expect(roundTrip(markdown)).toBe(markdown);
  });
});

describe('parsing', () => {
  it('maps each block to its editor node', () => {
    const doc = markdownToDoc(
      '# T\n\n<small>p</small>\n\n- a\n\n1. b\n\n- [ ] c\n\n> d\n\n```\ne\n```\n\n---\n\n| A |\n| --- |\n| 1 |\n',
    );
    expect(types(doc)).toEqual([
      'heading',
      'smallText',
      'bulletList',
      'orderedList',
      'taskList',
      'blockquote',
      'codeBlock',
      'horizontalRule',
      'table',
    ]);
  });

  it('keeps a <small> that is not the whole paragraph as normal text', () => {
    const doc = markdownToDoc('texto <small>parcial</small> fim\n');
    expect(types(doc)).toEqual(['paragraph']);
    expect(roundTrip('texto <small>parcial</small> fim\n')).toBe('texto <small>parcial</small> fim\n');
  });

  it('returns an empty paragraph for an empty body', () => {
    expect(markdownToDoc('')).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] });
    expect(docToMarkdown(markdownToDoc(''))).toBe('');
  });
});

describe('tables', () => {
  it('keeps the content and escaped pipes, normalizing the spacing', () => {
    const markdown = '| Estilo | Peso |\n| --- | --- |\n| Corpo | a \\| b |\n';
    const result = roundTrip(markdown);
    expect(result).toBe('| Estilo | Peso   |\n| ------ | ------ |\n| Corpo  | a \\| b |\n');
    expect(roundTrip(result)).toBe(result);
  });

  it('uses the first row as header', () => {
    const table = markdownToDoc('| A | B |\n| --- | --- |\n| 1 | 2 |\n').content?.[0];
    expect(table?.content?.[0].content?.map((cell) => cell.type)).toEqual(['tableHeader', 'tableHeader']);
    expect(table?.content?.[1].content?.map((cell) => cell.type)).toEqual(['tableCell', 'tableCell']);
  });
});

describe('unsupported content is preserved', () => {
  it.each([
    ['image alone', '![imagem](x.png)\n'],
    ['image inside text', 'antes ![img](a.png) depois\n'],
    ['inline html', 'texto <span>html</span> solto <br> fim\n'],
    ['block html', '<div>bloco html</div>\n'],
    ['html comment', '<!-- comentário -->\n\ntexto\n'],
  ])('%s', (_name, markdown) => {
    expect(roundTrip(markdown)).toBe(markdown);
  });
});

describe('normalization', () => {
  it('ends with a single newline', () => {
    expect(roundTrip('texto\n\n\n')).toBe('texto\n');
    expect(roundTrip('texto')).toBe('texto\n');
  });

  it('is stable after the first save', () => {
    const messy = '* um\n* dois\n\n| a | b |\n|-|-|\n| 1 | 2 |\n';
    const once = roundTrip(messy);
    expect(roundTrip(once)).toBe(once);
  });
});
