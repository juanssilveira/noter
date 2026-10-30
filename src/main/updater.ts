// Automatic updates from GitHub Releases (D42), installed app only. Downloads in the background; the
// renderer shows "ready" in the sidebar footer and can restart into the new version. Without that,
// the update installs when the app quits.

import { app } from 'electron';
import electronUpdater from 'electron-updater';
import type { SendToRenderer } from './main-window.js';

// electron-updater is CommonJS: the named export is on the default one.
const { autoUpdater } = electronUpdater;

/** How often a running app checks again, besides the check at startup. */
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

export type Updater = {
  /** Quits and installs the downloaded update, then reopens the app. The renderer flushes first. */
  install(): void;
};

export function startUpdater(send: SendToRenderer): Updater {
  // In development there is nothing to update (and no latest.yml to read).
  if (!app.isPackaged) return { install: () => {} };

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-downloaded', (info) => send('updater:ready', info.version));
  // Offline or GitHub unreachable: try again at the next check, nothing to show.
  autoUpdater.on('error', (error) => console.error('update check failed', error));

  const check = () => {
    autoUpdater.checkForUpdates().catch((error) => console.error('update check failed', error));
  };
  check();
  setInterval(check, CHECK_INTERVAL_MS);

  return {
    // Silent installer, and open the app again when it is done.
    install: () => autoUpdater.quitAndInstall(true, true),
  };
}
