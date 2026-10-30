// Release (D42): builds the installer and publishes it to GitHub Releases, where the installed app
// looks for updates. Bump "version" in package.json, commit and push before running it: the app only
// updates to a higher version, and the release tag points at the current commit. Needs the GitHub CLI
// (`gh auth login`); the token comes from GH_TOKEN or from it.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';
import { build, Platform } from 'electron-builder';

const gh = (...args) => spawnSync('gh', args, { encoding: 'utf8' });
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!process.env.GH_TOKEN) {
  const result = gh('auth', 'token');
  const token = result.stdout?.trim();
  if (result.status !== 0 || !token) fail('No GitHub token: set GH_TOKEN or log in with `gh auth login`.');
  process.env.GH_TOKEN = token;
}

const { version } = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const config = fs.readFileSync('electron-builder.yml', 'utf8');
const owner = config.match(/^\s+owner: (\S+)$/m)?.[1];
const repo = config.match(/^\s+repo: (\S+)$/m)?.[1];
if (!owner || !repo) fail('No publish owner/repo in electron-builder.yml.');
const slug = `${owner}/${repo}`;
const tag = `v${version}`;

// electron-builder creates a missing release from two uploads at once, and the second one fails
// (422) halfway. With the release already there, it only uploads.
if (gh('release', 'view', tag, '--repo', slug).status !== 0) {
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
  const created = gh('release', 'create', tag, '--repo', slug, '--target', head, '--title', version, '--notes', '');
  if (created.status !== 0) fail(`Could not create the release ${tag} (is the commit pushed?):\n${created.stderr}`);
}

await build({ targets: Platform.WINDOWS.createTarget('nsis'), publish: 'always' });
