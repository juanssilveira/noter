// Electron main process entry.

import path from 'node:path';
import { app, Menu } from 'electron';
import { registerIpc } from './ipc.js';
import { createMainWindow, type MainWindow } from './main-window.js';
import { createSettingsFile } from './settings-file.js';
import { startUpdater } from './updater.js';

// Named after the app id, so the data folder is the same in dev and in the installed app.
app.setPath('userData', path.join(app.getPath('appData'), 'com.noter.app'));

let main: MainWindow | null = null;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const window = main?.window;
    if (!window || window.isDestroyed()) return;
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
  });

  const settings = createSettingsFile(path.join(app.getPath('userData'), 'config.json'));

  app.on('before-quit', () => settings.flush());
  app.on('window-all-closed', () => app.quit());

  void app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    main = createMainWindow({ userDataDir: app.getPath('userData'), devServerUrl: process.env.NOTER_DEV_SERVER_URL });
    // Handlers are registered right after creating the window, before the renderer can load and call them.
    registerIpc({ main, settings, updater: startUpdater(main.send) });
  });
}
