import type { Editor } from '@tiptap/core';
import { useRef, useState } from 'react';
import { tableHintKey } from '../editor/table-behavior';
import { useDismiss } from '../hooks/use-dismiss';
import { useMenuPosition } from '../hooks/use-menu-position';
import { useStrings } from '../i18n/use-strings';

const COLUMNS = 8;
const ROWS = 6;

type TablePickerProps = {
  editor: Editor;
  /** Where the right-click menu was: the grid takes its place. */
  x: number;
  y: number;
  onClose: () => void;
};

// Screen: docs/design/screens/menu-table.html. Opened from "Tabela" in the right-click menu (D36).
// Rows include the header row (D22).
export function TablePicker({ editor, x, y, onClose }: TablePickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ cols: 3, rows: 2 });
  const style = useMenuPosition(ref, x, y);
  const s = useStrings();
  useDismiss(ref, onClose);

  const insert = (cols: number, rows: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ cols, rows, withHeaderRow: true })
      // Shows "Clique com o botão direito para opções" under the new table until the next edit.
      .command(({ tr }) => {
        tr.setMeta(tableHintKey, 'show');
        return true;
      })
      .run();
    onClose();
  };

  const cells = [];
  for (let row = 1; row <= ROWS; row++) {
    for (let col = 1; col <= COLUMNS; col++) {
      const on = col <= size.cols && row <= size.rows;
      cells.push(
        <button
          type="button"
          key={`${row}-${col}`}
          className={on ? 'table-picker-cell table-picker-cell-on' : 'table-picker-cell'}
          aria-label={s.tableSize(col, row)}
          onMouseEnter={() => setSize({ cols: col, rows: row })}
          onFocus={() => setSize({ cols: col, rows: row })}
          onClick={() => insert(col, row)}
        />,
      );
    }
  }

  return (
    <div
      ref={ref}
      className="menu table-picker"
      role="dialog"
      aria-label={s.insertTable}
      style={style}
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="table-picker-header">
        <span className="menu-section-label">{s.insertTable}</span>
        <span className="table-picker-size">
          {size.cols} × {size.rows}
        </span>
      </div>
      <div className="table-picker-grid">{cells}</div>
      <div className="table-picker-hint">{s.tablePickerHint}</div>
    </div>
  );
}
