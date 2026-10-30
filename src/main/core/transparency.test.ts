import { describe, expect, it } from 'vitest';
import { parseTransparencyEnabled } from './transparency.js';

const output = (value: string) =>
  `\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize\r\n    EnableTransparency    REG_DWORD    ${value}\r\n\r\n`;

describe('parseTransparencyEnabled', () => {
  it('reads on and off', () => {
    expect(parseTransparencyEnabled(output('0x1'))).toBe(true);
    expect(parseTransparencyEnabled(output('0x0'))).toBe(false);
  });

  it('is null when the value is missing', () => {
    expect(parseTransparencyEnabled('')).toBe(null);
    expect(parseTransparencyEnabled('ERROR: The system was unable to find the specified registry key or value.')).toBe(
      null,
    );
  });
});
