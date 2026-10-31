// Highlight (==text==) that is easy to enter and to leave, at both ends.
// End: typing on keeps highlighting, as marks do, but
// - the right arrow at the end of a block that ends highlighted leaves it, with a plain space after it;
// - two spaces in a row at the end of a highlight do the same: the first one, typed highlighted, turns
//   into the plain space. Any other key in between breaks the pair.
// Start: marks only grow forwards, so text typed right before a highlight came out plain; here it joins
// the highlight, and the cursor there is drawn inside its color. The left arrow there moves out of it in one press, as usual; only at the start of a block,
// with nowhere to move in the line, it turns the highlight off for what is typed next (a second press moves).
// Tiptap's own `exitable` only covers the right arrow, with no way to add the spaces.

import type { Editor } from '@tiptap/core';
import Highlight from '@tiptap/extension-highlight';
import type { Mark, ResolvedPos } from '@tiptap/pm/model';
import { type EditorState, Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';

type Via = 'arrow' | 'space';

/** Leaves the highlight at the cursor, ending with a plain space before it. False when there is none. */
export function leaveHighlight(editor: Editor, via: Via): boolean {
  const { state } = editor;
  const { selection, schema } = state;
  const { $from, $to } = selection;
  const highlight = schema.marks.highlight;
  const tr = state.tr;
  if (via === 'arrow') {
    // Only where nothing follows in the block; elsewhere the arrow just moves on into the next text. With
    // the text still selected (just highlighted from the menu), it goes to the end and leaves in one press.
    if ($to.parentOffset !== $to.parent.content.size) return false;
    const marks = selection.empty ? (state.storedMarks ?? $to.marks()) : $to.marks();
    if (!highlight.isInSet(marks)) return false;
    tr.setSelection(TextSelection.create(tr.doc, $to.pos)).removeStoredMark(highlight).insertText(' ');
  } else {
    if (!selection.empty || !highlight.isInSet(state.storedMarks ?? $from.marks())) return false;
    // The end of the highlight, right after its first (highlighted) space.
    const after = $from.nodeAfter;
    if (after && highlight.isInSet(after.marks)) return false;
    if (!$from.nodeBefore?.text?.endsWith(' ')) return false;
    tr.removeMark($from.pos - 1, $from.pos, highlight).removeStoredMark(highlight);
  }
  editor.view.dispatch(tr);
  return true;
}

/** The highlight that starts right after `$pos` (and not before it), or null. */
function highlightStartingAt(state: EditorState, $pos: ResolvedPos): Mark | null {
  const highlight = state.schema.marks.highlight;
  const mark = $pos.nodeAfter ? highlight.isInSet($pos.nodeAfter.marks) : undefined;
  if (!mark) return null;
  if ($pos.nodeBefore && highlight.isInSet($pos.nodeBefore.marks)) return null;
  return mark;
}

/**
 * The left arrow at the start of a highlight that opens its block: what is typed next stays plain. In the
 * middle of a line the arrow just moves on, out of the highlight in one press. False when it does nothing.
 */
export function leaveHighlightStart(editor: Editor): boolean {
  const { state } = editor;
  const { selection, storedMarks, schema } = state;
  if (!selection.empty || selection.$from.parentOffset !== 0) return false;
  if (!highlightStartingAt(state, selection.$from)) return false;
  // Already off (a first press): the arrow moves on.
  if (storedMarks && !schema.marks.highlight.isInSet(storedMarks)) return false;
  editor.view.dispatch(state.tr.setStoredMarks(schema.marks.highlight.removeFromSet(selection.$from.marks())));
  return true;
}

export const NoteHighlight = Highlight.extend({
  addProseMirrorPlugins() {
    const editor = this.editor;
    // Where the cursor ends up after a space typed with the key just before; null after any other key.
    let afterSpace: number | null = null;
    return [
      ...(this.parent?.() ?? []),
      new Plugin({
        key: new PluginKey('highlightExit'),
        props: {
          handleKeyDown(view, event) {
            const { from } = view.state.selection;
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              afterSpace = null;
              return event.key === 'ArrowRight' ? leaveHighlight(editor, 'arrow') : leaveHighlightStart(editor);
            }
            if (event.key !== ' ' || event.ctrlKey || event.altKey || event.metaKey) {
              afterSpace = null;
              return false;
            }
            if (afterSpace === from && leaveHighlight(editor, 'space')) {
              afterSpace = null;
              return true;
            }
            afterSpace = from + 1;
            return false;
          },
          // Text typed right before a highlight joins it, unless the left arrow turned that off (stored marks
          // set without it). Typing over a selection keeps the usual behavior.
          handleTextInput(view, from, to, text) {
            const { state } = view;
            if (from !== to || state.storedMarks) return false;
            const mark = highlightStartingAt(state, state.doc.resolve(from));
            if (!mark) return false;
            view.dispatch(state.tr.insertText(text, from, to).addMark(from, from + text.length, mark));
            return true;
          },
        },
        // At the start of a highlight the cursor is drawn at the end of the text before it, outside the
        // highlight's color; since typing there joins the highlight, draw it inside, before its first letter
        // (the same document position, so nothing else changes).
        view: () => ({
          update(view) {
            const { state } = view;
            const { selection, storedMarks } = state;
            if (!selection.empty || !view.hasFocus()) return;
            if (!highlightStartingAt(state, selection.$from)) return;
            if (storedMarks && !state.schema.marks.highlight.isInSet(storedMarks)) return;
            const inside = view.domAtPos(selection.from, 1);
            const dom = view.dom.ownerDocument.getSelection();
            if (!dom || (dom.focusNode === inside.node && dom.focusOffset === inside.offset)) return;
            dom.collapse(inside.node, inside.offset);
          },
        }),
      }),
    ];
  },
});
