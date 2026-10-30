// The single app window: frameless, with the close handshake and the security rules for navigation.

import path from 'node:path';
import { BrowserWindow, nativeTheme, shell } from 'electron';
import type { AppTheme, EventChannels } from '../shared/noter-api.js';
import { windowBackground } from './core/appearance.js';
import { isAllowedExternalUrl, isAppUrl } from './core/external-url.js';
import { MIN_SIZE_SIDEBAR_CLOSED } from './core/min-window-size.js';
import { loadWindowState, saveWindowState } from './window-state.js';

const DEFAULT_SIZE = { width: 1100, height: 720 };
/** The renderer asks to show the window once the notes are loaded; show it anyway if that never happens. */
const SHOW_FALLBACK_MS = 4000;
/** Safety net: close anyway if the renderer never answers `app:close-requested`. */
const CLOSE_TIMEOUT_MS = 3000;

export type MainWindow = {
  window: BrowserWindow;
  /** Shows and focuses the window, maximized if it was maximized when it last closed. */
  show(): void;
  /** Called when the renderer finished flushing pending saves; closes the window for real. */
  confirmClose(): void;
  /** Theme of the native parts and the acrylic material behind the page (D39, D40). */
  setAppearance(theme: AppTheme, acrylic: boolean): void;
  /** Sends an event to the page, if the window is still there. */
  send: SendToRenderer;
};

export type SendToRenderer = <C extends keyof EventChannels>(channel: C, ...args: EventChannels[C]) => void;

export function createMainWindow(options: { userDataDir: string; devServerUrl?: string }): MainWindow {
  const { userDataDir, devServerUrl } = options;
  const state = loadWindowState(userDataDir);

  const window = new BrowserWindow({
    ...DEFAULT_SIZE,
    ...state.bounds,
    center: state.bounds === null,
    minWidth: MIN_SIZE_SIDEBAR_CLOSED.width,
    minHeight: MIN_SIZE_SIDEBAR_CLOSED.height,
    title: 'Noter',
    // Frameless keeps the native shadow and Windows 11 rounded corners as long as `thickFrame` stays true (default).
    frame: false,
    show: false,
    // Follows Windows until the page sends its theme and acrylic choice (setAppearance).
    backgroundColor: windowBackground(false, nativeTheme.shouldUseDarkColors),
    webPreferences: {
      preload: path.join(import.meta.dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  const send: SendToRenderer = (channel, ...args) => {
    if (!window.isDestroyed() && !window.webContents.isDestroyed()) window.webContents.send(channel, ...args);
  };

  // maximize() also shows a hidden window, so the saved maximized state waits for the first show.
  let maximizeOnShow = state.maximized;
  const show = () => {
    if (window.isDestroyed()) return;
    clearTimeout(showFallback);
    if (maximizeOnShow) {
      maximizeOnShow = false;
      window.maximize();
    } else {
      window.show();
    }
    window.focus();
  };
  // Show fallback: the renderer normally calls `window:show` itself.
  const showFallback = setTimeout(() => {
    if (!window.isDestroyed() && !window.isVisible()) show();
  }, SHOW_FALLBACK_MS);

  window.on('maximize', () => send('window:maximized-changed', true));
  window.on('unmaximize', () => send('window:maximized-changed', false));

  // Close handshake: the first `close` is held back until the renderer flushes pending saves (or the timeout hits).
  let closeConfirmed = false;
  let closeRequested = false;
  const confirmClose = () => {
    if (closeConfirmed || window.isDestroyed()) return;
    closeConfirmed = true;
    saveWindowState(userDataDir, window);
    window.close();
  };
  window.on('close', (event) => {
    if (closeConfirmed) return;
    event.preventDefault();
    if (closeRequested) return;
    closeRequested = true;
    if (window.webContents.isDestroyed() || window.webContents.isCrashed()) {
      confirmClose();
      return;
    }
    send('app:close-requested');
    setTimeout(confirmClose, CLOSE_TIMEOUT_MS).unref();
  });

  // Security: the window only ever shows the app. Links go to the system browser.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternalUrl(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  const appUrl = devServerUrl ?? new URL('../renderer/index.html', import.meta.url).href;
  window.webContents.on('will-navigate', (event, url) => {
    if (isAppUrl(url, appUrl)) return;
    event.preventDefault();
    if (isAllowedExternalUrl(url)) void shell.openExternal(url);
  });

  if (devServerUrl) void window.loadURL(devServerUrl);
  else void window.loadFile(path.join(import.meta.dirname, '../renderer/index.html'));

  let acrylicOn = false;
  const setAppearance = (theme: AppTheme, acrylic: boolean) => {
    if (window.isDestroyed()) return;
    // Also tints the acrylic and the native parts like the theme chosen in the app.
    nativeTheme.themeSource = theme;
    acrylicOn = acrylic;
    window.setBackgroundMaterial(acrylic ? 'acrylic' : 'none');
    window.setBackgroundColor(windowBackground(acrylic, nativeTheme.shouldUseDarkColors));
  };
  // "Sistema" and Windows switched theme: keep the background behind the page in step.
  nativeTheme.on('updated', () => {
    if (!window.isDestroyed()) window.setBackgroundColor(windowBackground(acrylicOn, nativeTheme.shouldUseDarkColors));
  });

  return { window, show, confirmClose, setAppearance, send };
}
