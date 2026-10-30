// Note file format: YAML front matter + Markdown body. Spec: docs/note-format.md.

import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { toLocalIsoString } from './dates';
import { dateFromFileName } from './file-name';

export type NoteMeta = {
  created: Date;
  updated: Date;
  /** Custom title from "Renomear"; null means the creation date is shown. */
  title: string | null;
  /** Unknown front matter keys, preserved on save. */
  extra: Record<string, unknown>;
};

export type Note = {
  file: string;
  meta: NoteMeta;
  /** Markdown after the front matter, kept verbatim. */
  body: string;
};

const KNOWN_KEYS = new Set(['created', 'updated', 'title']);

type SplitResult = { frontMatter: Record<string, unknown> | null; body: string };

function normalize(content: string): string {
  return content.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
}

function splitFrontMatter(text: string): SplitResult {
  if (!text.startsWith('---\n')) return { frontMatter: null, body: text };

  const close = /^---[ \t]*$/m;
  const rest = text.slice(4);
  const match = close.exec(rest);
  if (!match) return { frontMatter: null, body: text };

  const yamlSource = rest.slice(0, match.index);
  const afterClose = rest.slice(match.index + match[0].length);
  const body = afterClose.startsWith('\n') ? afterClose.slice(1) : afterClose;

  try {
    const parsed: unknown = parseYaml(yamlSource);
    if (parsed === null || parsed === undefined) return { frontMatter: {}, body };
    if (typeof parsed !== 'object' || Array.isArray(parsed)) return { frontMatter: null, body: text };
    return { frontMatter: parsed as Record<string, unknown>, body };
  } catch {
    // Invalid YAML: keep the whole text as body so nothing is lost when the note is saved again.
    return { frontMatter: null, body: text };
  }
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Reads a note file. Missing or invalid fields fall back to: the date in the file name,
 * then `fileModified` (from the file system), then now.
 */
export function parseNote(file: string, content: string, fileModified?: Date): Note {
  const { frontMatter, body } = splitFrontMatter(normalize(content));
  const fields = frontMatter ?? {};

  const created = toDate(fields.created) ?? dateFromFileName(file) ?? fileModified ?? new Date();
  const updated = toDate(fields.updated) ?? fileModified ?? created;
  const title = typeof fields.title === 'string' && fields.title.trim() !== '' ? fields.title.trim() : null;

  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (!KNOWN_KEYS.has(key)) extra[key] = value;
  }

  return { file, meta: { created, updated, title, extra }, body };
}

/** Writes a note file. `title` is omitted when unset. */
export function serializeNote(note: Note): string {
  const { created, updated, title, extra } = note.meta;
  const fields: Record<string, unknown> = {
    created: toLocalIsoString(created),
    updated: toLocalIsoString(updated),
  };
  if (title) fields.title = title;
  Object.assign(fields, extra);

  return `---\n${stringifyYaml(fields)}---\n${note.body}`;
}

export function isBlankBody(body: string): boolean {
  return body.trim() === '';
}
