// Registers every IPC channel of src/shared/noter-api.ts. The renderer is a trust boundary: arguments are validated.

import { app, ipcMain, shell } from 'electron';
import type { InvokeChannels, SendChannels } from '../shared/noter-api.js';
import { isAppTheme } from './core/appearance.js';
import { isAllowedExternalUrl } from './core/external-url.js';
import { minWindowSize, sizeToGrowTo } from './core/min-window-size.js';
import type { MainWindow } from './main-window.js';
import { createNotesFiles } from './notes-files.js';
import type { SettingsFile } from './settings-file.js';
import type { Updater } from './updater.js';

type InvokeResult<C extends keyof InvokeChannels> = InvokeChannels[C]['result'] extends undefined
  ? // biome-ignore lint/suspicious/noConfusingVoidType: lets handlers that return nothing satisfy `undefined`
    void
  : InvokeChannels[C]['result'];

/** Turns the raw IPC arguments into the typed ones, or throws. */
type Validate<C extends keyof InvokeChannels> = (args: unknown[]) => InvokeChannels[C]['args'];

function expectString(value: unknown, name: string): string {
  if (typeof value !== 'string') throw new TypeError(`${name} must be a string`);
  return value;
}

function expectBoolean(value: unknown, name: string): boolean {
  if (typeof value !== 'boolean') throw new TypeError(`${name} must be a boolean`);
  return value;
}

const noArgs = (): [] => [];

function handle<C extends keyof InvokeChannels>(
  channel: C,
  validate: Validate<C>,
  run: (...args: InvokeChannels[C]['args']) => InvokeResult<C> | Promise<InvokeResult<C>>,
): void {
  ipcMain.handle(channel, async (_event, ...args: unknown[]) => run(...validate(args)));
}

function on<C extends keyof SendChannels>(channel: C, run: () => void): void {
  ipcMain.on(channel, () => run());
}

export function registerIpc(deps: { main: MainWindow; settings: SettingsFile; updater: Updater }): void {
  const { main, settings, updater } = deps;
  const { window } = main;
  const notes = createNotesFiles({
    documentsDir: app.getPath('documents'),
    trash: (fullPath) => shell.trashItem(fullPath),
  });

  handle(
    'notes:open-dir',
    (a) => [a[0] === null ? null : expectString(a[0], 'path')],
    (path) => notes.openDir(path),
  );
  handle('notes:list', noArgs, () => notes.list());
  handle(
    'notes:read',
    (a) => [expectString(a[0], 'file')],
    (file) => notes.read(file),
  );
  handle(
    'notes:save',
    (a) => [expectString(a[0], 'file'), expectString(a[1], 'content')],
    (file, content) => notes.save(file, content),
  );
  handle(
    'notes:create',
    (a) => [expectString(a[0], 'baseName'), expectString(a[1], 'content')],
    (baseName, content) => notes.create(baseName, content),
  );
  handle(
    'notes:delete',
    (a) => [expectString(a[0], 'file')],
    (file) => notes.delete(file),
  );

  handle('settings:load', noArgs, () => settings.load());
  handle(
    'settings:set',
    (a) => [expectString(a[0], 'key'), a[1]],
    (key, value) => settings.set(key, value),
  );

  handle('window:show', noArgs, () => main.show());
  handle('window:minimize', noArgs, () => window.minimize());
  handle('window:toggle-maximize', noArgs, () => {
    if (window.isMaximized()) window.unmaximize();
    else window.maximize();
  });
  // Goes through the close handshake, like Alt+F4.
  handle('window:close', noArgs, () => window.close());
  handle('window:is-maximized', noArgs, () => window.isMaximized());
  handle(
    'window:apply-min-size',
    (a) => [expectBoolean(a[0], 'sidebarOpen')],
    (sidebarOpen) => {
      const min = minWindowSize(sidebarOpen);
      window.setMinimumSize(min.width, min.height);
      if (window.isMaximized()) return;
      const [width, height] = window.getSize();
      const grown = sizeToGrowTo({ width: width ?? 0, height: height ?? 0 }, min);
      if (grown) window.setSize(grown.width, grown.height);
    },
  );

  handle(
    'window:set-appearance',
    (a) => {
      if (!isAppTheme(a[0])) throw new TypeError('theme must be system, light or dark');
      return [a[0], expectBoolean(a[1], 'acrylic')];
    },
    (theme, acrylic) => main.setAppearance(theme, acrylic),
  );

  handle(
    'shell:open-external',
    (a) => [expectString(a[0], 'url')],
    async (url) => {
      if (isAllowedExternalUrl(url)) await shell.openExternal(url);
    },
  );

  handle('updater:install', noArgs, () => updater.install());

  on('app:close-confirmed', () => main.confirmClose());
}
