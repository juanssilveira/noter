import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import type { ReactNode } from 'react';
import { useStrings } from '../i18n/use-strings';
import { CodeIcon, HighlightIcon, LinkIcon } from './icons';

type MarkButtonsProps = {
  editor: Editor;
  /** "Link": the parent opens the URL field (D23). */
  onLink: () => void;
  /** After a mark is applied: the Aa menu closes. */
  onDone?: () => void;
};

// The marks, bold to highlight, as icon buttons: the top row of the Aa menu (D36).
export function MarkButtons({ editor, onLink, onDone }: MarkButtonsProps) {
  const s = useStrings();
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
      code: editor.isActive('code'),
      link: editor.isActive('link'),
      highlight: editor.isActive('highlight'),
    }),
  });
  const chain = () => editor.chain().focus();

  const mark = (label: string, isActive: boolean, run: () => void, content: ReactNode, className = '') => (
    <button
      type="button"
      className={`menu-icon-button ${className}`}
      aria-label={label}
      data-tooltip={label}
      aria-pressed={isActive}
      onClick={run}
    >
      {content}
    </button>
  );
  const toggle = (run: () => void) => () => {
    run();
    onDone?.();
  };

  return (
    <>
      {mark(
        s.bold,
        active.bold,
        toggle(() => chain().toggleBold().run()),
        'B',
        'format-bold',
      )}
      {mark(
        s.italic,
        active.italic,
        toggle(() => chain().toggleItalic().run()),
        'I',
        'format-italic',
      )}
      {mark(
        s.underline,
        active.underline,
        toggle(() => chain().toggleUnderline().run()),
        'U',
        'format-underline',
      )}
      {mark(
        s.strike,
        active.strike,
        toggle(() => chain().toggleStrike().run()),
        'S',
        'format-strike',
      )}
      {mark(
        s.code,
        active.code,
        toggle(() => chain().toggleCode().run()),
        <CodeIcon />,
      )}
      {mark(s.link, active.link, onLink, <LinkIcon />)}
      {mark(
        s.highlight,
        active.highlight,
        toggle(() => chain().toggleHighlight().run()),
        <HighlightIcon />,
      )}
    </>
  );
}
