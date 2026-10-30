// Table keyboard behavior and the right-click hint shown under a new table (D22).

import { type Editor, Extension } from '@tiptap/core';
import { type EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { TableMap } from '@tiptap/pm/tables';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { STRINGS } from '../i18n/strings';

const CELL_TYPES = new Set(['tableCell', 'tableHeader']);

/** Depth of the cell around the selection start, or null outside a table. */
function cellDepth(state: EditorState): number | null {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    if (CELL_TYPES.has($from.node(depth).type.name)) return depth;
  }
  return null;
}

/**
 * Enter moves to the cell below. On the last row it leaves the table, into the paragraph after
 * it (created if needed). GFM cells hold one line, so a cell never gets a new line.
 */
function goToCellBelow(editor: Editor): boolean {
  const { state } = editor;
  const depth = cellDepth(state);
  if (depth === null) return false;

  const { $from } = state.selection;
  const tableDepth = depth - 2;
  const table = $from.node(tableDepth);
  const tableStart = $from.start(tableDepth);
  const map = TableMap.get(table);
  const cell = map.findCell($from.before(depth) - tableStart);

  if (cell.bottom < map.height) {
    const below = map.map[cell.bottom * map.width + cell.left];
    // +1 enters the cell, +1 enters its paragraph.
    return editor.commands.setTextSelection(tableStart + below + 2);
  }

  const after = $from.after(tableDepth);
  if (state.doc.nodeAt(after)?.type.name === 'paragraph') {
    return editor.commands.setTextSelection(after + 1);
  }
  return editor
    .chain()
    .insertContentAt(after, { type: 'paragraph' })
    .setTextSelection(after + 1)
    .run();
}

export const tableHintKey = new PluginKey<number | null>('tableHint');

/** Position right after the table around the selection, if any. */
function tableEnd(state: EditorState): number | null {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type.name === 'table') return $from.after(depth);
  }
  return null;
}

export type TableBehaviorOptions = {
  /** Text of the hint, read each time it is drawn so it follows the interface language (D41). */
  hintText: () => string;
};

export const TableBehavior = Extension.create<TableBehaviorOptions>({
  name: 'tableBehavior',
  // Before the default Enter handling.
  priority: 1000,

  addKeyboardShortcuts() {
    return {
      Enter: () => goToCellBelow(this.editor),
      // A hard break would become <br> inside the GFM cell.
      'Shift-Enter': () => goToCellBelow(this.editor),
    };
  },

  addOptions() {
    return { hintText: () => STRINGS.pt.tableHint };
  },

  addProseMirrorPlugins() {
    const { hintText } = this.options;
    return [
      new Plugin<number | null>({
        key: tableHintKey,
        state: {
          init: () => null,
          apply(tr, hintAt, _old, state) {
            if (tr.getMeta(tableHintKey) === 'show') return tableEnd(state);
            if (hintAt === null) return null;
            // Automatic follow-ups (e.g. the trailing paragraph added after the new table) keep it.
            if (tr.getMeta('appendedTransaction')) return tr.mapping.map(hintAt, -1);
            // The hint goes away with the first change to the note.
            return tr.docChanged ? null : hintAt;
          },
        },
        props: {
          decorations(state) {
            const hintAt = tableHintKey.getState(state);
            if (hintAt === null || hintAt === undefined) return null;
            const hint = Decoration.widget(
              hintAt,
              () => {
                const element = document.createElement('div');
                element.className = 'table-hint';
                element.contentEditable = 'false';
                element.textContent = hintText();
                return element;
              },
              { side: -1, key: 'table-hint' },
            );
            return DecorationSet.create(state.doc, [hint]);
          },
        },
      }),
    ];
  },
});
