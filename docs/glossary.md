# Glossário

Termos do projeto. Use o **termo** na interface, nas conversas e na documentação, e o nome **no código** em identificadores, arquivos e chaves (D28).

| Termo | No código | Significado |
|---|---|---|
| **nota** | `note` | um arquivo `.md` na pasta de notas |
| **rascunho** | `draft` | nota nova que existe só em memória até o primeiro caractere. Não tem arquivo. |
| **pasta de notas** | `notesDir` | `Documentos\Notas` (configurável só pelo `config.json`) |
| **front matter** | `frontMatter` | o bloco YAML no topo do arquivo, com `created`, `updated` e `title` |
| **data de criação** | `created` | quando a nota nasceu. Nunca muda. |
| **data de edição** | `updated` | a última gravação com alteração |
| **título** | `title` | o nome exibido da nota: a data de criação ou o `title` dado em Renomear |
| **prévia** | `preview` | a segunda linha do item da lista: o primeiro texto do corpo |
| **corpo** | `body` | o conteúdo Markdown depois do front matter |
| **lista** ou **sidebar** | `sidebar` | o painel lateral com as notas agrupadas por data de criação |
| **item da lista** | `noteListItem` | uma nota na sidebar (título e prévia) |
| **grupo** | `noteGroup` | o bloco da lista com as notas de um período: Hoje, Ontem, Últimos 7 dias, Últimos 30 dias ou um mês |
| **barra** | `titleBar` | a faixa única de 48 px no topo, que serve de área de arrastar e tem todos os botões |
| **tema** | `theme` | claro, escuro ou Sistema (segue o Windows) |
| **idioma** | `language` (escolha) / `locale` (em uso) | Sistema, Português ou English; o `locale` é o idioma resolvido, `pt` ou `en` |
| **dica do atalho** | `sidebarHint` | o "Ctrl + T para nova nota" no rodapé da sidebar (D43) |
| **aviso de atualização** | `updateNotice` | o rodapé da sidebar que avisa que uma versão nova foi baixada, com o botão Reiniciar (D42) |
| **indicador de salvo** | `saveIndicator` | o "Salvo" discreto que aparece no canto depois de cada gravação |
| **menu Aa** | `formatMenu` | o menu de formatação (estilos de texto, marcas e blocos), aberto pelo clique direito no texto |
| **menu de opções** | `optionsMenu` | o menu dos três pontos (interruptores do botão nova nota e do corretor ortográfico, e lista de atalhos) |
| **menu de contexto** | `contextMenu` | os menus de clique direito (lista e tabela) |
| **grade de tabela** | `tablePicker` | a grade 8×6 pra inserir tabela |
| **estilos de escrita** | `noteStyles` | os estilos visuais do conteúdo da nota (`note-styles.css`, classe `.note`) |
| **Pequeno** | `small` / `.text-small` | o estilo de bloco de texto menor e cinza. No arquivo, vira `<small>` |
| **Destaque** | `highlight` | a marca de fundo azul-claro no texto. No arquivo, vira `==texto==` |
| **preferências** | `settings` | o `config.json` em `%AppData%\com.noter.app\` |
| **Lixeira** | `trash` | a Lixeira do Windows, pra onde vai a nota apagada |
| **gravação atômica** | `atomicWrite` | gravar num `.tmp` e renomear por cima, pra nunca deixar o arquivo pela metade |
