// Highlight (==text==) that is easy to leave. Typing on at its end keeps highlighting, as marks do, but:
// - the right arrow at the end of a block that ends highlighted leaves it, with a plain space after it;
// - two spaces in a row at the end of a highlight do the same: the first one, typed highlighted, turns
//   into the plain space. Any other key in between breaks the pair.
// Tiptap's own `exitable` only covers the arrow, with no way to add the spaces.

import type { Editor } from '@tiptap/core';
import Highlight from '@tiptap/extension-highlight';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';

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
            if (event.key === 'ArrowRight') {
              afterSpace = null;
              return leaveHighlight(editor, 'arrow');
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
        },
      }),
    ];
  },
});
