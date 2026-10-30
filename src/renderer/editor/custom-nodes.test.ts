// @vitest-environment happy-dom
// Edge cases of the custom nodes. The required round trip of each style is in markdown.test.ts.

import { generateHTML, generateJSON, type JSONContent } from '@tiptap/core';
import { describe, expect, it } from 'vitest';
import { noteExtensions } from './extensions';
import { docToMarkdown, markdownToDoc } from './markdown';

const roundTrip = (markdown: string) => docToMarkdown(markdownToDoc(markdown));

// Copy and paste inside the editor go through HTML: renderHTML → parseHTML.
function throughHtml(markdown: string): string {
  const html = generateHTML(markdownToDoc(markdown), noteExtensions());
  return docToMarkdown(generateJSON(html, noteExtensions()));
}

function nodeTypes(node: JSONContent): string[] {
  return [node.type ?? '', ...(node.content ?? []).flatMap(nodeTypes)];
}

describe('smallText', () => {
  it('keeps marks inside', () => {
    expect(roundTrip('<small>**negrito** e *itálico*</small>\n')).toBe('<small>**negrito** e *itálico*</small>\n');
  });

  it('drops trailing spaces after </small>', () => {
    const doc = markdownToDoc('<small>texto</small>   \n');
    expect(doc.content?.map((node) => node.type)).toEqual(['smallText']);
    expect(docToMarkdown(doc)).toBe('<small>texto</small>\n');
  });

  it('is not a block when it spans lines, and keeps the text', () => {
    const markdown = '<small>linha 1\nlinha 2</small>\n';
    expect(nodeTypes(markdownToDoc(markdown))).not.toContain('smallText');
    expect(roundTrip(markdown)).toBe(markdown);
  });
});

describe('raw content', () => {
  it('keeps a multiline HTML block', () => {
    expect(roundTrip('<div>\nlinha 1\nlinha 2\n</div>\n')).toBe('<div>\nlinha 1\nlinha 2\n</div>\n');
  });

  it('keeps an inline comment', () => {
    expect(roundTrip('texto <!-- nota --> fim\n')).toBe('texto <!-- nota --> fim\n');
  });

  it('does not turn <u> into raw content', () => {
    expect(nodeTypes(markdownToDoc('<u>sublinhado</u>\n'))).not.toContain('rawInline');
  });
});

describe('copy and paste keep the content', () => {
  it.each([
    ['small', '<small>Texto pequeno</small>\n'],
    ['image', 'antes ![img](a.png) depois\n'],
    ['inline html', 'texto <span>html</span> fim\n'],
    ['block html', '<div>bloco html</div>\n'],
  ])('%s', (_name, markdown) => {
    expect(throughHtml(markdown)).toBe(markdown);
  });
});
