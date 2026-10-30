// Preview: the first piece of text in the body, without Markdown syntax, on a single line.

const BLOCK_PREFIX = /^\s*(?:#{1,6}\s+|>\s*|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+(?:\[[ xX]\]\s+)?|\[[ xX]\]\s+)/;
const NON_TEXT_LINE = /^\s*(?:```.*|~~~.*|[-*_]{3,}|\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)*\|?)\s*$/;

function stripInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<\/?(?:u|small)>/gi, '')
    .replace(/(\*\*|__|~~|==)(.+?)\1/g, '$2')
    .replace(/(\*|_)(.+?)\1/g, '$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\\([\\`*_{}[\]()#+\-.!|=~<>])/g, '$1');
}

function tableRowText(line: string): string {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim())
    .filter(Boolean)
    .join(' ');
}

export function notePreview(body: string): string {
  for (const rawLine of body.split('\n')) {
    if (NON_TEXT_LINE.test(rawLine)) continue;
    let line = rawLine;
    // Repeated prefixes cover nesting like "> - [ ] item".
    for (let previous = ''; previous !== line; ) {
      previous = line;
      line = line.replace(BLOCK_PREFIX, '');
    }
    if (line.includes('|')) line = tableRowText(line);
    const text = stripInline(line).replace(/\s+/g, ' ').trim();
    if (text) return text;
  }
  return '';
}
