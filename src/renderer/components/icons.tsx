// Stroke icons copied from the design screens (docs/design/screens/).

import flagBrazil from '../assets/flags/br.png';
import flagUs from '../assets/flags/us.png';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function SidebarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="13" rx="3.5" />
      <path d="M7.5 3.5v13" />
    </svg>
  );
}

export function TableIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="4" width="14" height="12" rx="3" />
      <path d="M3 8.5h14M8 4v12" />
    </svg>
  );
}

export function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="5" cy="10" r="1.3" fill="currentColor" />
      <circle cx="10" cy="10" r="1.3" fill="currentColor" />
      <circle cx="15" cy="10" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" {...stroke} strokeWidth="2" aria-hidden="true">
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  );
}

export function MinusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" {...stroke} strokeWidth="2" aria-hidden="true">
      <path d="M4.5 10h11" />
    </svg>
  );
}

/** A magnifier: the note zoom control. */
export function ZoomIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" aria-hidden="true">
      <circle cx="8.75" cy="8.75" r="5.25" />
      <path d="m12.75 12.75 3.75 3.75" />
    </svg>
  );
}

/** An arrow turning back: reset. */
export function ResetIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" aria-hidden="true">
      <path d="M4.5 10a5.5 5.5 0 1 0 1.6-3.9" />
      <path d="M4 3.5v3.25h3.25" />
    </svg>
  );
}

export function MinimizeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" {...stroke} strokeWidth="1.4" aria-hidden="true">
      <path d="M3 10h14" />
    </svg>
  );
}

export function MaximizeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" {...stroke} strokeWidth="1.4" aria-hidden="true">
      <rect x="3.5" y="3.5" width="13" height="13" rx="3" />
    </svg>
  );
}

// Not in the design: same language as MaximizeIcon, two overlapping squares.
export function RestoreIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" {...stroke} strokeWidth="1.4" aria-hidden="true">
      <rect x="3.5" y="6.5" width="10" height="10" rx="2.5" />
      <path d="M7 3.5h6.5a3 3 0 0 1 3 3V13" />
    </svg>
  );
}

// ---------- Format menu (docs/design/screens/menu-formatting.html) ----------

export function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" {...stroke} strokeWidth="1.8" aria-hidden="true">
      <path d="M2.5 6.2 5 8.5l4.5-5" />
    </svg>
  );
}

export function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <path d="m7 6-4 4 4 4M13 6l4 4-4 4" />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <path d="M8.5 11.5a3 3 0 0 0 4.2 0l3-3a3 3 0 0 0-4.2-4.2l-.8.8" />
      <path d="M11.5 8.5a3 3 0 0 0-4.2 0l-3 3a3 3 0 0 0 4.2 4.2l.8-.8" />
    </svg>
  );
}

export function HighlightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <path d="m12 3.5 4.5 4.5-7 7H5v-4.5z" />
      <path d="M3 17.5h14" />
    </svg>
  );
}

export function BulletListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <circle cx="4.5" cy="6" r="1" fill="currentColor" />
      <circle cx="4.5" cy="14" r="1" fill="currentColor" />
      <path d="M8.5 6h8M8.5 14h8" />
    </svg>
  );
}

export function OrderedListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <path d="M3.5 4.5h1.5v4M3.5 8.5h3M3.5 12.5h3l-3 3.5h3" />
      <path d="M9.5 6h7M9.5 14h7" />
    </svg>
  );
}

export function QuoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <path d="M4 4v12M8.5 6h8M8.5 10h8M8.5 14h5" />
    </svg>
  );
}

export function CodeBlockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="13" rx="3" />
      <path d="m7 8.5-2 1.5 2 1.5M13 8.5l2 1.5-2 1.5" />
    </svg>
  );
}

export function DividerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <path d="M3 10h14" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" {...stroke} strokeWidth="1.4" aria-hidden="true">
      <path d="m4 4 12 12M16 4 4 16" />
    </svg>
  );
}

export function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" aria-hidden="true">
      <path d="M8 5l5 5-5 5" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" aria-hidden="true">
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  );
}

// Options menu (16 px, like the block icons of the Aa menu).

export function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="10.5" rx="2" />
      <path d="M7 17h6M10 14v3" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <circle cx="10" cy="10" r="3.2" />
      <path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7 6 6M14 14l1.3 1.3M4.7 15.3 6 14M14 6l1.3-1.3" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <path d="M16 12.5A6.5 6.5 0 0 1 7.5 4a6.5 6.5 0 1 0 8.5 8.5Z" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c2 2.2 3 4.5 3 7s-1 4.8-3 7c-2-2.2-3-4.5-3-7s1-4.8 3-7Z" />
    </svg>
  );
}

/** Two overlapping panes: the acrylic effect. */
export function AcrylicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="10" height="10" rx="2.5" />
      <rect x="7" y="7" width="10" height="10" rx="2.5" />
    </svg>
  );
}

export function NewNoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <path d="M10 5v10M5 10h10" />
    </svg>
  );
}

/** Lines of text with a check: the spell checker. */
export function SpellcheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" {...stroke} strokeWidth="1.6" aria-hidden="true">
      <path d="M3.5 6h9M3.5 10h6M3.5 14h3.5M10.5 14.5l2 2 4-4.5" />
    </svg>
  );
}

// Language flags (D41): the Noto Emoji flags, as on Android, waved and shaded (googlefonts/noto-emoji,
// 3D/png/72, Apache 2.0). Images, since Windows' emoji font draws flags as two letters.

export function FlagBrazilIcon() {
  return <img src={flagBrazil} width={16} height={16} alt="" draggable={false} />;
}

export function FlagUsIcon() {
  return <img src={flagUs} width={16} height={16} alt="" draggable={false} />;
}
