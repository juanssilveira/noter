import { type KeyboardEvent, useEffect, useLayoutEffect, useRef } from 'react';
import { useDismiss } from '../hooks/use-dismiss';
import { useMenuPosition } from '../hooks/use-menu-position';

export type ContextMenuItem = {
  label: string;
  onSelect: () => void;
  /** Draws a separator line above the item. */
  separatorBefore?: boolean;
};

type ContextMenuProps = {
  /** Mouse position, in viewport pixels. */
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  label: string;
};

// Right-click menu in the shared menu style (docs/design.md, "Menus e popovers").
export function ContextMenu({ x, y, items, onClose, label }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const position = useMenuPosition(ref, x, y);

  useLayoutEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, []);

  useDismiss(ref, onClose);

  useEffect(() => {
    window.addEventListener('wheel', onClose, true);
    return () => window.removeEventListener('wheel', onClose, true);
  }, [onClose]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(ref.current?.querySelectorAll('button') ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'ArrowDown') {
      buttons[(index + 1) % buttons.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    } else {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      ref={ref}
      className="menu context-menu"
      role="menu"
      aria-label={label}
      style={position}
      onKeyDown={onKeyDown}
      onContextMenu={(event) => event.preventDefault()}
    >
      {items.map((item) => (
        <div key={item.label} className="menu-item-row">
          {item.separatorBefore && <div className="menu-separator" role="separator" />}
          <button
            type="button"
            className="menu-item"
            role="menuitem"
            onClick={() => {
              onClose();
              item.onSelect();
            }}
          >
            {item.label}
          </button>
        </div>
      ))}
    </div>
  );
}
