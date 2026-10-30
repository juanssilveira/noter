// Automatic updates (D42): the main process downloads them (src/main/updater.ts); the page only hears
// when one is ready and asks to install it.

import { platform } from './platform';

/** Returns a function that stops listening. */
export function onUpdateReady(listener: (version: string) => void): () => void {
  // A preload from before the updater (a dev session not restarted yet) has no updater API.
  return platform.updater?.onReady(listener) ?? (() => {});
}

/** Quits, installs and reopens. Flush pending saves before calling it. */
export function installUpdate(): Promise<void> {
  return platform.updater.install();
}
