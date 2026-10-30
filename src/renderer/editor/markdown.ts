// Markdown body ↔ editor document. The editor never sees or stores anything but Markdown on disk.

import type { JSONContent } from '@tiptap/core';
import { MarkdownManager } from '@tiptap/markdown';
import { noteExtensions } from './extensions';

let manager: MarkdownManager | null = null;

function getManager(): MarkdownManager {
  manager ??= new MarkdownManager({ extensions: noteExtensions() });
  return manager;
}

const INLINE_TYPES = new Set(['text', 'rawInline', 'hardBreak']);
/** Node types whose content is a sequence of blocks. */
const BLOCK_CONTAINERS = new Set(['doc', 'blockquote', 'listItem', 'taskItem']);

/** Wraps inline nodes that ended up directly in a block container (e.g. an image alone on a line). */
function wrapStrayInlines(node: JSONContent): JSONContent {
  if (!node.content) return node;
  const children = node.content.map(wrapStrayInlines);
  if (!BLOCK_CONTAINERS.has(node.type ?? '')) return { ...node, content: children };

  const content: JSONContent[] = [];
  let run: JSONContent[] = [];
  const flush = () => {
    if (run.length) content.push({ type: 'paragraph', content: run });
    run = [];
  };
  for (const child of children) {
    if (INLINE_TYPES.has(child.type ?? '')) {
      run.push(child);
    } else {
      flush();
      content.push(child);
    }
  }
  flush();
  return { ...node, content };
}

export function markdownToDoc(markdown: string): JSONContent {
  const doc = wrapStrayInlines(getManager().parse(markdown));
  if (!doc.content?.length) return { type: 'doc', content: [{ type: 'paragraph' }] };
  return doc;
}

/** Serializes the document; the result ends with a single newline, or is empty for an empty note. */
export function docToMarkdown(doc: JSONContent): string {
  const markdown = getManager().serialize(doc).replace(/^\n+/, '').replace(/\s+$/, '');
  return markdown ? `${markdown}\n` : '';
}
