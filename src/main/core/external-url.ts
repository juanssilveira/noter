// Which links the app may hand to the system browser/mail client, and which navigations stay inside the app.

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
/** Windows settings pages the app links to: only these, not the whole ms-settings: scheme. */
const ALLOWED_SETTINGS_PAGES = new Set(['ms-settings:colors']);

/** True for a parseable URL with an http, https or mailto protocol, or an allowed settings page. */
export function isAllowedExternalUrl(url: string): boolean {
  if (ALLOWED_SETTINGS_PAGES.has(url)) return true;
  try {
    return ALLOWED_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

/** True when `url` is the app itself: same origin as the dev server, or the same file when `appUrl` is a file. */
export function isAppUrl(url: string, appUrl: string): boolean {
  try {
    const target = new URL(url);
    const app = new URL(appUrl);
    if (app.protocol === 'file:') return target.protocol === 'file:' && target.pathname === app.pathname;
    return target.origin === app.origin;
  } catch {
    return false;
  }
}
