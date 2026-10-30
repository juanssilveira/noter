// Note file names: "AAAA-MM-DD_HHMMSS.md" from the local creation time (D06). They never change.

const pad = (value: number) => String(value).padStart(2, '0');

const FILE_NAME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})_(\d{2})(\d{2})(\d{2})(?:_\d+)?\.md$/;

/** "2026-10-30_122905". The main process appends ".md", or "_2.md", "_3.md"… on a collision. */
export function noteBaseName(created: Date): string {
  const day = `${created.getFullYear()}-${pad(created.getMonth() + 1)}-${pad(created.getDate())}`;
  const time = `${pad(created.getHours())}${pad(created.getMinutes())}${pad(created.getSeconds())}`;
  return `${day}_${time}`;
}

/** Creation time encoded in a note file name, or null when the name does not follow the pattern. */
export function dateFromFileName(file: string): Date | null {
  const match = FILE_NAME_PATTERN.exec(file);
  if (!match) return null;
  const [year, month, day, hours, minutes, seconds] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day, hours, minutes, seconds);
  // Reject impossible values like month 13, which Date would silently roll over.
  if (date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hours) return null;
  return date;
}
