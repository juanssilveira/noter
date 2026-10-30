// Opens links in the default browser, through the main process (src/main/).

import { platform } from './platform';

/** Opens an http(s) or mailto link; other protocols are ignored by the main process. */
export function openExternal(url: string): Promise<void> {
  return platform.shell.openExternal(url);
}
