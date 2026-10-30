// @vitest-environment happy-dom
// Table behavior in a real editor: docs/behavior.md, "Tabela".

import { Editor } from '@tiptap/core';
import { afterEach, describe, expect, it } from 'vitest';
import { STRINGS } from '../i18n/strings';
import { noteExtensions } from './extensions';
import { docToMarkdown, markdownToDoc } from './markdown';
import { tableHintKey } from './table-behavior';

// The default hint text; the editor passes the one of the interface language.
const TABLE_HINT_TEXT = STRINGS.pt.tableHint;

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

/** Puts the cursor inside the text of the n-th cell (0-based, header row included). */
function placeInCell(editor: Editor, index: number) {
  const positions: number[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') positions.push(pos + 2);
  });
  editor.commands.setTextSelection(positions[index]);
}

function cellText(editor: Editor): string {
  return editor.state.selection.$from.parent.textContent;
}

/**
 * Presses a key the way the browser does. Tiptap's `keyboardShortcut` command only replays the
 * document changes, so it can't test handlers that only move the cursor.
 */
function press(editor: Editor, key: string, shiftKey = false) {
  const event = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true });
  editor.view.someProp('handleKeyDown', (handler) => handler(editor.view, event));
}

function insertTableWithHint(editor: Editor) {
  editor
    .chain()
    .focus()
    .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
    .command(({ tr }) => {
      tr.setMeta(tableHintKey, 'show');
      return true;
    })
    .run();
}

const TABLE = '| A | B |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |\n';

describe('Enter in a table', () => {
  it('moves to the cell below', () => {
    const editor = editorWith(TABLE);
    placeInCell(editor, 1); // B
    press(editor, 'Enter');
    expect(cellText(editor)).toBe('2');
    expect(docToMarkdown(editor.getJSON())).toContain('| 1   | 2   |');
  });

  it('leaves the table from the last row, into the paragraph after it', () => {
    const editor = editorWith(`${TABLE}\ndepois\n`);
    placeInCell(editor, 4); // 3
    press(editor, 'Enter');
    expect(editor.state.selection.$from.parent.type.name).toBe('paragraph');
    expect(cellText(editor)).toBe('depois');
  });

  it('creates a paragraph after the table when the next block is not one', () => {
    const editor = editorWith(`${TABLE}\n# Título\n`);
    placeInCell(editor, 5); // 4
    press(editor, 'Enter');
    // The editor always keeps an empty paragraph at the end of the note, after the heading.
    const types = editor.getJSON().content?.map((node) => node.type);
    expect(types?.slice(0, 3)).toEqual(['table', 'paragraph', 'heading']);
    expect(editor.state.selection.$from.parent.type.name).toBe('paragraph');
  });

  it('never puts a line break inside a cell with Shift+Enter', () => {
    const editor = editorWith(TABLE);
    placeInCell(editor, 2); // 1
    press(editor, 'Enter', true);
    expect(cellText(editor)).toBe('3');
    expect(docToMarkdown(editor.getJSON())).not.toContain('<br>');
  });

  it('keeps the default Enter outside tables', () => {
    const editor = editorWith('um\n');
    editor.commands.focus('end');
    press(editor, 'Enter');
    expect(editor.getJSON().content).toHaveLength(2);
  });
});

describe('right-click hint', () => {
  it('shows under a new table and is not part of the note', () => {
    const editor = editorWith('antes\n');
    editor.commands.focus('end');
    insertTableWithHint(editor);
    expect(tableHintKey.getState(editor.state)).not.toBeNull();
    expect(editor.view.dom.querySelector('.table-hint')?.textContent).toBe(TABLE_HINT_TEXT);
    expect(docToMarkdown(editor.getJSON())).not.toContain(TABLE_HINT_TEXT);
  });

  it('goes away with the first character typed', () => {
    const editor = editorWith('antes\n');
    editor.commands.focus('end');
    insertTableWithHint(editor);
    editor.commands.insertContent('x');
    expect(tableHintKey.getState(editor.state)).toBeNull();
    expect(editor.view.dom.querySelector('.table-hint')).toBeNull();
  });

  it('does not appear for tables loaded from a note', () => {
    const editor = editorWith(TABLE);
    expect(tableHintKey.getState(editor.state)).toBeNull();
  });
});
