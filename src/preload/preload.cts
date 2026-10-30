// Preload (CommonJS: a sandboxed preload can only `require('electron')`). Exposes `window.noter`.

import { contextBridge, ipcRenderer } from 'electron';
import type { EventChannels, InvokeChannels, NoterApi, SendChannels } from '../shared/noter-api.js';

function invoke<C extends keyof InvokeChannels>(
  channel: C,
  ...args: InvokeChannels[C]['args']
): Promise<InvokeChannels[C]['result']> {
  return ipcRenderer.invoke(channel, ...args) as Promise<InvokeChannels[C]['result']>;
}

function send<C extends keyof SendChannels>(channel: C, ...args: SendChannels[C]): void {
  ipcRenderer.send(channel, ...args);
}

/** Listens to a main → renderer event without exposing the IpcRendererEvent to the page. */
function listen<C extends keyof EventChannels>(channel: C, listener: (...args: EventChannels[C]) => void): () => void {
  const handler = (_event: unknown, ...args: unknown[]) => listener(...(args as EventChannels[C]));
  ipcRenderer.on(channel, handler);
  return () => {
    ipcRenderer.removeListener(channel, handler);
  };
}

const api: NoterApi = {
  notes: {
    openDir: (path) => invoke('notes:open-dir', path),
    list: () => invoke('notes:list'),
    read: (file) => invoke('notes:read', file),
    save: (file, content) => invoke('notes:save', file, content),
    create: (baseName, content) => invoke('notes:create', baseName, content),
    delete: (file) => invoke('notes:delete', file),
  },
  settings: {
    load: () => invoke('settings:load'),
    set: (key, value) => invoke('settings:set', key, value),
  },
  window: {
    show: () => invoke('window:show'),
    minimize: () => invoke('window:minimize'),
    toggleMaximize: () => invoke('window:toggle-maximize'),
    close: () => invoke('window:close'),
    isMaximized: () => invoke('window:is-maximized'),
    onMaximizedChange: (listener) => listen('window:maximized-changed', listener),
    applyMinSize: (sidebarOpen) => invoke('window:apply-min-size', sidebarOpen),
    setAppearance: (theme, acrylic) => invoke('window:set-appearance', theme, acrylic),
    transparencyEnabled: () => invoke('window:transparency-enabled'),
  },
  app: {
    onCloseRequested: (listener) => listen('app:close-requested', listener),
    confirmClose: () => send('app:close-confirmed'),
  },
  shell: {
    openExternal: (url) => invoke('shell:open-external', url),
  },
  updater: {
    onReady: (listener) => listen('updater:ready', listener),
    install: () => invoke('updater:install'),
  },
};

contextBridge.exposeInMainWorld('noter', api);
