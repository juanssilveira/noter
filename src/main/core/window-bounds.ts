// Pure helpers for the saved window state: parsing the JSON and keeping the window on a visible display.

export type Bounds = { x: number; y: number; width: number; height: number };

/** What `window-state.json` holds. Visibility is never saved. */
export type WindowState = { bounds: Bounds; maximized: boolean };

/** Smallest part of the window that must overlap a display work area for the window to count as reachable. */
const MIN_VISIBLE_WIDTH = 100;
const MIN_VISIBLE_HEIGHT = 48;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Parses the saved JSON; null when it is missing, malformed or has unusable bounds. */
export function parseWindowState(raw: unknown): WindowState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { bounds, maximized } = raw as Record<string, unknown>;
  if (typeof bounds !== 'object' || bounds === null) return null;
  const { x, y, width, height } = bounds as Record<string, unknown>;
  if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(width) || !isFiniteNumber(height)) return null;
  if (width <= 0 || height <= 0) return null;
  return { bounds: { x, y, width, height }, maximized: maximized === true };
}

function overlaps(bounds: Bounds, area: Bounds): boolean {
  const width = Math.min(bounds.x + bounds.width, area.x + area.width) - Math.max(bounds.x, area.x);
  const height = Math.min(bounds.y + bounds.height, area.y + area.height) - Math.max(bounds.y, area.y);
  return width >= Math.min(MIN_VISIBLE_WIDTH, bounds.width) && height >= Math.min(MIN_VISIBLE_HEIGHT, bounds.height);
}

/** True when enough of the window is inside at least one display work area. */
export function isVisibleOnSomeDisplay(bounds: Bounds, workAreas: Bounds[]): boolean {
  return workAreas.some((area) => overlaps(bounds, area));
}

/**
 * The bounds to create the window with: the saved ones (never smaller than `minSize`) when they are visible,
 * otherwise null, meaning "use the default size, centered".
 */
export function resolveSavedBounds(
  saved: WindowState | null,
  workAreas: Bounds[],
  minSize: { width: number; height: number },
): Bounds | null {
  if (!saved) return null;
  const bounds = {
    ...saved.bounds,
    width: Math.max(saved.bounds.width, minSize.width),
    height: Math.max(saved.bounds.height, minSize.height),
  };
  return isVisibleOnSomeDisplay(bounds, workAreas) ? bounds : null;
}
