# Decisões

Registro das decisões do projeto, com o motivo de cada uma. Antes de mudar qualquer coisa listada aqui, confirme com o usuário e atualize este arquivo.

Formato: **decisão**, depois o motivo e, quando houver, as alternativas descartadas.

## Stack

### D01. Electron + React + TypeScript + Vite + Tiptap
- **Motivo:** o toolchain do Rust (rustup MSVC mais o Visual Studio Build Tools) era pesado de instalar e de manter. Com o Electron o projeto precisa só de Node e npm. Há um ecossistema maior e APIs de janela mais maduras. O Electron traz o próprio Chromium, então o CSS do design funciona igual ao canvas (`:has`, scrollbar fina). O React tem a integração oficial do Tiptap (`@tiptap/react`) e o maior volume de exemplos.
- **Custos aceitos:**
  - tamanho bem maior: instalador de 108 MB e 311 MB instalados (no Tauri eram poucos MB). Quase tudo é o executável do Chromium; os idiomas ficam só em pt-BR e en-US (`electronLanguages`);
  - abertura a frio: a janela aparece com as notas em cerca de 300 ms (medido no app empacotado). Na prática não pesou;
  - o Chromium fica congelado na versão do build e só atualiza ao gerar um novo build. O risco é baixo, porque o app não carrega conteúdo remoto.
- **Histórico:** o projeto começou em Tauri v2 e saiu dele só pelo peso do toolchain de Rust.
- **Descartado:** Tauri (toolchain de Rust pesado), WinUI nativo (perde o Tiptap), Svelte e vanilla (mais trabalho manual).

### D02. Fonte Geist e Geist Mono embutidas no app
- **Motivo:** o app funciona offline e não depende do Google Fonts.

## Armazenamento

### D03. Um arquivo por nota, sem banco de dados
- **Motivo:** as notas ficam legíveis, dá pra fazer backup e o OneDrive funciona sem risco. Pra uso pessoal, ler a pasta inteira ao abrir leva milissegundos.
- **Descartado:** SQLite (prende as notas, e um `.db` sincronizado pelo OneDrive pode corromper).

### D04. Markdown (GFM) com front matter YAML
- **Motivo:** formato aberto, que não fica preso ao JSON interno do Tiptap.
- **Consequência:** as células de tabela aceitam só texto inline de uma linha. Sublinhado, destaque e pequeno usam extensões de sintaxe. Detalhes em [note-format.md](note-format.md).
- **Descartado:** JSON próprio (ilegível fora do app).

### D05. Pasta de notas fixa em `Documentos\Notas`
- **Motivo:** visível e coberta pelo backup de pastas do OneDrive. O caminho fica guardado nas preferências pra permitir troca futura sem migração.
- **Observação:** usar a API de pasta conhecida do Electron (`app.getPath('documents')`), que respeita o redirecionamento do OneDrive.

### D06. Nome do arquivo = data e hora de criação, com segundos (`2026-10-30_122905.md`)
- **Motivo:** é estável. Renomear a nota nunca renomeia o arquivo, o que evita conflito com o OneDrive e nomes duplicados.

### D07. Salvamento automático, com gravação atômica
- 500 ms depois de parar de digitar, ao trocar de nota, ao fechar o app (D33) e ao perder o foco.
- Grava num arquivo temporário e depois renomeia por cima.

### D08. Mudanças externas: reler a pasta quando a janela ganha foco
- Se a nota aberta mudou no disco e não há edição pendente, ela é recarregada.
- Em conflito, a versão do app vence.
- **Descartado no v1:** monitorar a pasta em tempo real.

### D09. Preferências em `%AppData%\com.noter.app\config.json`
- O `userData` do Electron é forçado para essa pasta, pra o `config.json` antigo continuar valendo. O Electron também guarda ali os caches dele.
- As preferências ficam no `config.json` (`settings-file.ts`). O tamanho, a posição e o estado maximizado da janela ficam em outro arquivo, o `window-state.json`.
- **Motivo:** preferência é por máquina, e não deve se misturar com o conteúdo nem sincronizar.

## Notas e lista

### D10. Rascunho só vira arquivo no primeiro caractere
- Ctrl T e o botão + criam um rascunho em memória. Se ele ficar vazio quando você sair, ele some.
- Se a nota aberta já for um rascunho vazio, Ctrl T só põe o foco nela.

### D11. Uma nota aberta por vez, sem abas
- Ctrl T salva a nota atual e abre o rascunho.

### D12. Ao abrir, o app mostra a última nota aberta, com o cursor onde estava

### D13. Sem tela de estado vazio
- Se não houver nenhuma nota, o app abre direto num rascunho.

### D14. O título é sempre a data e hora de criação, a menos que o usuário renomeie
- Renomear: clique direito na lista, **Renomear**, edição inline no item.
- **Descartado:** título a partir do primeiro Título 1 ou da primeira linha. O usuário quer título só manual.

### D15. O cabeçalho da nota mostra o título, ou a data de criação sem título
- Pedido do usuário (antes era sempre a data, mesmo com título). Com título (nota renomeada), a barra mostra o título; sem, a data de criação, como antes.

### D16. A lista ordena e agrupa por data de criação: Hoje, Ontem, Últimos 7 dias, Últimos 30 dias e meses
- **Motivo:** a nota não pula de lugar quando é editada, e o título-data sempre bate com o grupo.
- Os grupos não se sobrepõem e contam dias do calendário no fuso local. Depois de 30 dias, um grupo por mês.
- À direita do cabeçalho, o dia ou o intervalo que o grupo cobre. Nos meses, nada.
- **Descartado:** semanas de segunda a domingo (primeira versão), um grupo único "Mais antigas", grupos por ano e a contagem de notas à direita.

### D17. Apagar = mandar o arquivo pra Lixeira do Windows, sem confirmação
- Só pelo clique direito na lista.
- **Descartado:** lixeira própria e apagar de vez.

### D18. "Todas as notas" no topo da sidebar é texto fixo, sem seta e sem menu

### D19. Sem busca no v1

## Editor

### D20. Checklist só pela sintaxe Markdown (`[ ] ` ou `- [ ] ` no início da linha)
- O botão de checklist foi removido das ações rápidas. O comportamento é igual ao do Markdown.
- Itens marcados ficam no lugar e ficam cinza.

### D21. Atalhos de Markdown ao digitar
- `# `, `## `, `### `, `#### `, `- `, `1. `, `> `, ` ``` `, `---`, `[ ] `.

### D22. Edição de tabela
- Tab e Shift+Tab andam entre as células, e Tab na última célula cria uma linha.
- Enter e Shift+Enter descem uma célula, e na última linha saem da tabela. Uma dica de clique direito aparece embaixo de uma tabela recém-inserida até a primeira edição.
- O clique direito numa célula abre um menu de linhas, colunas e apagar tabela.
- A primeira linha é sempre o cabeçalho.

### D23. Link
- Colar uma URL com texto selecionado transforma o texto em link, e URLs soltas viram link sozinhas.
- O botão Link do menu Aa troca o conteúdo do menu por um campo "Cole o link".
- Ctrl + clique abre o link no navegador padrão.

### D36. Formatação e tabela pelo clique direito no texto
- Fecha o ponto em aberto do clique direito no editor fora da tabela.
- Clique direito em qualquer ponto do texto abre o menu Aa inteiro na posição do mouse. Em Blocos ele tem o item **Tabela**, que troca o menu pela grade de tabela no mesmo lugar.
- Clique dentro da seleção mantém a seleção. Fora dela, o cursor vai pro ponto clicado antes de o menu abrir.
- Numa célula de tabela, vale o menu da tabela (D22).
- Toda opção fecha o menu, marcas inclusive (a pedido do usuário; antes as marcas o deixavam aberto, pra combinar várias).
- **Motivo:** o usuário achou a grade estranha ancorada na barra e preferiu tirar Aa e Tabela de lá (revoga a D24).
- **Descartado:** um menu só de marcas, aberto só com seleção (primeira versão desta decisão), dois menus separados (com e sem seleção) e submenus.

## Janela e barra

### D24. ~~Ações rápidas: só **Aa** e **Tabela**~~
- Revogada pela D36: Aa e Tabela saíram da barra e foram pro clique direito no texto. O interruptor "Mostrar ações rápidas" saiu do menu de opções, e o `showQuickActions` que sobrar num `config.json` antigo é ignorado.

### D25. ~~Alfinete preenchido no botão Fixar~~
- Revogada pela D30: o fixar foi removido.

### D26. Snap Layouts: o painel no hover do maximizar fica fora do v1
- Arrastar até a borda, `Win + setas`, `Win + Z` e duplo clique na barra continuam funcionando.
- **Descartado no v1:** `WM_NCHITTEST` feito à mão.
- **Se um dia for desejado:** no Electron o caminho é o `titleBarOverlay`. Nada decidido.

### D27. ~~Bandeja~~
- Revogada pela D33: o X fecha o app de verdade.

### D29. A janela mantém a sombra nativa do Windows 11
- Vem da janela sem moldura do Electron (`frame: false`). Ela vem junto com o canto arredondado e a borda fina do sistema.
- O usuário achou a sombra forte, mas preferiu manter. O tamanho dela não é ajustável, e a alternativa era uma janela sem sombra e de cantos retos.
- **Descartado:** sombra própria em CSS com janela transparente (frágil e quebra o snap).

### D30. Sem fixar nota
- O usuário pediu pra remover a função inteira, pra simplificar: botão Fixar, grupo "Fixadas", itens Fixar/Desafixar do clique direito e o interruptor "Mostrar botão fixar".
- Notas antigas com `pinned: true` no front matter não perdem o campo: ele passa a ser um campo desconhecido, preservado ao salvar.
- O `showPinButton` que sobrar num `config.json` antigo é ignorado.

### D31. Animação só na mudança de estado dos controles
- O usuário pediu pra remover todas, pra simplificar: a sidebar aparece e some na hora, e os menus abrem e fecham sem transição.
- Depois pediu animação nos controles: interruptores, caixas da checklist e o hover e o estado ativo de itens de menu, botões da barra e itens da lista. Abrir e fechar menus e a sidebar continua sem animação.
- Com o "movimento reduzido" do sistema ligado, nada anima.
- O indicador "Salvo" (D37) também aparece e some suavemente.
- Exceção pedida depois: o menu de opções (três pontos) abre com um fade curto, descendo 4 px e crescendo de 98% a partir do canto do botão. Fechar continua instantâneo, e os outros menus e a sidebar seguem sem animação.
- Não acrescente outras animações sem pedido do usuário.

### D37. Indicador "Salvo" discreto
- A cada gravação que dá certo, um "Salvo" bem pequeno e apagado aparece no canto inferior direito da área da nota e some sozinho.
- Pedido do usuário, pra ter um sinal de que salvou sem chamar atenção. Não é UI de erro: falha de gravação continua só no log (D07).

### D38. Sidebar redimensionável, de 240 a 400 px
- Arrastando a borda direita (ou com as setas, com a alça em foco). O padrão continua 300 px, e a largura fica salva nas preferências. O botão do meio na alça volta pro padrão.
- Numa janela estreita, a sidebar encolhe sozinha pra área da nota manter pelo menos 560 px (o que sobrava com a janela mínima de 860 e a sidebar de 300). O tamanho mínimo da janela não mudou.
- **Descartado:** as faixas 220–420 e 200–480.

### D39. Tema claro e escuro
- O dark mode entrou no v1 a pedido do usuário (antes estava fora).
- **Tema:** Sistema (padrão, segue o Windows e acompanha a troca com o app aberto), Claro ou Escuro, no menu de opções. Fica salvo nas preferências.
- **Paleta escura:** os mesmos cinzas do claro, invertidos. Nota `#181818`, sidebar `#121212` (mais escura), menus e item selecionado `#1F1F1F` (um degrau acima), texto `#E4E4E4`. Valores em `tokens.css` e `note-styles.css`.
- **Sem saturação** (pedido do usuário, pra testar): todas as cores, nos dois temas, viraram cinzas neutros de mesma luminância, inclusive foco, links, seleção e destaque. A paleta zinc original puxava pro azul.
- O fundo nativo da janela (o que aparece antes da página pintar) segue o Windows. Um tema forçado no app só vale depois que a página carrega, e a janela só aparece depois disso.
- No menu, a linha Tema abre as opções logo abaixo dela, com Sistema separado de Claro e Escuro.
- **Descartado:** só seguir o Windows, só um interruptor no app, paletas grafite neutro e quase preto. Pro seletor: controle segmentado com os nomes (ficou feio), item que alterna a cada clique (o usuário achou o menu sem graça) e submenu ao lado (o menu fica colado na borda direita, então ele abria à esquerda com a seta apontando pra direita).

### D40. Efeito acrílico opcional, só na sidebar
- Interruptor "Efeito acrílico" na seção Aparência do menu de opções, desligado por padrão e salvo nas preferências.
- Ligado, a janela usa o material acrílico do Windows 11 (`setBackgroundMaterial('acrylic')`), e só a sidebar deixa ele aparecer, com uma camada da cor dela por cima (80% no escuro, 82% no claro: com 55–60% o borrado ficou exagerado). A barra e a nota continuam sólidas, pra leitura não sofrer.
- Com acrílico, nada na sidebar é sólido: o item selecionado vira um véu com contorno fino, e a linha do topo e a borda direita ficam translúcidas. Sólidos, pareciam colados no vidro.
- O processo principal também recebe o tema escolhido e o aplica no `nativeTheme.themeSource`, pra o tom do acrílico bater com o tema do app quando ele é forçado.
- Com a janela sem foco, o próprio Windows troca o acrílico por uma cor sólida. Em Windows antes do 11 22H2 o material não existe, e a sidebar fica com a camada translúcida sobre o fundo da janela.
- **Descartado:** acrílico na sidebar e na barra, e na janela inteira.

### D41. Interface em português e inglês
- Pedido do usuário. Traduz todo texto da interface: menus, barra, lista, nomes dos grupos, datas, dicas e rótulos de acessibilidade. O conteúdo das notas, os nomes dos arquivos e a pasta `Documentos\Notas` não mudam.
- **Idioma:** Sistema (padrão: português se o Windows estiver em `pt-*`, inglês em qualquer outro caso), Português ou English. Fica no menu de opções, na seção Geral, a primeira (antes ficava em Aparência), numa linha que abre as opções embaixo, como o Tema, e é salvo nas preferências. Português leva a bandeira do Brasil e English a dos EUA (o padrão das datas), nas imagens do emoji do Android (Noto Emoji, onduladas e com sombreado), porque a fonte de emoji do Windows mostra bandeira como duas letras.
- **Datas em inglês:** padrão americano com hora de 24 h: "Fri, Oct 30 · 17:51", "Fri, October 30 · 17:51", "Oct 24 – 28", "September", "December 2025".
- Os textos ficam num dicionário próprio e tipado em `src/renderer/i18n/strings.ts`, sem biblioteca. O tipo vem da tabela em português, então uma chave que falte em inglês não compila.
- Os nomes dos idiomas aparecem sempre na própria língua ("Português", "English"), pra serem achados de qualquer um dos dois.
- **Descartado:** começar sempre em português; datas no padrão americano com 12 h e no britânico.

### D42. Atualização automática pelo GitHub Releases
- Pedido do usuário. Só no app instalado: em desenvolvimento, o updater não roda.
- **Onde:** nas releases do repositório público `juanssilveira/noter`, o mesmo do código. Público porque, num repositório privado, o app precisaria levar um token dentro dele.
- **Como:** o `electron-updater` procura uma versão nova ao abrir o app e a cada 6 h, e baixa em segundo plano. Quando termina, o rodapé da sidebar mostra "Versão X pronta" com o botão **Reiniciar**, que grava o que estiver pendente, fecha, instala sem perguntar nada e abre o app de novo. Sem o clique, a versão nova é instalada quando o app fechar. Sem internet, nada aparece.
- **Publicar:** subir a `version` do `package.json`, fazer o commit e o push, e rodar `npm run release`. O app só atualiza pra uma versão maior. O token vem do `GH_TOKEN` ou do GitHub CLI logado.
- **Sem assinatura de código:** o certificado é pago, e desde 2024 nem ele tira o alerta do SmartScreen de cara (a reputação se forma com os downloads). O alerta só aparece em instalador baixado pelo navegador. A atualização é baixada pelo próprio app, então não passa por ele.
- A D33 não muda: o Reiniciar passa pelo mesmo cuidado de gravar antes de sair.
- **Descartado:** repositório separado só pras releases; aviso numa notificação ou no menu de opções; perguntar antes de baixar.

### D43. Dica do atalho no rodapé da sidebar
- Pedido do usuário. O rodapé da sidebar mostra as teclas Ctrl + T, no estilo das do menu de opções, seguidas de "para nova nota" ("for a new note" em inglês), tudo pequeno e apagado.
- Quando há uma versão pronta (D42), o aviso de atualização ocupa o lugar da dica, pra o rodapé continuar com uma linha só.
- As teclas acendem de leve enquanto estão pressionadas, também a pedido do usuário. O T só acende com o Ctrl seguro, pra não piscar a cada "t" digitado na nota. É uma mudança de estado, então segue a D31.

### D44. Placeholder na nota vazia
- Pedido do usuário, no estilo do Notion. Com a nota inteira vazia, a primeira linha mostra "Escreva algo…" ("Write something…" em inglês) bem apagado, e o texto some com o primeiro caractere.
- Só na nota vazia: uma linha vazia no meio de uma nota com conteúdo não mostra nada.
- É uma decoração do editor (extensão Placeholder do Tiptap), nunca vai pro arquivo.

### D45. Número da versão e mensagens de commit
- A versão segue `MAIOR.MENOR.CORREÇÃO`, decidida pelo que a release traz desde a anterior:
  - **CORREÇÃO** (0.2.**1**): só correções e ajustes pequenos, sem nada novo pro usuário;
  - **MENOR** (0.**3**.0): pelo menos uma funcionalidade nova ou uma mudança visível de comportamento; a CORREÇÃO volta pra 0;
  - **MAIOR** (**1**.0.0): quando o usuário considerar o app pronto (o 1.0), ou depois numa mudança que quebre algo (formato das notas, preferências). MENOR e CORREÇÃO voltam pra 0.
- Até a 0.1.2 o número só subia na CORREÇÃO, sem regra; a 0.1.2 já trazia funcionalidades novas e, por esta regra, seria 0.2.0.
- Mensagens de commit em inglês, como o código. Todo o histórico foi reescrito em inglês a pedido do usuário.
- **Nunca reescrever uma tag que já tem release:** o push forçado da tag `v0.1.2` fez o GitHub apagar a release dela, que teve de ser recriada com os arquivos da pasta `release/`.

## Convenções

### D28. Código e arquivos em inglês; interface em pt-BR e inglês
- **Em inglês:** nomes de arquivos e pastas do repositório (inclusive `docs/`), identificadores, comentários, canais IPC, chaves de preferência, chaves do front matter e classes CSS.
- **Em pt-BR e inglês** (D41): tudo o que o usuário vê na interface, ou seja, rótulos, menus e datas, sempre pelo dicionário `src/renderer/i18n/strings.ts`.
- A tradução de cada termo está em [glossary.md](glossary.md).
- **Exceção:** a pasta de notas continua `Documentos\Notas`, porque o usuário a vê no Explorer.
- **Exceção:** no menu Aa, os níveis de título aparecem como "Heading 1" a "Heading 4" nos dois idiomas, a pedido do usuário.

### D32. Nomes de arquivo em kebab-case
- Todo arquivo da `src/` tem nome em kebab-case e minúsculas, inclusive componentes React, testes e assets: `note-editor.tsx`, `app-store.ts`, `file-name.test.ts`, `geist-variable.woff2`. Sem camelCase nem PascalCase.
- Os identificadores dentro do código seguem o padrão do TypeScript: `NoteEditor`, `useAppStore`.
- Hooks React próprios ficam em `src/renderer/hooks/`.

### D33. Sem bandeja: o X fecha o app
- Substitui a D27. O X da barra e o Alt+F4 encerram o app de verdade. Não há ícone na bandeja.
- **Fluxo de fechamento:**
  1. o processo principal intercepta o fechamento da janela;
  2. envia `app:close-requested` ao renderer;
  3. o renderer roda `flushPending` e responde `app:close-confirmed`;
  4. o processo principal fecha a janela.

  Se o renderer não responder em 3 s, o processo principal fecha mesmo assim.
- O salvamento ao perder o foco (D07) e a releitura ao ganhar foco (D08) continuam. O segundo lançamento ainda foca a janela existente (instância única).

### D34. Lógica pura separada do Electron
- **Estrutura:** todo o código fica na `src/`, uma pasta por processo: `main/` (processo principal), `preload/`, `renderer/` (a interface) e `shared/` (o que os dois lados usam).
  - `src/main/core/`: TypeScript puro, sem `electron` e sem `fs`, com testes (validação de nome de arquivo, limites da janela, tamanho mínimo, URLs externas permitidas);
  - adaptadores finos em `src/main/`: janela, I/O de arquivos, preferências e IPC. O `notes-files.ts` usa `node:fs` e não importa o `electron` (a Lixeira é injetada), então também roda no Vitest;
  - `src/shared/noter-api.ts`: o contrato (só tipos) entre o preload e o renderer.
- **Motivo:** testar sem o Electron, e trocar de plataforma de novo ser barato, já que a lógica não depende dela.
- O renderer só toca em `window.noter` dentro de `src/renderer/services/`.

### D35. O app se chama Noter
- O nome aparece na janela, no instalador, no atalho e no executável (`Noter.exe`). No código e nos pacotes fica em minúsculas: `noter`, `window.noter`, `noter-api.ts`.
- O identificador é `com.noter.app`, e a pasta de dados é `%AppData%\com.noter.app\`.
- O ícone é o `noter.png` do usuário (folha escura com o canto dobrado). O `build/icon.ico` foi gerado dele, com os tamanhos de 16 a 256 px, e o `build/icon.png` é a versão de 256 px.

## Decididos por padrão

Estes foram assumidos sem discussão detalhada e listados pro usuário. Podem mudar com o OK dele:

- Uma instância só: abrir o app de novo mostra e foca a janela existente.
- Janela com tamanho mínimo de 720×480, ou 860×480 com a sidebar aberta. Abrir a sidebar numa janela menor que isso aumenta a janela.
- Colar conteúdo rico mantém só as formatações suportadas. Imagens coladas são ignoradas.
- Distribuição pelo instalador do electron-builder (NSIS, por usuário), sem assinatura de código. A atualização automática está na D42.

## Pontos em aberto

Ainda não decididos. **Pergunte ao usuário** antes de implementar algo que dependa deles:

- **Nota existente que fica vazia:** a regra do D10 vale só pra rascunhos. A suposição atual é que uma nota já salva continua existindo mesmo vazia.
- **Ano nas datas:** a suposição é mostrar o ano só quando ele não for o atual, tanto nos títulos quanto no cabeçalho.
