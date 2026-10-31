// @vitest-environment happy-dom

import { Editor } from '@tiptap/core';
import { afterEach, describe, expect, it } from 'vitest';
import { noteExtensions } from './extensions';
import { docToMarkdown, markdownToDoc } from './markdown';

const editors: Editor[] = [];

/** An editor with the cursor at the end of the first block. */
function editorAtEnd(markdown: string): Editor {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions: noteExtensions(),
    content: markdownToDoc(markdown),
  });
  editors.push(editor);
  editor.commands.setTextSelection(editor.state.doc.firstChild!.nodeSize - 1);
  return editor;
}

/** A key going down, as the keyboard delivers it (the keyboardShortcut command drops stored-mark changes).
 * True when something handled it; otherwise the key would type, see `type`. */
function press(editor: Editor, key: string): boolean {
  const event = new KeyboardEvent('keydown', { key });
  return editor.view.someProp('handleKeyDown', (handle) => handle(editor.view, event)) ?? false;
}

/** Text going in where the cursor is, as typing does: through handleTextInput, else with the stored marks. */
function type(editor: Editor, text: string) {
  const { view } = editor;
  const { from, to } = view.state.selection;
  const deflt = () => view.state.tr.insertText(text, from, to);
  if (view.someProp('handleTextInput', (handle) => handle(view, from, to, text, deflt))) return;
  view.dispatch(view.state.tr.insertText(text));
}

/** An editor with the cursor right before the first highlighted character. */
function editorAtHighlightStart(markdown: string): Editor {
  const editor = editorAtEnd(markdown);
  let start = 0;
  editor.state.doc.descendants((node, pos) => {
    if (!start && node.marks.some((mark) => mark.type.name === 'highlight')) start = pos;
  });
  editor.commands.setTextSelection(start);
  return editor;
}

/** A key that types: its keydown first, then the text when nothing handled it. */
function key(editor: Editor, text: string) {
  if (!press(editor, text)) type(editor, text);
}

const markdown = (editor: Editor) => docToMarkdown(editor.getJSON()).trim();

afterEach(() => {
  for (const editor of editors.splice(0)) editor.destroy();
});

describe('highlight', () => {
  it('keeps highlighting when typing on at its end', () => {
    const editor = editorAtEnd('a ==marcado==');
    key(editor, 'x');
    expect(markdown(editor)).toBe('a ==marcadox==');
  });

  it('leaves with the right arrow at the end of a block, with a plain space after it', () => {
    const editor = editorAtEnd('a ==marcado==');
    expect(press(editor, 'ArrowRight')).toBe(true);
    key(editor, 'x');
    expect(markdown(editor)).toBe('a ==marcado== x');
  });

  it('leaves in one press with the highlighted text still selected', () => {
    const editor = editorAtEnd('a ==marcado==');
    editor.commands.setTextSelection({ from: 3, to: editor.state.doc.firstChild!.nodeSize - 1 });
    expect(press(editor, 'ArrowRight')).toBe(true);
    key(editor, 'x');
    expect(markdown(editor)).toBe('a ==marcado== x');
  });

  it('lets a second right arrow move as usual', () => {
    const editor = editorAtEnd('a ==marcado==\n\nb');
    press(editor, 'ArrowRight');
    expect(press(editor, 'ArrowRight')).toBe(false);
  });

  it('leaves the right arrow alone where the block does not end highlighted', () => {
    expect(press(editorAtEnd('a ==marcado== b'), 'ArrowRight')).toBe(false);
  });

  it('leaves with two spaces in a row, the same way', () => {
    const editor = editorAtEnd('a ==marcado==');
    key(editor, ' ');
    key(editor, ' ');
    key(editor, 'x');
    expect(markdown(editor)).toBe('a ==marcado== x');
  });

  it('keeps one space highlighted, and two spaces with a key in between', () => {
    const one = editorAtEnd('a ==marcado==');
    key(one, ' ');
    key(one, 'x');
    expect(markdown(one)).toBe('a ==marcado x==');

    const apart = editorAtEnd('a ==marcado==');
    key(apart, ' ');
    press(apart, 'Shift');
    expect(press(apart, ' ')).toBe(false);
  });
});

describe('highlight start', () => {
  it('takes text typed right before the first highlighted character', () => {
    const editor = editorAtHighlightStart('a ==marcado==');
    key(editor, 'x');
    expect(markdown(editor)).toBe('a ==xmarcado==');
  });

  it('lets the left arrow there move out in one press, in the middle of a line', () => {
    expect(press(editorAtHighlightStart('a ==marcado=='), 'ArrowLeft')).toBe(false);
  });

  it('does the same at the start of a block, where the left arrow keeps the next text plain', () => {
    const joined = editorAtHighlightStart('==marcado== b');
    key(joined, 'x');
    expect(markdown(joined)).toBe('==xmarcado== b');

    const plain = editorAtHighlightStart('==marcado== b');
    expect(press(plain, 'ArrowLeft')).toBe(true);
    key(plain, 'x');
    expect(markdown(plain)).toBe('x==marcado== b');

    const twice = editorAtHighlightStart('==marcado== b');
    press(twice, 'ArrowLeft');
    expect(press(twice, 'ArrowLeft')).toBe(false);
  });

  it('leaves the left arrow alone elsewhere', () => {
    expect(press(editorAtEnd('a ==marcado== b'), 'ArrowLeft')).toBe(false);
  });
});
