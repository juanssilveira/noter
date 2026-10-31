import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { type KeyboardEvent, type ReactNode, useRef, useState } from 'react';
import { normalizeUrl } from '../editor/links';
import { useDismiss } from '../hooks/use-dismiss';
import { useMenuPosition } from '../hooks/use-menu-position';
import { useStrings } from '../i18n/use-strings';
import { BulletListIcon, CheckIcon, CodeBlockIcon, DividerIcon, OrderedListIcon, QuoteIcon, TableIcon } from './icons';
import { MarkButtons } from './mark-buttons';

type FormatMenuProps = {
  editor: Editor;
  /** Mouse position of the right click, in viewport pixels. */
  x: number;
  y: number;
  onClose: () => void;
  /** "Tabela": the parent swaps this menu for the table grid at the same place. */
  onInsertTable: () => void;
};

// Opened by a right click in the text (D36). Screen: docs/design/screens/menu-formatting.html.
// Every choice closes the menu, marks included (the user found it odd to stay open after one).
// "Link" swaps the menu for a URL field (D23).
export function FormatMenu({ editor, x, y, onClose, onInsertTable }: FormatMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [linkMode, setLinkMode] = useState(false);
  const style = useMenuPosition(ref, x, y, linkMode);
  const s = useStrings();
  useDismiss(ref, onClose);

  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      h1: editor.isActive('heading', { level: 1 }),
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      h4: editor.isActive('heading', { level: 4 }),
      body: editor.isActive('paragraph'),
      small: editor.isActive('smallText'),
    }),
  });

  const chain = () => editor.chain().focus();

  const close = () => {
    onClose();
    editor.commands.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    if (linkMode) setLinkMode(false);
    else close();
  };

  if (linkMode) {
    return (
      <div ref={ref} className="menu format-menu" role="dialog" aria-label={s.link} style={style} onKeyDown={onKeyDown}>
        <LinkField editor={editor} onDone={close} />
      </div>
    );
  }

  const textStyle = (label: string, isActive: boolean, run: () => void, className: string) => (
    <button
      type="button"
      className={`menu-item ${className}`}
      role="menuitemradio"
      aria-checked={isActive}
      onClick={() => {
        run();
        onClose();
      }}
    >
      <span className="menu-item-label">{label}</span>
      {isActive && <CheckIcon />}
    </button>
  );

  const block = (label: string, icon: ReactNode, run: () => void) => (
    <button
      type="button"
      className="menu-item"
      role="menuitem"
      onClick={() => {
        run();
        onClose();
      }}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div
      ref={ref}
      className="menu format-menu"
      role="menu"
      aria-label={s.formatting}
      style={style}
      onKeyDown={onKeyDown}
      // Keep the focus (and the selection) in the editor while clicking the menu.
      onMouseDown={(event) => event.preventDefault()}
    >
      {/* The marks first: the menu opens at the mouse, so the quick actions are right under it. */}
      <div className="menu-icon-row">
        <MarkButtons editor={editor} onLink={() => setLinkMode(true)} onDone={onClose} />
      </div>

      <div className="menu-separator" role="separator" />

      <div className="menu-section-label">{s.text}</div>
      {textStyle('Heading 1', active.h1, () => chain().setHeading({ level: 1 }).run(), 'format-h1')}
      {textStyle('Heading 2', active.h2, () => chain().setHeading({ level: 2 }).run(), 'format-h2')}
      {textStyle('Heading 3', active.h3, () => chain().setHeading({ level: 3 }).run(), 'format-h3')}
      {textStyle('Heading 4', active.h4, () => chain().setHeading({ level: 4 }).run(), 'format-h4')}
      {textStyle(s.body, active.body, () => chain().setParagraph().run(), '')}
      {textStyle(s.small, active.small, () => chain().setNode('smallText').run(), 'format-small')}

      <div className="menu-separator" role="separator" />

      <div className="menu-section-label">{s.blocks}</div>
      {block(s.bulletList, <BulletListIcon />, () => chain().toggleBulletList().run())}
      {block(s.orderedList, <OrderedListIcon />, () => chain().toggleOrderedList().run())}
      {block(s.quote, <QuoteIcon />, () => chain().toggleBlockquote().run())}
      {block(s.codeBlock, <CodeBlockIcon />, () => chain().toggleCodeBlock().run())}
      <button type="button" className="menu-item" role="menuitem" onClick={onInsertTable}>
        <TableIcon />
        {s.table}
      </button>
      {block(s.divider, <DividerIcon />, () => chain().setHorizontalRule().run())}
    </div>
  );
}

/** "Cole o link": Enter applies it to the selection, empty Enter removes the link (D23). */
function LinkField({ editor, onDone }: { editor: Editor; onDone: () => void }) {
  const [value, setValue] = useState(() => (editor.getAttributes('link').href as string | undefined) ?? '');
  const s = useStrings();

  const apply = () => {
    const href = normalizeUrl(value);
    const chain = editor.chain().focus().extendMarkRange('link');
    if (!href) {
      chain.unsetLink().run();
    } else if (editor.state.selection.empty && !editor.isActive('link')) {
      // Nothing selected: insert the address itself as the link text.
      chain.insertContent({ type: 'text', text: value.trim(), marks: [{ type: 'link', attrs: { href } }] }).run();
    } else {
      chain.setLink({ href }).run();
    }
    onDone();
  };

  return (
    <input
      className="menu-input"
      aria-label={s.linkAddress}
      placeholder={s.pasteLink}
      value={value}
      autoFocus
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          apply();
        }
      }}
    />
  );
}
