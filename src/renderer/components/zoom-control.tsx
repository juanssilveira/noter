import { NOTE_ZOOM_DEFAULT, NOTE_ZOOM_MAX, NOTE_ZOOM_MIN } from '../domain/note-zoom';
import { useStrings } from '../i18n/use-strings';
import { useAppStore } from '../state/app-store';
import { MinusIcon, PlusIcon, ResetIcon, ZoomIcon } from './icons';

// A quiet floating magnifier in the bottom right corner, only while the note is zoomed (Ctrl + / Ctrl -).
// Hovering it slides out, to its left, zoom out, the level, zoom in and back to 100%.
export function ZoomControl() {
  const zoom = useAppStore((state) => state.noteZoom);
  const zoomNote = useAppStore((state) => state.zoomNote);
  const s = useStrings();
  if (zoom === NOTE_ZOOM_DEFAULT) return null;
  // At a limit the button is off, and its tooltip says why instead of what it does.
  const atMin = zoom <= NOTE_ZOOM_MIN;
  const atMax = zoom >= NOTE_ZOOM_MAX;

  return (
    <div className="zoom-control" role="group" aria-label={s.noteZoom}>
      <div className="zoom-control-actions">
        <button
          type="button"
          className="zoom-control-button"
          aria-label={s.zoomOut}
          data-tooltip={atMin ? s.zoomMinReached : s.zoomOut}
          disabled={atMin}
          onClick={() => zoomNote(-1)}
        >
          <MinusIcon />
        </button>
        <span className="zoom-control-value">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          className="zoom-control-button"
          aria-label={s.zoomIn}
          data-tooltip={atMax ? s.zoomMaxReached : s.zoomIn}
          disabled={atMax}
          onClick={() => zoomNote(1)}
        >
          <PlusIcon />
        </button>
        <button
          type="button"
          className="zoom-control-button"
          aria-label={s.zoomReset}
          data-tooltip={s.zoomReset}
          onClick={() => zoomNote(0)}
        >
          <ResetIcon />
        </button>
      </div>
      <span className="zoom-control-icon">
        <ZoomIcon />
      </span>
    </div>
  );
}
