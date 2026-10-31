// Zoom of the note area only (Ctrl + / Ctrl - / Ctrl 0): 80% to 150%, in 10% steps. The sidebar and the
// title bar keep their size.

export const NOTE_ZOOM_MIN = 0.8;
export const NOTE_ZOOM_MAX = 1.5;
export const NOTE_ZOOM_STEP = 0.1;
export const NOTE_ZOOM_DEFAULT = 1;

/** A zoom within the limits, on a 10% step (a hand-edited value comes back sane). */
export function clampNoteZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return NOTE_ZOOM_DEFAULT;
  const stepped = Math.round(zoom / NOTE_ZOOM_STEP) * NOTE_ZOOM_STEP;
  // Rounded again: 0.1 steps in floating point leave tails like 1.2000000000000002.
  return Math.round(Math.max(NOTE_ZOOM_MIN, Math.min(stepped, NOTE_ZOOM_MAX)) * 10) / 10;
}

/** One step in (1) or out (-1), stopping at the limits. */
export function stepNoteZoom(zoom: number, direction: 1 | -1): number {
  return clampNoteZoom(zoom + direction * NOTE_ZOOM_STEP);
}
