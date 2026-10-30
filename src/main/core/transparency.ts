// Windows transparency effects (Settings > Personalization > Colors): off, Windows draws the acrylic
// material solid (D40). Read with `reg query`; the parsing is here, so it is tested without Windows.

export const TRANSPARENCY_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize';
export const TRANSPARENCY_VALUE = 'EnableTransparency';

/** On or off from the `reg query` output; null when the value is not there. */
export function parseTransparencyEnabled(output: string): boolean | null {
  const match = /EnableTransparency\s+REG_DWORD\s+0x([0-9a-f]+)/i.exec(output);
  return match ? Number.parseInt(match[1], 16) !== 0 : null;
}
