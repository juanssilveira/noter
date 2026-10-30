// Minimum window size depends on the sidebar: with it open, the title bar still needs its full width.
// The sizes live in src/main/core/min-window-size.ts.

import { platform } from './platform';

/** Sets the minimum size for the sidebar state and grows the window when it is smaller than that. */
export function applyMinWindowSize(sidebarOpen: boolean): Promise<void> {
  return platform.window.applyMinSize(sidebarOpen);
}
