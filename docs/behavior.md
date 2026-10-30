# Comportamento

Especificação funcional do v1, com o comportamento esperado de cada parte. Os motivos estão em [decisions.md](decisions.md) (códigos `Dxx`).

## Ciclo de vida do app

### Abrir
1. Garantir que existe a pasta de notas (`Documentos\Notas` por padrão, lida das preferências). Criar se não existir.
2. Ler todos os `.md` da pasta e montar a lista em memória.
3. Restaurar o tamanho, a posição e o estado maximizado da janela (`window-state`), e o estado da sidebar.
4. Abrir a última nota aberta (`lastNote` nas preferências), com o cursor na última posição. **D12**
   - Se ela não existir mais, abrir a nota mais recente da lista.
   - Se não houver nenhuma nota, abrir um rascunho. **D13**

### Instância única
Abrir o app com ele já rodando mostra a janela existente, tira do minimizado e dá foco. Não abre uma segunda janela.

### Fechar e sair **D33**
- **Botão X da barra e Alt+F4:** fecham o app de verdade. Antes de fechar, o app salva a nota pendente: o processo principal avisa o renderer (`app:close-requested`), o renderer grava o que estiver pendente e responde (`app:close-confirmed`), e a janela fecha. Se o renderer não responder em 3 s, fecha mesmo assim.
- **Minimizar:** comportamento normal do Windows (vai pra barra de tarefas).

### Ganhar foco **D08**
Toda vez que a janela ganha foco:
1. Reler a pasta e atualizar a lista (notas novas, apagadas ou renomeadas por fora).
2. Se a nota aberta mudou no disco (`updated` ou data de modificação diferente da última leitura ou gravação do app):
   - se **não** houver edição pendente, recarregar o conteúdo, preservando o cursor quando der;
   - se houver, manter a versão do app. O próximo salvamento sobrescreve o disco.
3. Se a nota aberta foi apagada por fora, abrir a nota mais recente da lista (ou um rascunho, se não houver nenhuma).

## Salvamento **D07**

- **Quando salvar:**
  - 500 ms depois da última alteração (debounce);
  - imediatamente ao trocar de nota, ao criar uma nota (Ctrl T), ao fechar o app e ao perder o foco.
- **Como gravar:** sempre de forma atômica. Grava em `<nome>.md.tmp` na mesma pasta e depois renomeia por cima de `<nome>.md`.
- **Front matter:** a cada gravação, o campo `updated` recebe a hora atual.
- **Sem alteração, sem gravação:** trocar de nota sem ter editado não grava, nem atualiza `updated`.
- **Indicador "Salvo"** (D37): depois de cada gravação que dá certo, "Salvo" aparece no canto inferior direito da área da nota, fica 1,5 s e some. Uma gravação nova enquanto ele aparece só renova o tempo. Rascunho vazio não grava, então não mostra nada.
- **Falha de gravação:** manter o conteúdo em memória e tentar de novo na próxima alteração ou no próximo gatilho. Nunca descartar a edição. O v1 não precisa de UI de erro; registrar em log basta.

## Notas

### Nova nota (Ctrl T ou botão +) **D10 D11**
1. Salvar a nota atual, se houver alteração pendente.
2. Se a nota atual já for um rascunho vazio, só dar foco no editor e parar aqui.
3. Criar um **rascunho** em memória, com a data e hora de criação = agora.
4. Ele aparece imediatamente no topo do grupo "Hoje", selecionado, com o cursor no corpo.
5. **No primeiro caractere digitado,** o arquivo é criado (`AAAA-MM-DD_HHMMSS.md`, usando a data e hora de criação do rascunho), e o rascunho vira uma nota normal.
6. Se o usuário sair do rascunho sem digitar nada (troca de nota, Ctrl T de novo ou fechamento), o rascunho some da lista.
   - **Exceção:** se ele for a única "nota" (pasta vazia), continua na tela. **D13**

Colisão de nome no mesmo segundo: acrescentar um sufixo (`_2`, `_3`…). É raro, mas o app precisa tratar.

### Título **D14 D15**
- **Padrão:** a data e hora de criação, no formato `Sex, 30 out · 12:29`.
- **Personalizado:** só pelo **Renomear** do clique direito na lista. Fica no campo `title` do front matter.
- Renomear nunca muda o nome do arquivo.
- O conteúdo da nota nunca define o título. Um Título 1 no começo é só conteúdo.

### Renomear
1. Clique direito no item da lista, **Renomear**.
2. O título do item vira um campo de texto, no mesmo lugar e na mesma fonte, com todo o texto selecionado.
3. **Enter** confirma e grava o front matter. **Esc** cancela. Clicar fora confirma.
4. Confirmar com o campo vazio (ou só com espaços) remove `title`, e a nota volta a usar a data.

### Apagar **D17**
- Só pelo clique direito na lista, **Apagar**.
- O arquivo vai pra **Lixeira do Windows**. Não há confirmação.
- Se a nota apagada era a aberta, abrir a vizinha na lista: a de baixo, ou a de cima se ela era a última. Sem nenhuma, abrir um rascunho.
- Um rascunho (ainda sem arquivo) não tem menu de clique direito: não há o que renomear nem apagar. Ele simplesmente some ao ser abandonado.

## Lista lateral (sidebar)

### Estrutura (de cima pra baixo)
1. Linha do topo (48 px), que faz parte da barra arrastável: botão de esconder a lista e o texto fixo **"Todas as notas"**, sem seta e sem menu. **D18**
2. Grupos por data de criação, do mais recente pro mais antigo. **D16**

### Agrupamento
- Pela **data de criação**, contando dias do calendário no fuso local (uma nota de ontem às 23:59 é de "Ontem"). Os grupos não se sobrepõem.
- Em inglês (D41): `Today`, `Yesterday`, `Last 7 days`, `Last 30 days` e os meses (`September`, `December 2025`), com as datas em inglês (ver [note-format.md](note-format.md#formatos-de-data-na-interface)).
- Exemplos com hoje = sexta, 30 de outubro:

  | Grupo | Notas criadas | Texto à direita |
  |---|---|---|
  | `Hoje` | hoje (ou com data à frente do relógio) | o dia, ex.: `30 out` |
  | `Ontem` | ontem | o dia, ex.: `29 out` |
  | `Últimos 7 dias` | de 2 a 6 dias atrás | intervalo, ex.: `24 – 28 out` |
  | `Últimos 30 dias` | de 7 a 29 dias atrás | intervalo, ex.: `1 – 23 out` |
  | o mês, ex.: `Setembro`, `Dezembro de 2025` | 30 dias atrás ou mais, um grupo por mês | nada |

- **Intervalo:** quando os dois dias são do mesmo mês, o mês aparece uma vez só (`24 – 28 out`). Quando são de meses diferentes, cada dia leva o seu mês (`26 out – 1 nov`). O ano só aparece quando não é o atual.
- O intervalo é o período fixo do grupo, não o das notas dentro dele.
- Grupos sem notas não aparecem.
- Dentro do grupo, as notas vão da criação mais nova pra mais antiga.

### Item da lista
- **Linha 1 (título):**
  - sem título personalizado: a data, `Sex, 30 out · 12:29`;
  - com título personalizado: o título.
- **Linha 2 (prévia):** o primeiro trecho de texto do corpo, sem a sintaxe Markdown, numa linha só com reticências.
  - Se a nota tem título personalizado, a prévia começa com `Sex 09:14 · ` (dia da semana e hora de criação).
  - Se o corpo estiver vazio, não há prévia e o item fica com uma linha só. Numa nota renomeada, sobra só o dia e a hora (`Sex 09:14`), sem o `·`.
- **Item selecionado:** fundo branco com sombra leve, como no canvas.
- **Clique:** abre a nota (salvando a anterior antes).
- **Clique direito:** abre o menu de contexto com **Renomear** e **Apagar**.

### Mostrar e esconder
- Ctrl \ ou o botão de lista alterna a sidebar.
- O estado fica salvo nas preferências.
- Com a sidebar fechada, o botão de lista vai pro começo da barra principal (tela `app-sidebar-closed`).

### Largura **D38**
- Arrastar a borda direita da sidebar muda a largura, de 240 a 400 px. O padrão é 300.
- Clique com o botão do meio na alça volta a largura pra 300 px.
- Com a alça em foco (Tab), as setas para a esquerda e para a direita mudam a largura de 8 em 8 px.
- A largura fica salva nas preferências ao soltar o mouse (ou a cada seta).
- Se a janela ficar estreita, a sidebar encolhe sozinha pra área da nota manter pelo menos 560 px, sem passar do mínimo de 240. A largura salva não muda: ela volta quando a janela crescer.

### Aviso de atualização **D42**
- Só no app instalado. Ao abrir e a cada 6 h, o app procura uma versão nova nas releases do GitHub e baixa em segundo plano, sem aviso.
- Baixada, o rodapé da sidebar mostra **Versão X pronta** e o botão **Reiniciar**.
- **Reiniciar:** grava o que estiver pendente, fecha, instala sem perguntar nada e abre o app de novo.
- Sem o clique, a versão nova é instalada quando o app fechar, e já abre atualizada da próxima vez.
- Sem internet ou com o GitHub fora do ar, nada aparece. O app tenta de novo na próxima busca.
- Com a sidebar fechada, o aviso só aparece quando ela abrir.

## Barra do topo

- Altura de 48 px, e é a **área de arrastar** da janela. Os botões não arrastam.
- Duplo clique numa área vazia maximiza ou restaura.
- Com algum menu aberto, a barra para de arrastar: o primeiro clique nela só fecha o menu. Depois ela volta a arrastar.
- **Ordem, da esquerda pra direita** (sidebar fechada):
  1. botão de lista;
  2. data de criação da nota, `Sex, 30 de outubro · 12:29`;
  3. espaço flexível;
  4. Nova nota (círculo com +);
  5. Mais opções (três pontos), sempre seguido de uma linha fina antes dos botões de janela;
  6. Minimizar, Maximizar/Restaurar e Fechar.
- Com a sidebar aberta, o botão de lista fica no topo da sidebar.
- Formatação e tabela não ficam na barra: estão no clique direito no texto (D36).
- O Nova nota pode ser ocultado pelo menu de opções.
- Num rascunho, a data da barra é a data de criação do rascunho.

## Menu de opções (três pontos)

Segue a tela `menu-options`. É um menu ancorado à direita, logo abaixo do botão. Cada linha tem um ícone à esquerda.
- **Aparência:**
  - **Tema** (D39): a linha mostra o tema atual. O clique abre as opções logo abaixo dela, dentro do menu, ligadas à linha por traços em árvore: Sistema, uma linha separadora, Claro e Escuro, com um check na atual. Escolher aplica na hora, salva nas preferências e fecha as opções. Sistema é o padrão e acompanha o Windows, inclusive quando ele troca com o app aberto. O ícone da linha muda com o tema (monitor, sol ou lua).
  - **Idioma** (D41): igual ao Tema, com Sistema, separador, Português (bandeira do Brasil) e English (bandeira dos EUA). Sistema segue o idioma do Windows (português pra `pt-*`, inglês pro resto).
  - Só uma das duas fica aberta por vez; abrir uma fecha a outra. Clicar de novo na linha fecha.
  - Interruptor **Efeito acrílico** (D40), desligado por padrão: deixa a sidebar translúcida, com o borrado do que está atrás da janela. A barra e a nota continuam sólidas.
- **Layout:** o interruptor **Mostrar botão nova nota**, com efeito imediato e salvo nas preferências.
- **Editor:** o interruptor **Corretor ortográfico**, ligado por padrão. Desligado, o editor para de sublinhar palavras. Também tem efeito imediato e é salvo nas preferências.
- **Atalhos:** num rodapé, só de leitura, com Nova nota (`Ctrl` `T`) e Mostrar / esconder lista (`Ctrl` `\`).
- **Teclado:** o menu abre com o foco na primeira linha. Setas pra cima e pra baixo andam pelas linhas (e pelas opções abertas), Home e End vão pro começo e pro fim, Enter e Espaço ativam. Seta pra direita abre as opções do Tema ou do Idioma, com o foco na atual; seta pra esquerda ou Esc fecham só elas.
- Fecha com Esc, com um clique fora (inclusive na barra do topo) ou clicando de novo no botão.

## Atalhos globais do app

| Atalho | Ação |
|---|---|
| Ctrl T | Nova nota |
| Ctrl \ | Mostrar ou esconder a sidebar |
| Esc | Fecha o menu ou campo aberto |

Os atalhos do editor (negrito, itálico e afins) seguem o padrão do Tiptap.

## Editor

### Base
- Usa o container `.note` com os estilos de `design/note-styles.css`.
- O cursor é preto (`caret-color: var(--text-strong)`), no editor e no campo de renomear. O azul só aparece no foco por teclado.
- Rolagem vertical, com a scrollbar fina que só aparece no hover (CSS do canvas).

### Atalhos de Markdown ao digitar **D21**
| Digitar no começo da linha | Vira |
|---|---|
| `# `, `## `, `### `, `#### ` | Título 1, 2, 3, 4 |
| `- ` ou `* ` | Lista com marcadores |
| `1. ` | Lista numerada |
| `[ ] ` ou `- [ ] ` | Item de checklist |
| `> ` | Citação |
| ` ``` ` | Bloco de código |
| `---` | Divisor |

E as marcas inline do padrão do Tiptap (`**negrito**`, `*itálico*`, `` `código` ``, `~~tachado~~`, `==destaque==`).

### Checklist **D20**
- Só nasce pela sintaxe acima. Não há botão.
- Enter cria outro item. Enter ou Backspace num item vazio volta pra parágrafo.
- Clicar na caixa marca e desmarca. O item marcado fica cinza (`--text-muted`) e **não muda de posição**.

### Menu Aa (formatação) **D36**
Segue a tela `menu-formatting`. Abre com o **clique direito em qualquer ponto do texto**, na posição do mouse. Clique dentro da seleção mantém a seleção; fora dela, o cursor vai pro ponto clicado antes. Numa célula de tabela, abre o menu da tabela no lugar.
- **Texto:** Heading 1, Heading 2, Heading 3, Heading 4, Corpo e Pequeno (os níveis de título se chamam "Heading" no menu, a pedido do usuário; ver D28). Eles aplicam o estilo ao bloco atual, e o estilo ativo aparece com um check e fundo cinza.
- **Marcas:** Negrito, Itálico, Sublinhado, Tachado, Código, Link e Destaque, que se aplicam à seleção.
- **Blocos:** Lista com marcadores, Lista numerada, Citação, Bloco de código, Tabela e Divisor. **Tabela** troca o menu pela grade de tabela, no mesmo lugar.
- O menu fecha depois de aplicar um estilo de texto ou um bloco. Nas marcas, ele continua aberto, pra combinar várias.

### Link **D23**
- Colar uma URL com texto selecionado transforma o texto em link.
- Digitar ou colar uma URL solta vira link automaticamente.
- O botão **Link** do menu Aa troca o conteúdo do menu por um único campo, "Cole o link". Enter aplica na seleção; sem seleção, insere o próprio endereço como link. Endereço sem protocolo ganha `https://`, e e-mail vira `mailto:`. Esc volta pro menu. Com o campo vazio, Enter remove o link existente.
- **Ctrl + clique** num link abre no navegador padrão. O clique simples só posiciona o cursor.

### Tabela **D22**
- **Inserir:** o item Tabela do menu Aa abre a grade de 8 colunas × 6 linhas (tela `menu-table`). Passar o mouse destaca a seleção e mostra `3 × 2`, e o clique insere a tabela na posição do cursor.
- A primeira linha é sempre o cabeçalho, no estilo `th`.
- Tab e Shift+Tab andam entre as células. Tab na última célula cria uma linha nova.
- As células aceitam só texto inline (sem lista, sem quebra de linha).
- Enter e Shift+Enter levam o cursor pra célula de baixo. Na última linha, saem da tabela pro parágrafo seguinte, criando um se o próximo bloco não for parágrafo.
- Logo depois de inserir uma tabela, aparece embaixo dela a dica "Clique com o botão direito para opções" (em `--text-muted`, 12,5 px). É uma decoração do editor: não vai pro arquivo e some na primeira edição da nota. Tabelas carregadas de uma nota não mostram a dica.
- **Clique direito numa célula** abre um menu com:
  - inserir linha acima;
  - inserir linha abaixo;
  - inserir coluna à esquerda;
  - inserir coluna à direita;
  - apagar linha;
  - apagar coluna;
  - apagar tabela.
  - Na linha de cabeçalho, "inserir linha acima" e "apagar linha" não aparecem: o Markdown exige o cabeçalho.

### Colar
- Conteúdo rico vindo de fora mantém só o que o editor suporta. O resto vira texto.
- Imagens são ignoradas no v1.

### Menu de contexto padrão
O Electron não mostra menu de contexto por conta própria, e o app não cria nenhum além dos descritos aqui. Fica desativado no app inteiro. Os únicos menus de clique direito são o da lista, o da tabela e o menu Aa no texto.
