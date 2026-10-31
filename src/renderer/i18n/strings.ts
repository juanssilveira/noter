// Every interface text, in Portuguese and English (D41). Note content and file names are never translated.
// `Strings` comes from the Portuguese table, so an English key that is missing does not compile.

import type { Locale } from '../domain/language';

const pt = {
  // Sidebar
  allNotes: 'Todas as notas',
  notesList: 'Notas',
  hideList: 'Esconder lista',
  /** Sidebar footer hint (D43), after the Ctrl and T keycaps. */
  newNoteHint: 'para nova nota',
  hideListTitle: 'Esconder lista (Ctrl \\)',
  showList: 'Mostrar lista de notas',
  showListTitle: 'Mostrar lista (Ctrl \\)',
  listWidth: 'Largura da lista',
  noteActions: 'Ações da nota',
  rename: 'Renomear',
  delete: 'Apagar',
  noteTitle: 'Título da nota',

  // Note groups (D16)
  today: 'Hoje',
  yesterday: 'Ontem',
  last7Days: 'Últimos 7 dias',
  last30Days: 'Últimos 30 dias',

  // Title bar
  moreOptions: 'Mais opções',
  newNote: 'Nova nota',
  newNoteTitle: 'Nova nota (Ctrl T)',
  minimize: 'Minimizar',
  maximize: 'Maximizar',
  restore: 'Restaurar',
  close: 'Fechar',

  // Options menu
  options: 'Opções',
  general: 'Geral',
  appearance: 'Aparência',
  theme: 'Tema',
  system: 'Sistema',
  themeLight: 'Claro',
  themeDark: 'Escuro',
  language: 'Idioma',
  acrylic: 'Efeito acrílico',
  /** Under Efeito acrílico when it is on but Windows transparency effects are off. Opens the settings. */
  acrylicNeedsTransparency: 'Ative a transparência do Windows',
  layout: 'Layout',
  showNewNoteButton: 'Mostrar botão nova nota',
  spellcheck: 'Corretor ortográfico',
  shortcuts: 'Atalhos',
  toggleSidebar: 'Mostrar / esconder lista',

  // Aa menu
  formatting: 'Formatação',
  text: 'Texto',
  body: 'Corpo',
  small: 'Pequeno',
  bold: 'Negrito',
  italic: 'Itálico',
  underline: 'Sublinhado',
  strike: 'Tachado',
  code: 'Código',
  link: 'Link',
  highlight: 'Destacar',
  blocks: 'Blocos',
  bulletList: 'Lista com marcadores',
  orderedList: 'Lista numerada',
  quote: 'Citação',
  codeBlock: 'Bloco de código',
  table: 'Tabela',
  divider: 'Divisor',
  linkAddress: 'Endereço do link',
  pasteLink: 'Cole o link',

  // Tables
  insertTable: 'Inserir tabela',
  tableSize: (cols: number, rows: number) => `${cols} colunas por ${rows} linhas`,
  tablePickerHint: 'Colunas × linhas · clique pra inserir',
  insertRowAbove: 'Inserir linha acima',
  insertRowBelow: 'Inserir linha abaixo',
  insertColumnLeft: 'Inserir coluna à esquerda',
  insertColumnRight: 'Inserir coluna à direita',
  deleteRow: 'Apagar linha',
  deleteColumn: 'Apagar coluna',
  deleteTable: 'Apagar tabela',
  tableHint: 'Clique com o botão direito para opções',

  // Editor
  noteContent: 'Conteúdo da nota',
  /** First line of an empty note (D44). */
  notePlaceholder: 'Escreva algo…',

  // Note zoom (Ctrl + / Ctrl -)
  noteZoom: 'Zoom da nota',
  zoomOut: 'Diminuir zoom',
  zoomIn: 'Aumentar zoom',
  zoomReset: 'Voltar pra 100%',
  /** Tooltip of zoom out / zoom in at the limits, in place of the action. */
  zoomMinReached: 'Zoom mínimo atingido',
  zoomMaxReached: 'Zoom máximo atingido',
  saved: 'Salvo',

  // Updates (D42)
  updateReady: (version: string) => `Versão ${version} pronta`,
  restart: 'Reiniciar',
};

export type Strings = typeof pt;

const en: Strings = {
  allNotes: 'All notes',
  notesList: 'Notes',
  hideList: 'Hide list',
  newNoteHint: 'for a new note',
  hideListTitle: 'Hide list (Ctrl \\)',
  showList: 'Show notes list',
  showListTitle: 'Show list (Ctrl \\)',
  listWidth: 'List width',
  noteActions: 'Note actions',
  rename: 'Rename',
  delete: 'Delete',
  noteTitle: 'Note title',

  today: 'Today',
  yesterday: 'Yesterday',
  last7Days: 'Last 7 days',
  last30Days: 'Last 30 days',

  moreOptions: 'More options',
  newNote: 'New note',
  newNoteTitle: 'New note (Ctrl T)',
  minimize: 'Minimize',
  maximize: 'Maximize',
  restore: 'Restore',
  close: 'Close',

  options: 'Options',
  general: 'General',
  appearance: 'Appearance',
  theme: 'Theme',
  system: 'System',
  themeLight: 'Light',
  themeDark: 'Dark',
  language: 'Language',
  acrylic: 'Acrylic effect',
  acrylicNeedsTransparency: 'Turn on transparency in Windows',
  layout: 'Layout',
  showNewNoteButton: 'Show new note button',
  spellcheck: 'Spell check',
  shortcuts: 'Shortcuts',
  toggleSidebar: 'Show / hide list',

  formatting: 'Formatting',
  text: 'Text',
  body: 'Body',
  small: 'Small',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strike: 'Strikethrough',
  code: 'Code',
  link: 'Link',
  highlight: 'Highlight',
  blocks: 'Blocks',
  bulletList: 'Bulleted list',
  orderedList: 'Numbered list',
  quote: 'Quote',
  codeBlock: 'Code block',
  table: 'Table',
  divider: 'Divider',
  linkAddress: 'Link address',
  pasteLink: 'Paste the link',

  insertTable: 'Insert table',
  tableSize: (cols, rows) => `${cols} columns by ${rows} rows`,
  tablePickerHint: 'Columns × rows · click to insert',
  insertRowAbove: 'Insert row above',
  insertRowBelow: 'Insert row below',
  insertColumnLeft: 'Insert column left',
  insertColumnRight: 'Insert column right',
  deleteRow: 'Delete row',
  deleteColumn: 'Delete column',
  deleteTable: 'Delete table',
  tableHint: 'Right-click for options',

  noteContent: 'Note content',
  notePlaceholder: 'Write something…',

  noteZoom: 'Note zoom',
  zoomOut: 'Zoom out',
  zoomIn: 'Zoom in',
  zoomReset: 'Reset to 100%',
  zoomMinReached: 'Minimum zoom reached',
  zoomMaxReached: 'Maximum zoom reached',
  saved: 'Saved',

  updateReady: (version) => `Version ${version} ready`,
  restart: 'Restart',
};

export const STRINGS: Record<Locale, Strings> = { pt, en };

/** Language names in their own language, so each one is findable whatever the current one is. */
export const LANGUAGE_NAMES: Record<Locale, string> = { pt: 'Português', en: 'English' };
