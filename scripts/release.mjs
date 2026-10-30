// Release (D42): builds the installer and publishes it to GitHub Releases, where the installed app
// looks for updates. Bump "version" in package.json before running it: the app only updates to a
// higher version. The token comes from GH_TOKEN or, when that is not set, from the GitHub CLI.

import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { build, Platform } from 'electron-builder';

if (!process.env.GH_TOKEN) {
  const gh = spawnSync('gh', ['auth', 'token'], { encoding: 'utf8', shell: true });
  const token = gh.stdout?.trim();
  if (gh.status !== 0 || !token) {
    console.error('No GitHub token: set GH_TOKEN or log in with `gh auth login`.');
    process.exit(1);
  }
  process.env.GH_TOKEN = token;
}

await build({ targets: Platform.WINDOWS.createTarget('nsis'), publish: 'always' });
