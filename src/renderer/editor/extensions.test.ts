// @vitest-environment happy-dom
// The editor schema. Round trip of each style: markdown.test.ts.

import { Editor, generateJSON, getExtensionField } from '@tiptap/core';
import { afterEach, describe, expect, it } from 'vitest';
import { noteExtensions } from './extensions';
import { docToMarkdown, markdownToDoc } from './markdown';

const editors: Editor[] = [];

function editorWith(markdown: string): Editor {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions: noteExtensions(),
    content: markdownToDoc(markdown),
  });
  editors.push(editor);
  return editor;
}

afterEach(() => {
  for (const editor of editors.splice(0)) editor.destroy();
});

describe('schema', () => {
  it('can write every node and mark to Markdown', () => {
    // Rows and cells are written by the table itself.
    const writtenByParent = new Set(['tableRow', 'tableCell', 'tableHeader']);
    const missing = editorWith('')
      .extensionManager.extensions.filter((ext) => ext.type !== 'extension' && !writtenByParent.has(ext.name))
      .filter((ext) => !getExtensionField(ext, 'renderMarkdown'))
      .map((ext) => ext.name);
    expect(missing).toEqual([]);
  });

  it('keeps the text of blocks pasted into a cell, which holds a single paragraph', () => {
    const html = '<table><tr><th>A</th></tr><tr><td><ul><li>um</li><li>dois</li></ul><p>três</p></td></tr></table>';
    const markdown = docToMarkdown(generateJSON(html, noteExtensions()));
    expect(markdown).toContain('- um\n- dois');
    expect(markdown).toContain('três');
  });
});

describe('table in the file', () => {
  it('is separated from the text by a single blank line', () => {
    const editor = editorWith('antes\n');
    editor.commands.focus('end');
    editor.chain().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run();
    const markdown = docToMarkdown(editor.getJSON());
    expect(markdown).toMatch(/^antes\n\n\| /);
    expect(markdown).not.toContain('\n\n\n');
  });

  it('round-trips text around a table without adding lines', () => {
    const markdown = 'antes\n\n| A   | B   |\n| --- | --- |\n| 1   | 2   |\n\ndepois\n';
    expect(docToMarkdown(markdownToDoc(markdown))).toBe(markdown);
  });
});
