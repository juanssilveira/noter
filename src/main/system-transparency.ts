// Reads the Windows transparency effects switch (core/transparency.ts) from the registry.

import { execFile } from 'node:child_process';
import { parseTransparencyEnabled, TRANSPARENCY_KEY, TRANSPARENCY_VALUE } from './core/transparency.js';

/** True when transparency effects are on. When it can't tell, true: no warning is better than a wrong one. */
export function readTransparencyEnabled(): Promise<boolean> {
  return new Promise((resolve) => {
    execFile('reg', ['query', TRANSPARENCY_KEY, '/v', TRANSPARENCY_VALUE], { windowsHide: true }, (error, stdout) => {
      resolve(error ? true : (parseTransparencyEnabled(stdout) ?? true));
    });
  });
}
