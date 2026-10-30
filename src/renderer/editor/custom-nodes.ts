// Nodes that the stock Tiptap extensions don't cover. Mapping: docs/note-format.md.

import { Extension, type JSONContent, mergeAttributes, Node } from '@tiptap/core';

/** "Pequeno" block style, stored as a whole paragraph wrapped in <small>…</small>. */
export const SmallText = Node.create({
  name: 'smallText',
  group: 'block',
  content: 'inline*',

  parseHTML() {
    // Above the default 50, or paragraph's "p" rule takes it on paste.
    return [{ tag: 'p.text-small', priority: 60 }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { class: 'text-small' }), 0];
  },

  markdownTokenizer: {
    name: 'smallText',
    level: 'block',
    // Only a <small> at the start of a line may begin this block; one in the middle of text stays inline.
    start: (src: string) => {
      const match = /(^|\n)<small>/.exec(src);
      return match ? match.index + match[1].length : -1;
    },
    tokenize(src, _tokens, lexer) {
      const match = /^<small>([^\n]*?)<\/small>[ \t]*(?:\n|$)/.exec(src);
      if (!match) return undefined;
      return { type: 'smallText', raw: match[0], text: match[1], tokens: lexer.inlineTokens(match[1]) };
    },
  },

  parseMarkdown(token, helpers) {
    return helpers.createNode('smallText', {}, helpers.parseInline(token.tokens ?? []));
  },

  renderMarkdown(node, helpers) {
    return `<small>${helpers.renderChildren(node.content ?? [])}</small>`;
  },
});

// Markdown the editor has no node for (images, arbitrary HTML) is kept verbatim in these
// read-only atoms, so saving a note edited elsewhere never drops content.

export const RawInline = Node.create({
  name: 'rawInline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return { raw: { default: '' } };
  },

  parseHTML() {
    return [{ tag: 'span[data-raw-markdown]', getAttrs: (el) => ({ raw: el.textContent ?? '' }) }];
  },

  renderHTML({ node }) {
    return ['span', { 'data-raw-markdown': '', class: 'raw-markdown' }, node.attrs.raw];
  },

  // Inline HTML tags other than <u>/</u> (e.g. <span>, <br>, comments) become raw atoms.
  markdownTokenName: 'rawHtmlInline',
  markdownTokenizer: {
    name: 'rawHtmlInline',
    level: 'inline',
    start: (src: string) => src.search(/<[a-zA-Z/!]/),
    tokenize(src) {
      const match = /^(?:<!--[\s\S]*?-->|<\/?[a-zA-Z][\w-]*(?:\s[^<>]*)?\/?>)/.exec(src);
      if (!match || SUPPORTED_HTML.test(match[0])) return undefined;
      return { type: 'rawHtmlInline', raw: match[0] };
    },
  },

  parseMarkdown(token) {
    return rawNode(token.raw ?? '', false);
  },

  renderMarkdown(node) {
    return node.attrs?.raw ?? '';
  },
});

export const RawBlock = Node.create({
  name: 'rawBlock',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return { raw: { default: '' } };
  },

  parseHTML() {
    // Above the default 50, or the code block's "pre" rule takes it on paste.
    return [{ tag: 'pre[data-raw-markdown]', priority: 60, getAttrs: (el) => ({ raw: el.textContent ?? '' }) }];
  },

  renderHTML({ node }) {
    return ['pre', { 'data-raw-markdown': '', class: 'raw-markdown' }, node.attrs.raw];
  },

  renderMarkdown(node) {
    return node.attrs?.raw ?? '';
  },
});

/** HTML tags the schema understands; any other HTML is preserved raw. */
const SUPPORTED_HTML = /^<\/?u>$/i;

function rawNode(raw: string, block: boolean): JSONContent {
  const text = block ? raw.replace(/\n+$/, '') : raw;
  return { type: block ? 'rawBlock' : 'rawInline', attrs: { raw: text } };
}

export const PreserveImages = Extension.create({
  name: 'preserveImages',
  markdownTokenName: 'image',
  parseMarkdown(token) {
    return rawNode(token.raw ?? '', false);
  },
});

export const PreserveHtml = Extension.create({
  name: 'preserveHtml',
  markdownTokenName: 'html',
  parseMarkdown(token) {
    const raw = token.raw ?? '';
    // Returning nothing hands the token to Tiptap's own HTML handling (used by <u>).
    if (SUPPORTED_HTML.test(raw.trim())) return undefined as unknown as JSONContent;
    return rawNode(raw, Boolean(token.block));
  },
});
