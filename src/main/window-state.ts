// Window size/position between runs (replaces tauri-plugin-window-state). Visibility is never saved.

import fs from 'node:fs';
import path from 'node:path';
import { type BrowserWindow, screen } from 'electron';
import { MIN_SIZE_SIDEBAR_CLOSED } from './core/min-window-size.js';
import { type Bounds, parseWindowState, resolveSavedBounds } from './core/window-bounds.js';

const FILE_NAME = 'window-state.json';

export type InitialWindowState = { bounds: Bounds | null; maximized: boolean };

/** Saved bounds when they are still visible on some display (null means: default size, centered). */
export function loadWindowState(userDataDir: string): InitialWindowState {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(userDataDir, FILE_NAME), 'utf8'));
  } catch {
    return { bounds: null, maximized: false };
  }
  const saved = parseWindowState(raw);
  const workAreas = screen.getAllDisplays().map((display) => display.workArea);
  return {
    bounds: resolveSavedBounds(saved, workAreas, MIN_SIZE_SIDEBAR_CLOSED),
    maximized: saved?.maximized ?? false,
  };
}

/** Saves the normal (not maximized) bounds and the maximized flag. */
export function saveWindowState(userDataDir: string, win: BrowserWindow): void {
  if (win.isDestroyed()) return;
  const state = { bounds: win.getNormalBounds(), maximized: win.isMaximized() };
  const file = path.join(userDataDir, FILE_NAME);
  try {
    fs.mkdirSync(userDataDir, { recursive: true });
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(state, null, 2));
    fs.renameSync(`${file}.tmp`, file);
  } catch (error) {
    console.error('could not save window state', error);
  }
}
