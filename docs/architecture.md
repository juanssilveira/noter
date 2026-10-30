# Arquitetura

> O scaffold existe (etapa 1 do roadmap). Mantenha as seções "Estrutura de pastas" e "Comandos" iguais ao que existe de verdade.

## Visão geral

```
┌────────────── Processo principal (src/main/ · Electron, Node) ──────────────┐
│  Janela sem moldura · instância única · estado da janela · preferências      │
│  I/O de notas: listar, ler, salvar (atômico), criar, mandar pra Lixeira      │
└───────────────────────────────▲─────────────────────────────────────────────┘
                                │ IPC (canais tipados) via preload: window.noter
┌───────────────────────────────┴── Renderer (src/renderer/ · React + TS) ────┐
│  Domínio de notas (TS puro): parse/serialize .md, título, prévia, grupos     │
│  Estado do app: lista, nota aberta, rascunho, preferências                   │
│  UI: barra, sidebar, menus, editor Tiptap                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Princípio:** o processo principal é fino e só cuida de janela, sistema e arquivos. Toda a lógica de notas fica em TypeScript puro, testável com Vitest, sem depender do Electron (**D34**). Dentro do processo principal, o que é lógica pura (validação, limites, URLs) fica em `src/main/core/`, e o resto são adaptadores finos.

## Processo principal (`src/main/`)

### Janela
- `BrowserWindow` com `frame: false` e `resizable: true` (`main-window.ts`).
- Manter a sombra nativa, que no Windows 11 dá a borda e o canto arredondado do sistema (**D29**). O raio de 14 px do canvas é de mockup; a janela real usa o canto nativo.
- Tamanho mínimo de 720×480 com a sidebar fechada e 860×480 com ela aberta (300 da lista + 560 pra barra caber inteira). Os valores ficam em `src/main/core/min-window-size.ts`. Quando a sidebar abre ou fecha, o frontend chama `window:apply-min-size` (via `src/renderer/services/`), que troca o mínimo e aumenta a janela se ela estiver menor que ele (exceto maximizada).
- Tamanho, posição e estado maximizado: `window-state.ts` grava e restaura (`window-state.json` no `userData`). Os limites vêm de `src/main/core/`.
- Arraste: o atributo `data-drag-region` com `-webkit-app-region: drag` no CSS. Os descendentes e os menus ficam em `no-drag`. O duplo clique na barra maximiza nativamente.
- Os botões de minimizar, maximizar e fechar chamam os canais `window:*`. O evento `window:maximized-changed` avisa o renderer pra trocar o ícone do maximizar.
- Segurança: `contextIsolation`, `sandbox`, sem navegação da janela. Links externos só abrem por `shell:open-external` (http, https e mailto). Não há CSP, porque o app não carrega conteúdo remoto.

### Ciclo de vida
- `main.ts`: fixa o `userData` em `%AppData%\com.noter.app\`, pede o lock de instância única, tira o menu do app e encerra quando a janela fecha.
- **Instância única** (`app.requestSingleInstanceLock()`): o segundo lançamento mostra e foca a janela existente.
- **Fechar (D33):**
  1. o processo principal intercepta o fechamento da janela (X ou Alt+F4);
  2. envia `app:close-requested` pro renderer;
  3. o renderer roda `flushPending` e responde `app:close-confirmed`;
  4. o processo principal fecha a janela e o app encerra.

  Timeout de segurança de 3 s, pra o app não ficar preso se o renderer não responder. As preferências pendentes são gravadas antes de sair.
- **Atualização (D42):** `updater.ts` usa o `electron-updater` (dependência de produção, a única além do que o Vite empacota). Só roda com `app.isPackaged`: procura ao abrir e a cada 6 h, baixa sozinho (`autoDownload`) e instala ao sair (`autoInstallOnAppQuit`). Terminado o download, envia `updater:ready` com a versão. O `updater:install` chama `quitAndInstall` (silencioso, reabre o app). O renderer roda `flushPending` antes de pedir. O endereço vem do `publish` do `electron-builder.yml`, gravado no `resources/app-update.yml` do instalador.

### Equivalentes do Electron
| Necessidade | No Electron |
|---|---|
| uma instância só | `app.requestSingleInstanceLock()` |
| tamanho, posição e estado maximizado | `window-state.ts` (próprio) |
| `config.json` de preferências | `settings-file.ts` (próprio): gravação atômica com debounce, gravada ao sair |
| abrir link no navegador padrão | `shell.openExternal` |
| mandar o arquivo pra Lixeira do Windows | `shell.trashItem` |
| pasta Documentos | `app.getPath('documents')` (respeita o redirecionamento do OneDrive) |

### Canais IPC (contrato com o frontend)
O contrato (tipos e nomes dos canais) fica em `src/shared/noter-api.ts`. O `preload.cts` o expõe como `window.noter` com `contextBridge`, e o `ipc.ts` registra os canais. No frontend, só `src/renderer/services/` usa `window.noter`. O `ipc.ts` é a fronteira de confiança: valida os argumentos vindos do renderer. As notas ficam em `src/main/notes-files.ts` (`node:fs`, sem importar o `electron`; a Lixeira é injetada). `modifiedAt` é a data de modificação do arquivo, em milissegundos desde a época Unix.

| Canal | Entrada | Saída | Observação |
|---|---|---|---|
| `notes:open-dir` | `path` (string ou null) | caminho completo | define a pasta das notas: `path` vem das preferências, e `null` usa `Documentos\Notas`. Cria a pasta se faltar. Tem que ser chamado antes dos outros. |
| `notes:list` | – | `[{ file, content, modifiedAt }]` | lê os `*.md` da pasta (não recursivo). Ignora arquivos ocultos e `.tmp`, e pula arquivos ilegíveis em vez de falhar. |
| `notes:read` | `file` | `{ content, modifiedAt }` | |
| `notes:save` | `file, content` | `{ modifiedAt }` | grava em `.tmp` e renomeia por cima |
| `notes:create` | `baseName, content` | `{ file, modifiedAt }` | reserva o nome com abertura exclusiva e resolve colisões com o sufixo `_2`, `_3`… |
| `notes:delete` | `file` | – | manda pra Lixeira (`shell.trashItem`) |
| `settings:load` | – | objeto | conteúdo bruto do `config.json` (vazio se faltar ou for inválido). Quem valida é o renderer. |
| `settings:set` | `key, value` | – | muda uma chave. A gravação é adiada (debounce) e sempre acontece antes de sair. |
| `window:show` | – | – | mostra a janela |
| `window:minimize` | – | – | |
| `window:toggle-maximize` | – | – | |
| `window:close` | – | – | igual ao Alt+F4: passa pelo fluxo de fechar |
| `window:is-maximized` | – | boolean | |
| `window:apply-min-size` | `sidebarOpen` | – | troca o tamanho mínimo e aumenta a janela se preciso |
| `window:set-appearance` | `theme, acrylic` | – | aplica o tema no `nativeTheme.themeSource`, liga ou desliga o material acrílico e acerta a cor de fundo nativa (D39, D40) |
| `shell:open-external` | `url` | – | só http, https e mailto |
| `updater:install` | – | – | fecha, instala a versão baixada e reabre o app (D42) |

Eventos: do renderer pro processo principal, `app:close-confirmed`. Do processo principal pro renderer, `app:close-requested`, `window:maximized-changed` e `updater:ready` (com a versão baixada, D42).

Os canais de nota validam que `file` é um nome simples dentro da pasta de notas: sem `..`, sem separadores, sem começar com ponto e terminado em `.md` (regra em `src/main/core/`).

## Renderer (`src/renderer/`)

### Camadas
1. **Domínio** (TS puro, sem React e sem Electron):
   - `parse(md) → Note` e `serialize(Note) → md` (front matter e corpo);
   - título exibido, prévia, agrupamento da lista e formatação de datas em pt-BR;
   - regras de rascunho.
2. **Serviços:** wrappers do `window.noter` (notas, preferências, janela, fechar e links). É o único ponto do renderer que toca nele.
3. **Estado:** a lista de notas, a nota aberta, o rascunho, a edição pendente e as preferências. Usa uma store Zustand (`src/renderer/state/app-store.ts`), lida pela barra, pela sidebar e pela área da nota.
4. **UI:** os componentes React e o editor Tiptap.

### Editor (Tiptap v3)
- **Schema** (`src/renderer/editor/extensions.ts`): é o mesmo pro editor e pra conversão.
  - StarterKit: parágrafo, títulos 1 a 3, listas, citação, bloco de código, divisor, negrito, itálico, sublinhado, tachado, código e link.
  - Highlight, TaskList/TaskItem (aninhável) e TableKit. As células aceitam exatamente um parágrafo.
  - Nós próprios em `custom-nodes.ts`: `smallText` (Pequeno), `rawInline` e `rawBlock` (conteúdo preservado).
- **Markdown** (`src/renderer/editor/markdown.ts`): usa o `MarkdownManager` do `@tiptap/markdown` diretamente, sem a extensão `Markdown` no editor.
  - `markdownToDoc` lê o corpo pro editor e coloca dentro de parágrafo qualquer nó inline que tenha ficado solto, como uma imagem sozinha numa linha.
  - `docToMarkdown` grava o corpo, sempre terminando com uma única quebra de linha (ou vazio).
- O editor recebe e devolve **Markdown**. O formato interno do Tiptap nunca é gravado em disco.
- **Entradas** (`src/renderer/domain/entries.ts`): cada nota em memória é uma `Entry`, com `id` estável na sessão, `note`, `modifiedAt` e `revision`.
  - Um rascunho é uma entrada com `file === ""`.
  - O `id` não muda quando o rascunho ganha arquivo, então o editor não recarrega no meio da digitação.
- **Montagem:** `NoteEditor` é montado com `key={id:revision}`. Trocar de nota recria o editor, e o mesmo acontece quando a nota é recarregada do disco (`revision` sobe). O conteúdo inicial vem só na criação.
- **Salvamento** (`app-store.ts`):
  - `markDirty(id, readBody)` registra a edição e agenda `flushPending` pra 500 ms depois. A serialização só acontece na hora de salvar.
  - `flushPending` também roda ao trocar de nota, quando a janela perde o foco e ao fechar o app (D33).
  - Se o corpo não mudou, não grava.
- **Fila de gravação:** toda escrita em disco passa por uma fila única, em ordem: criar, salvar e mandar pra Lixeira. Isso garante, por exemplo, que apagar uma nota nunca recria o arquivo por causa de um salvamento pendente.
  - Uma escrita que falha é tentada de novo no próximo `flushPending`.
  - `reloadFromDisk` (D08) não roda com edição pendente ou escrita em andamento.

### Preferências (`%AppData%\com.noter.app\config.json`)

| Chave | Tipo | Padrão |
|---|---|---|
| `notesDir` | string | `<Documentos>\Notas` |
| `lastNote` | string \| null | `null` |
| `cursors` | `{ [file]: position }` | `{}` (opcional: a posição do cursor por nota) |
| `sidebarOpen` | boolean | `true` |
| `sidebarWidth` | number | `300` (de 240 a 400, D38) |
| `showNewNoteButton` | boolean | `true` |
| `spellcheck` | boolean | `true` (corretor ortográfico do editor) |
| `theme` | `"system"` \| `"light"` \| `"dark"` | `"system"` (D39; valor desconhecido vira `"system"`) |
| `acrylic` | boolean | `false` (efeito acrílico na sidebar, D40) |
| `language` | `"system"` \| `"pt"` \| `"en"` | `"system"` (D41; segue o idioma do Windows; valor desconhecido vira `"system"`) |

O tamanho e a posição da janela ficam no `window-state.json`, não aqui.

### Fonte
Geist, Geist Itálico e Geist Mono variáveis, em `woff2`, ficam em `src/renderer/styles/fonts/` (copiadas do pacote npm `geist`, com a licença OFL junto) e são declaradas em `src/renderer/styles/fonts.css`. Nenhuma requisição externa.

### Identificador do app
`com.noter.app`. O Electron usaria outro nome por padrão, então o `main.ts` força o `userData` em `%AppData%\com.noter.app\`, onde ficam o `config.json` e o `window-state.json`. O Electron também guarda ali os caches dele.

## Estrutura de pastas

```
noter/
├─ AGENTS.md              ponto de entrada pros agentes
├─ .claude/               settings.json + hooks/biome.mjs (formata cada arquivo editado da src/)
├─ docs/                  esta documentação
├─ src/                   todo o código do app, separado por processo
│  ├─ main/               processo principal (Node + Electron)
│  │  ├─ main.ts          entrada: userData, instância única, sem menu do app, encerra quando a janela fecha
│  │  ├─ main-window.ts   BrowserWindow sem moldura, segurança, fluxo de fechar, evento de maximizar
│  │  ├─ window-state.ts  grava e restaura tamanho, posição e maximizado (window-state.json)
│  │  ├─ settings-file.ts config.json no userData, gravação atômica com debounce, gravada ao sair
│  │  ├─ notes-files.ts   I/O das notas com node:fs (gravação atômica, criação exclusiva, Lixeira injetada); não importa o electron
│  │  ├─ ipc.ts           registra os canais IPC e valida os argumentos do renderer
│  │  ├─ updater.ts       atualização automática pelo GitHub Releases, só no app instalado (D42)
│  │  └─ core/            TS puro (sem electron e sem fs) + testes: validação de nome de arquivo,
│  │                      limites da janela, tamanho mínimo, URLs externas permitidas,
│  │                      tema e cor de fundo nativa (appearance)
│  ├─ preload/
│  │  └─ preload.cts      contextBridge → window.noter (CommonJS, sandbox, só requer o electron)
│  ├─ shared/
│  │  └─ noter-api.ts    contrato (só tipos) entre o preload e o renderer: NoterApi e os nomes dos canais
│  └─ renderer/           a interface (React), servida pelo Vite
│     ├─ index.html
│     ├─ main.tsx         entrada: importa os estilos e monta o App
│     ├─ app.tsx          casca: mostra a janela, escuta app:close-requested
│     ├─ domain/          TS puro + testes: note (front matter), file-name, dates,
│     │                   preview, list-item, note-groups, sidebar-width, theme, language,
│     │                   entries, selection
│     ├─ services/        wrappers do window.noter (notas, preferências, janela, fechar, links, atualização);
│     │                   o único lugar que o toca
│     ├─ state/           app-store.ts (Zustand: entradas, seleção, rascunho, fila de gravação)
│     ├─ editor/          extensions.ts (schema), custom-nodes.ts (Pequeno, conteúdo
│     │                   preservado), markdown.ts (conversão) + testes de ida e volta
│     │                   links.ts (normalizar endereço do link)
│     │                   table-behavior.ts (Enter na tabela, dica de clique direito)
│     ├─ components/      title-bar, sidebar, note-editor, context-menu, format-menu,
│     │                   table-picker, options-menu, save-indicator, sidebar-resizer, update-notice, icons
│     ├─ i18n/            strings.ts (todo texto da interface em português e inglês, D41),
│     │                   use-strings.ts (useLocale e useStrings: o idioma em uso e os textos dele)
│     ├─ hooks/           use-dismiss.ts (fechar menus), use-menu-position.ts (menu na posição do mouse),
│     │                   use-theme.ts (data-theme no <html>, seguindo o Windows)
│     └─ styles/          fonts.css, tokens.css, note-styles.css, editor.css, app.css, fonts/
├─ scripts/
│  ├─ dev.mjs             dev: compila main/preload, sobe o Vite e abre o Electron (mudança fora do renderer pede reinício)
│  └─ release.mjs         release: gera o instalador e publica no GitHub Releases, com o token do GH_TOKEN ou do gh (D42)
├─ build/
│  ├─ icon.ico            ícone do app (16 a 256 px), pro electron-builder (D35)
│  └─ icon.png            o mesmo ícone em 256 px
├─ biome.json             formatação e lint de src/ e scripts/ (D32 pros nomes de arquivo)
├─ electron-builder.yml   instalador NSIS (um clique, por usuário), gerado em release/, e publicação no GitHub (D42)
├─ vite.config.ts         Vite com raiz em src/renderer/ (saída em dist/renderer/) e config do Vitest
├─ tsconfig.json          tipos do renderer (src/renderer/ e src/shared/)
├─ tsconfig.main.json     compila src/main/, src/preload/ e src/shared/ pra dist/ (módulo NodeNext)
├─ tsconfig.node.json     tipos do vite.config.ts
├─ dist/                  saída do build: main/, preload/, shared/ e renderer/
└─ release/               saída do instalador
```

Código, nomes de arquivos e pastas e identificadores são em inglês (D28), e os nomes de arquivo em kebab-case (D32).

`src/renderer/styles/note-styles.css` é a cópia de trabalho de `docs/design/note-styles.css`. Se um mudar, atualize o outro.

## Pré-requisitos (Windows)

- Node 24 ou mais novo, com npm.

Não precisa de Rust, de Visual Studio nem do WebView2: o Electron já traz o Chromium.

## Comandos

| Comando | O que faz |
|---|---|
| `npm install` | instala as dependências |
| `npm run dev` | roda o app em modo de desenvolvimento (`scripts/dev.mjs`) |
| `npm run build` | checa os tipos (`tsc`), gera o frontend (`vite build`) e compila `src/main/`, `src/preload/` e `src/shared/` pra `dist/` |
| `npm run dist` | `build` mais electron-builder: gera o instalador NSIS em `release/`, sem publicar |
| `npm run release` | `build` mais `scripts/release.mjs`: gera o instalador e publica numa release do `juanssilveira/noter` (D42). Antes, suba a `version` do `package.json`. O token vem do `GH_TOKEN` ou do `gh auth token` |
| `npm test` | roda os testes (Vitest), de todas as pastas da `src/` |
| `npx tsc --noEmit` | checa os tipos |
| `npm run lint` | checa formatação, imports e lint de `src/` e `scripts/` (Biome, config em `biome.json`) |
| `npm run format` | formata esses diretórios e aplica as correções seguras do Biome |

## Testes

- **Obrigatório:** os testes unitários do domínio, principalmente a ida e volta do formato ([note-format.md](note-format.md#testes-obrigatórios)) e o agrupamento da lista. Inclua as viradas de dia, de mês e de ano, e os limites de cada grupo.
- **Desejável:** testes de `src/main/` (Vitest, sem Electron) pra gravação atômica (`notes-files.ts`, numa pasta temporária) e pra `src/main/core/` (validação do nome do arquivo, limites da janela, URLs externas).
- A UI é validada rodando o app e comparando com as telas de `docs/design/screens/`.
