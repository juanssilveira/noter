import type { Editor } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import type { Entry } from '../domain/entries';
import { noteExtensions } from '../editor/extensions';
import { docToMarkdown, markdownToDoc } from '../editor/markdown';
import type { Strings } from '../i18n/strings';
import { useStrings } from '../i18n/use-strings';
import { openExternal } from '../services/shell';
import { useAppStore } from '../state/app-store';
import { ContextMenu, type ContextMenuItem } from './context-menu';
import { FormatMenu } from './format-menu';
import { TablePicker } from './table-picker';

type NoteEditorProps = {
  /** Mounted with `key={id:revision}`: the content is read only when the editor is created. */
  entry: Entry;
};

type TableMenu = { x: number; y: number; inHeader: boolean } | null;
/** Right click in the text (D36): the Aa menu, or the table grid that replaced it. */
type FormatMenuState = { x: number; y: number; view: 'format' | 'table' } | null;

// Table cell menu (D22). The header row can't get a row above it or be deleted: GFM needs it.
function tableMenuItems(editor: Editor, inHeader: boolean, s: Strings): ContextMenuItem[] {
  const run = (command: (chain: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) => () =>
    command(editor.chain().focus()).run();
  const items: ContextMenuItem[] = [];
  if (!inHeader) items.push({ label: s.insertRowAbove, onSelect: run((c) => c.addRowBefore()) });
  items.push(
    { label: s.insertRowBelow, onSelect: run((c) => c.addRowAfter()) },
    { label: s.insertColumnLeft, onSelect: run((c) => c.addColumnBefore()) },
    { label: s.insertColumnRight, onSelect: run((c) => c.addColumnAfter()) },
  );
  if (!inHeader) items.push({ label: s.deleteRow, onSelect: run((c) => c.deleteRow()), separatorBefore: true });
  items.push(
    { label: s.deleteColumn, onSelect: run((c) => c.deleteColumn()), separatorBefore: inHeader },
    { label: s.deleteTable, onSelect: run((c) => c.deleteTable()) },
  );
  return items;
}

export function NoteEditor({ entry }: NoteEditorProps) {
  const markDirty = useAppStore((state) => state.markDirty);
  const flushPending = useAppStore((state) => state.flushPending);
  const rememberCursor = useAppStore((state) => state.rememberCursor);
  const setEditor = useAppStore((state) => state.setEditor);
  const focusToken = useAppStore((state) => state.focusToken);
  const spellcheck = useAppStore((state) => state.spellcheck);
  const zoom = useAppStore((state) => state.noteZoom);
  const s = useStrings();
  // The table hint reads this when drawn: the editor keeps the extensions it was created with.
  const tableHint = useRef(s.tableHint);
  tableHint.current = s.tableHint;
  const placeholder = useRef(s.notePlaceholder);
  placeholder.current = s.notePlaceholder;
  const [tableMenu, setTableMenu] = useState<TableMenu>(null);
  const closeTableMenu = useCallback(() => setTableMenu(null), []);
  const [formatMenu, setFormatMenu] = useState<FormatMenuState>(null);
  const closeFormatMenu = useCallback(() => setFormatMenu(null), []);
  const { id } = entry;

  const editor = useEditor({
    extensions: noteExtensions({ tableHint: () => tableHint.current, placeholder: () => placeholder.current }),
    content: markdownToDoc(entry.note.body),
    // Back to where the cursor was (D12); new notes start at the end.
    autofocus: useAppStore.getState().cursorFor(entry.note.file) ?? 'end',
    editorProps: {
      // Re-applied on every render (useEditor updates its options), so the switch acts at once.
      attributes: { class: 'note', spellcheck: String(spellcheck), 'aria-label': s.noteContent },
      // Ctrl + click opens a link in the default browser; a plain click only places the cursor (D23).
      handleClick: (_view, _pos, event) => {
        if (!event.ctrlKey) return false;
        const link = (event.target as HTMLElement).closest('a[href]');
        if (!link) return false;
        void openExternal(link.getAttribute('href')!);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      markDirty(id, () => docToMarkdown(editor.getJSON()));
    },
    onSelectionUpdate: ({ editor }) => {
      // The file may appear later, when a draft is created.
      const file = useAppStore.getState().entries.find((other) => other.id === id)?.note.file;
      if (file) rememberCursor(file, editor.state.selection.from);
    },
  });

  useEffect(() => {
    setEditor(editor);
    return () => {
      if (useAppStore.getState().editor === editor) setEditor(null);
    };
  }, [editor, setEditor]);

  useEffect(() => {
    if (focusToken > 0) editor?.commands.focus();
  }, [editor, focusToken]);

  // Links open with Ctrl + click (D23): while Ctrl is down, the pointer over them turns into a hand.
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const onKey = (event: KeyboardEvent) => dom.classList.toggle('ctrl-held', event.ctrlKey);
    const onBlur = () => dom.classList.remove('ctrl-held');
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('blur', onBlur);
    };
  }, [editor]);

  // Save before the editor goes away (another note selected, app closing).
  useEffect(() => () => void flushPending(), [flushPending]);

  const onContextMenu = (event: MouseEvent) => {
    if (!editor) return;
    const position = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
    const cell = (event.target as HTMLElement).closest('td, th');
    if (cell) {
      event.preventDefault();
      // Put the cursor in the clicked cell so the commands act on it.
      if (position) editor.chain().focus().setTextSelection(position.pos).run();
      setTableMenu({ x: event.clientX, y: event.clientY, inHeader: cell.tagName === 'TH' });
      return;
    }
    if (!position) return;
    event.preventDefault();
    // A click on the selection keeps it; anywhere else moves the cursor there, so the menu acts on that spot.
    const { from, to, empty } = editor.state.selection;
    if (empty || position.pos < from || position.pos > to) editor.chain().focus().setTextSelection(position.pos).run();
    setFormatMenu({ x: event.clientX, y: event.clientY, view: 'format' });
  };

  return (
    <>
      {/* Zoom on the note only (Ctrl + / Ctrl -): the text grows and still wraps in the same width; the
          menus sit outside it, at normal size. */}
      <EditorContent editor={editor} className="note-editor" style={{ zoom }} onContextMenu={onContextMenu} />
      {editor && tableMenu && (
        <ContextMenu
          x={tableMenu.x}
          y={tableMenu.y}
          label={s.table}
          items={tableMenuItems(editor, tableMenu.inHeader, s)}
          onClose={closeTableMenu}
        />
      )}
      {editor &&
        formatMenu &&
        (formatMenu.view === 'format' ? (
          <FormatMenu
            editor={editor}
            x={formatMenu.x}
            y={formatMenu.y}
            onClose={closeFormatMenu}
            onInsertTable={() => setFormatMenu({ ...formatMenu, view: 'table' })}
          />
        ) : (
          <TablePicker editor={editor} x={formatMenu.x} y={formatMenu.y} onClose={closeFormatMenu} />
        ))}
    </>
  );
}
