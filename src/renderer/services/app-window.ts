// Thin wrappers over the window and close-handshake APIs of the main process (src/main/main-window.ts).

import type { AppTheme } from '../../shared/noter-api';
import { platform } from './platform';

export function showWindow(): Promise<void> {
  return platform.window.show();
}

/** Theme of the native parts (acrylic tint included) and the acrylic behind the page (D39, D40). */
// Async, so a preload without this call (an old dev session) rejects instead of throwing in the effect.
export async function setWindowAppearance(theme: AppTheme, acrylic: boolean): Promise<void> {
  await platform.window.setAppearance(theme, acrylic);
}

export function minimizeWindow(): Promise<void> {
  return platform.window.minimize();
}

export function toggleMaximizeWindow(): Promise<void> {
  return platform.window.toggleMaximize();
}

/** Same as the system close (Alt+F4): the main process asks the app to flush first (`onCloseRequested`). */
export function closeWindow(): Promise<void> {
  return platform.window.close();
}

export function isWindowMaximized(): Promise<boolean> {
  return platform.window.isMaximized();
}

/** Returns a function that stops listening. */
export function onMaximizedChange(listener: (maximized: boolean) => void): () => void {
  return platform.window.onMaximizedChange(listener);
}

/** Called when the window is about to close; call `confirmClose` after flushing. Returns a function that stops listening. */
export function onCloseRequested(listener: () => void): () => void {
  return platform.app.onCloseRequested(listener);
}

export function confirmClose(): void {
  platform.app.confirmClose();
}
