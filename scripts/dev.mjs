// Development: compiles the main process, starts the Vite dev server and opens Electron on it.
// Changes in src/renderer/ reload live; changes in src/main/ or src/preload/ need a restart (Ctrl+C and run again).

import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import process from 'node:process';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const electronPath = require('electron');
const tscPath = require.resolve('typescript/bin/tsc');

const compiled = spawnSync(process.execPath, [tscPath, '-p', 'tsconfig.main.json'], { stdio: 'inherit' });
if (compiled.status !== 0) process.exit(compiled.status ?? 1);

const server = await createServer();
await server.listen();
const url = server.resolvedUrls?.local[0];

const env = { ...process.env, NOTER_DEV_SERVER_URL: url };
// Set by some terminals (VS Code); it makes Electron run as plain Node.
delete env.ELECTRON_RUN_AS_NODE;

const electron = spawn(electronPath, ['.'], { stdio: 'inherit', env });
electron.on('exit', async (code) => {
  await server.close();
  process.exit(code ?? 0);
});
