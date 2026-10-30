// After an agent edits a .ts/.tsx/.cts file in src/, formats it with Biome and sends back what is left to fix.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const input = JSON.parse(readFileSync(0, 'utf8'));
const file = input.tool_input?.file_path;
if (!file) process.exit(0);

const relative = path.relative(root, path.resolve(root, file)).replaceAll('\\', '/');
if (!/^src\/.+\.(tsx?|cts)$/.test(relative)) process.exit(0);

const biome = path.join(root, 'node_modules/@biomejs/biome/bin/biome');
try {
  execFileSync(process.execPath, [biome, 'check', '--write', '--colors=off', relative], {
    cwd: root,
    stdio: 'pipe',
  });
} catch (error) {
  // Exit code 2 hands stderr to the agent, which then fixes the remaining errors.
  process.stderr.write(`Biome found problems in ${relative}:\n${error.stdout}${error.stderr}`);
  process.exit(2);
}
