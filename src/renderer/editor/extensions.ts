// Editor schema, shared by the editor and the Markdown conversion. Mapping: docs/note-format.md.

import type { AnyExtension } from '@tiptap/core';
import Highlight from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Table, TableCell, TableHeader, TableKit } from '@tiptap/extension-table';
import StarterKit from '@tiptap/starter-kit';
import { PreserveHtml, PreserveImages, RawBlock, RawInline, SmallText } from './custom-nodes';
import { TableBehavior, type TableBehaviorOptions } from './table-behavior';

/** `tableHint` is only needed by the editor; the Markdown conversion uses the schema alone. */
export function noteExtensions(options: { tableHint?: TableBehaviorOptions['hintText'] } = {}): AnyExtension[] {
  return [
    StarterKit.configure({
      // 1–4 are the writing styles; 5 and 6 exist so notes edited elsewhere keep their headings.
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      link: { openOnClick: false, autolink: true, linkOnPaste: true },
    }),
    Highlight,
    TaskList,
    TaskItem.configure({ nested: true }),
    // GFM cells hold a single line of inline text, so a cell holds exactly one paragraph.
    TableKit.configure({ table: false, tableCell: false, tableHeader: false }),
    // The stock serializer wraps the table in extra newlines, leaving blank lines around it in the file.
    Table.extend({
      renderMarkdown(node, helpers, context) {
        return (this.parent?.(node, helpers, context) ?? '').replace(/^\n+|\n+$/g, '');
      },
    }).configure({ resizable: false }),
    TableCell.extend({ content: 'paragraph' }),
    TableHeader.extend({ content: 'paragraph' }),
    options.tableHint ? TableBehavior.configure({ hintText: options.tableHint }) : TableBehavior,
    SmallText,
    RawInline,
    RawBlock,
    PreserveImages,
    PreserveHtml,
  ];
}
