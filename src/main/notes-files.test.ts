import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createNotesFiles } from './notes-files.js';

let root: string;
let trashed: string[];

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'noter-test-'));
  trashed = [];
});

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

function setup() {
  return createNotesFiles({
    documentsDir: root,
    trash: async (fullPath) => {
      trashed.push(fullPath);
    },
  });
}

async function setupOpen() {
  const notes = setup();
  const dir = await notes.openDir(null);
  return { notes, dir };
}

describe('openDir', () => {
  it('defaults to <documents>/Notas and creates it', async () => {
    const dir = await setup().openDir(null);
    expect(dir).toBe(path.join(root, 'Notas'));
    expect((await fs.stat(dir)).isDirectory()).toBe(true);
  });

  it('uses a custom path and treats a blank path as the default', async () => {
    const custom = path.join(root, 'a', 'b');
    expect(await setup().openDir(custom)).toBe(custom);
    expect(await setup().openDir('  ')).toBe(path.join(root, 'Notas'));
  });

  it('is required before the other methods', async () => {
    const notes = setup();
    await expect(notes.list()).rejects.toThrow('not opened');
    await expect(notes.save('a.md', 'x')).rejects.toThrow('not opened');
    await expect(notes.create('a', 'x')).rejects.toThrow('not opened');
  });
});

describe('save and read', () => {
  it('writes atomically and replaces', async () => {
    const { notes, dir } = await setupOpen();
    await notes.save('nota.md', 'primeira');
    const saved = await notes.save('nota.md', 'segunda');
    const read = await notes.read('nota.md');
    expect(read.content).toBe('segunda');
    expect(read.modifiedAt).toBe(saved.modifiedAt);
    expect(Number.isInteger(saved.modifiedAt)).toBe(true);
    await expect(fs.stat(path.join(dir, 'nota.md.tmp'))).rejects.toThrow();
  });

  it('round-trips UTF-8', async () => {
    const { notes } = await setupOpen();
    await notes.save('acentos.md', 'ação – ✓');
    expect((await notes.read('acentos.md')).content).toBe('ação – ✓');
  });

  it('keeps the BOM and rejects invalid UTF-8 instead of replacing it', async () => {
    const { notes, dir } = await setupOpen();
    await fs.writeFile(path.join(dir, 'bom.md'), '﻿texto');
    await fs.writeFile(path.join(dir, 'latin1.md'), Buffer.from([0x61, 0xe7, 0x61, 0x6f]));
    expect((await notes.read('bom.md')).content).toBe('﻿texto');
    await expect(notes.read('latin1.md')).rejects.toThrow();
    expect((await notes.list()).map((note) => note.file)).toEqual(['bom.md']);
  });
});

describe('create', () => {
  it('reserves a suffix on collision', async () => {
    const { notes } = await setupOpen();
    const files = [];
    for (let i = 0; i < 3; i++) files.push((await notes.create('2026-10-30_122905', `n${i}`)).file);
    expect(files).toEqual(['2026-10-30_122905.md', '2026-10-30_122905_2.md', '2026-10-30_122905_3.md']);
    expect((await notes.read('2026-10-30_122905_2.md')).content).toBe('n1');
  });

  it('rejects invalid base names', async () => {
    const { notes } = await setupOpen();
    await expect(notes.create('../x', '')).rejects.toThrow('invalid note file name');
    await expect(notes.create('', '')).rejects.toThrow('invalid note file name');
  });
});

describe('validation', () => {
  it('rejects invalid file names in read, save and delete', async () => {
    const { notes } = await setupOpen();
    const invalid = ['', '.md', '.hidden.md', '../fora.md', 'pasta/nota.md', 'pasta\\nota.md', 'C:nota.md', 'nota.txt'];
    for (const file of invalid) {
      await expect(notes.read(file), file).rejects.toThrow('invalid note file name');
      await expect(notes.save(file, ''), file).rejects.toThrow('invalid note file name');
      await expect(notes.delete(file), file).rejects.toThrow('invalid note file name');
    }
    expect(trashed).toEqual([]);
  });
});

describe('list', () => {
  it('lists only note files', async () => {
    const { notes, dir } = await setupOpen();
    await fs.writeFile(path.join(dir, 'a.md'), 'texto');
    await fs.writeFile(path.join(dir, 'b.md.tmp'), 'temporário');
    await fs.writeFile(path.join(dir, '.oculta.md'), 'oculta');
    await fs.writeFile(path.join(dir, 'c.txt'), 'outro');
    await fs.mkdir(path.join(dir, 'sub.md'));

    const list = await notes.list();
    expect(list.map((note) => note.file)).toEqual(['a.md']);
    expect(list[0].content).toBe('texto');
    expect(Number.isInteger(list[0].modifiedAt)).toBe(true);
  });
});

describe('delete', () => {
  it('sends the note path to the trash', async () => {
    const { notes, dir } = await setupOpen();
    await notes.save('apagar.md', 'x');
    await notes.delete('apagar.md');
    expect(trashed).toEqual([path.join(dir, 'apagar.md')]);
  });
});
