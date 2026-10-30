// Which links the app may hand to the system browser/mail client, and which navigations stay inside the app.

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

/** True for a parseable URL with an http, https or mailto protocol. */
export function isAllowedExternalUrl(url: string): boolean {
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
