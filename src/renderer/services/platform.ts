// The only place that touches `window.noter`, the API the Electron preload exposes (src/preload/preload.cts).
// The contract lives in src/shared/noter-api.ts; the main process is in src/main/.

import type { NoterApi } from '../../shared/noter-api';

declare global {
  interface Window {
    noter: NoterApi;
  }
}

export const platform: NoterApi = window.noter;
