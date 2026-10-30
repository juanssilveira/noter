# Design

O design visual está **fechado**. Implemente fiel às telas e só desvie onde este documento manda.

## Fontes da verdade

| O quê | Onde |
|---|---|
| Canvas original (só leitura) | https://claude.ai/artifact/9CdsGyiwNmHAbMnQDrXRoE, página "main". A página "backup" está fora do v1: ignore. |
| Cópia local das telas | [`design/screens/`](design/screens/) |
| Estilos do editor (tokens de texto) | [`design/note-styles.css`](design/note-styles.css) |
| Tokens da interface (barra, sidebar, menus) | este documento, seção "Tokens da interface" |

### Telas

| Arquivo | O que mostra |
|---|---|
| `app-sidebar-open.html` | o layout principal, com a sidebar e a nota aberta |
| `app-sidebar-closed.html` | a barra única com a sidebar escondida |
| `app-all-hidden.html` | a barra sem as ações rápidas e com o nova nota oculto: é a barra de agora, que não tem mais Aa e Tabela (D36). A tela também tem o botão fixar, que foi removido (D30). |
| `app-writing-styles.html` | todos os estilos de texto do editor |
| `menu-options.html` | o menu dos três pontos (interruptores e atalhos) |
| `menu-formatting.html` | o menu Aa (abre na posição do clique direito, D36) |
| `menu-table.html` | a grade de inserir tabela |
| `obsolete-menu-checklist.html` | **obsoleta**: o botão de checklist foi removido (D20). Serve só pra ver o visual do item de checklist. |

> **Como ler as telas:** os arquivos estão no formato do editor de canvas, com `<x-dc>`, `<helmet>`, `<sc-if>`, `<sc-for>`, `{{variavel}}` e um `support.js` que não existe aqui. **Não rodam** fora do canvas. Use-os como referência de markup e de estilos inline (medidas, cores, ícones SVG). Não copie essa estrutura pro código.

> **O conteúdo das notas nas telas é fictício.** Os textos de exemplo citam "Ctrl + N", "Ctrl + K — buscar" e "F11 — modo foco". Nada disso é requisito. Os atalhos reais estão em [behavior.md](behavior.md).

## Direção visual

- Tema claro e escuro (D39), os dois em **cinzas neutros, sem saturação** (R = G = B), a pedido do usuário: nada azulado. O escuro inverte o claro: veja a coluna "Escuro" dos tokens.
- **O texto principal é o destaque** (`--ui-text`: preto no claro, quase branco no escuro): botão nova nota, checkbox marcado, interruptor ligado.
- **Sem cor:** foco, links, seleção e destaque também são cinzas (os links seguem sublinhados). O cursor é da cor do texto. Os links usam um azul próprio (`--link`), definido no CSS.
- Sem gradiente, sem cor de status e sem vermelho, nem mesmo em "Apagar".
- Os valores vêm da paleta zinc original (levemente azulada), convertida pro cinza de mesma luminância.
- Ícones: SVG inline com traço (`stroke`), `viewBox 0 0 20 20`, traço de 1,6 e pontas arredondadas. Copie os paths das telas.

## Tokens da interface

São complementares ao `note-styles.css`, que cobre só o texto da nota. Transforme estes valores em variáveis CSS no código.

### Cores
| Token | Claro | Escuro (D39) | Uso |
|---|---|---|---|
| `--ui-bg` | `#FFFFFF` | `#181818` | fundo da janela e da nota |
| `--ui-raised` | `#FFFFFF` | `#1F1F1F` | menus, teclas dos atalhos, campo do link, item selecionado da lista: um degrau acima do fundo |
| `--ui-sidebar-bg` | `#F7F7F7` | `#121212` | fundo da sidebar |
| `--ui-sidebar-acrylic` | `rgba(247,247,247,.82)` | `rgba(18,18,18,.8)` | fundo da sidebar com o efeito acrílico (D40): a cor dela por cima do material, opaca o bastante pro borrado ficar só como um tom |
| `--ui-acrylic-item` | `rgba(255,255,255,.55)` | `rgba(255,255,255,.06)` | item selecionado da lista com acrílico: um véu no lugar do card sólido, com o anel `--ui-acrylic-ring` (1 px, 5%) no lugar da sombra |
| `--ui-acrylic-border` | `rgba(0,0,0,.06)` | `rgba(255,255,255,.07)` | linha do topo e borda direita da sidebar com acrílico |
| `--ui-border-window` | `#E4E4E4` | `#262626` | borda dos menus, separadores de menu |
| `--ui-border-soft` | `#EFEFEF` | `#1F1F1F` | borda direita da sidebar |
| `--ui-hover` | `#F4F4F4` | `#272727` | hover de botão e de item de menu |
| `--ui-text` | `#181818` | `#E4E4E4` | texto principal, botões de janela, interruptor ligado |
| `--ui-title` | `#272727` | `#D4D4D4` | título das notas na lista (um tom mais suave que `--ui-text`) |
| `--ui-icon` | `#535353` | `#A2A2A2` | ícones da barra, data da barra (um degrau acima de `--ui-muted`, a pedido do usuário) |
| `--ui-label` | `#404040` | `#BEBEBE` | rótulo do grupo da lista, ícones dentro dos menus |
| `--ui-muted` | `#6C6C6C` | `#8C8C8C` | prévia, rótulos de seção |
| `--ui-placeholder` | `#7D7D7D` | `#727272` | placeholder do campo do link |
| `--ui-switch-off` | `#D4D4D4` | `#404040` | trilho do interruptor desligado |
| `--ui-switch-thumb` | `#FFFFFF` | `#181818` | bolinha do interruptor |
| `--ui-tree` | `#DEDEDE` | `#333333` | linhas da árvore das opções de Tema e Idioma no menu de opções |
| `--ui-selection` | `#E6E6E6` | `rgba(137,137,137,.32)` | `::selection` do texto |
| `--ui-row-hover` | `rgba(24,24,24,.04)` | `rgba(255,255,255,.04)` | hover do item da lista |
| `--ui-scrollbar` / `-hover` | `rgba(24,24,24,.16)` / `.3` | `rgba(255,255,255,.14)` / `.28` | barra de rolagem |
| `--accent` | `#6A6A6A` | `#898989` | `outline` de foco (2 px, deslocamento de 2 px) |

As sombras (`--ui-shadow-*`) usam preto mais forte no escuro, com um anel branco de 3,5–4% no lugar do anel escuro. No escuro, as bordas ficam bem perto do fundo, a pedido do usuário: só separam, sem acender. As cores do conteúdo da nota (texto, links, código, destaque, checklist) têm o bloco escuro no fim do `note-styles.css`.

### Barra (48 px)
- Padding esquerdo de 12, `gap` de 6, itens centralizados na vertical.
- **Botão de ícone:** 36×34, raio 10, fundo transparente, cor `--ui-icon`, ícone de 17 a 18 px.
  - **Estado aberto:** fundo branco, cor `--ui-text` e sombra `0 1px 2px rgba(24,24,27,.1), 0 0 0 1px rgba(24,24,27,.04)`.
- **Data:** 12,5 px, `--ui-muted`, margem esquerda de 12, sem quebra.
- **Grupo da direita:** `gap` 2, margem direita de 2. Assim o espaço visual até o ícone de minimizar (19 px) é igual ao que separa o ícone dos três pontos do botão nova nota.
- **Botão de três pontos aberto:** fundo `--ui-hover` e cor `--ui-text`.
- **Nova nota:** círculo de 32 px, fundo `--ui-text`, "+" de 15 px em `--ui-bg` com traço 2 e margem direita de 8. Fica antes do "…" (no canvas, depois), a pedido do usuário.
- **Botões de janela:** 46 px de largura, altura total da barra, ícone de 12 px com traço 1,4 e cor `--ui-text`.

### Sidebar
- Largura de 300 px por padrão, ajustável de 240 a 400 (D38). Fundo `--ui-sidebar-bg` e borda direita de 1 px `--ui-border-soft`.
- **Alça de largura:** 7 px de largura centrados na borda direita, cursor `col-resize`. No hover e durante o arraste, a borda vira uma linha de 1 px em `--ui-border-window` (transição `--ui-fade`). Com foco por teclado, linha de 2 px em `--accent`. Durante o arraste, o cursor fica `col-resize` na janela toda e nada é selecionado.
- **Topo (48 px):** padding `0 10 0 12` e uma linha de 1 px em `--ui-border-soft` embaixo, na largura toda, dentro dos 48 px (a pedido do usuário; o canvas não tem). O primeiro grupo da lista fica a 12 px dela. "Todas as notas" em 13,5/600, com `letter-spacing` de −0,01em, colado no botão de esconder a lista, sem `gap` e sem padding à esquerda: o texto fica a 10 px do ícone, a mesma folga que o ícone tem dentro do botão.
- **Área rolável:** padding `0 4 12 14`, com o espaço da barra de rolagem (10 px) sempre reservado (`scrollbar-gutter: stable`). Os itens ficam a 14 px das duas bordas, com ou sem rolagem. No canvas, `0 6 0 10`.
- **Cabeçalho de grupo:** padding `18 4 6`: o rótulo e a data ficam um pouco pra dentro das bordas do card, bem antes do texto dele (no canvas, `18 10 6`, alinhados com o texto do card). O rótulo é 12,5/600 em `--ui-label` (no canvas, 12). O texto à direita é 11,5 em `--ui-muted`, alinhado pela linha de base.
- **Item:** padding `8 10`, raio 10, com 4 px entre um item e outro (sem isso, o selecionado e o com hover se encostavam). É mais compacto que no canvas (`10 12`, raio 12), a pedido do usuário.
  - Título em 13/600, com altura de linha de 18, na cor `--ui-title`. Menor e um tom mais claro que no canvas, a pedido do usuário.
  - Prévia em 12,5, `--ui-muted`, altura de linha de 17, uma linha com reticências e margem superior de 2. **Sem prévia, a linha não existe:** uma nota vazia vira um item de uma linha.
  - **Selecionado:** fundo branco e sombra `--ui-shadow-list-item` (`0 1px 2px rgba(24,24,27,.06), 0 0 0 1px rgba(24,24,27,.04)`), mais leve que no canvas.

### Editor
- Use o container `.note` do `note-styles.css`, com padding de 20 px na vertical e 40 na horizontal (`--note-pad-y` e `--note-pad-x`). O CSS original do design tinha 36/48; o usuário reduziu.
- A tela `app-sidebar-open` tem padding 36/56/64. **Vale o CSS (20/40).**

### Menus e popovers (padrão único)
- Fundo branco, borda de 1 px `--ui-border-window`, raio 14 e padding 6.
- Sombra (`--ui-shadow-menu`): no claro `0 8px 24px rgba(24,24,24,.04), 0 1px 3px rgba(24,24,24,.03)`; no escuro `0 8px 24px rgba(0,0,0,.14), 0 1px 3px rgba(0,0,0,.1)`. Bem mais leve que no canvas, a pedido do usuário.
- Posição: 2 px abaixo da barra (`top: 50px`), alinhado ao botão que abriu.
- **Rótulo de seção:** padding `6 10`, 12/500 em `--ui-muted`. No canvas o padding de baixo era 2; o usuário achou colado no primeiro item.
- **Item:** altura 32, padding `0 10`, raio 8, 13,5 px, `gap` 10, hover `--ui-hover`. O item ativo tem fundo `--ui-hover` e check à direita.
- **Separador:** 1 px `--ui-border-soft`, com margem `6 4`.
- **Botão de ícone no menu:** 32×32, raio 8, cor `--ui-label`.
- **Larguras:** menu Aa 264, menu de opções 288.
- **Altura máxima:** nenhum menu passa da janela; fica a 8 px das bordas (o de opções, que pende do botão, conta a partir dele). Acima disso, o menu rola, com uma barra fina (4 px visíveis) sempre à vista, longe dos cantos arredondados.
- **Interruptor:** linha de 30 px de altura. Trilho de 28×16 (`--ui-switch-off` desligado, `--ui-text` ligado). Bolinha de 12 px em `--ui-switch-thumb`.
- **Recuo no menu Aa:** os itens começam 8 px depois do rótulo da seção (padding esquerdo de 18 em vez de 10), porque não têm ícone; a linha de marcas tem padding esquerdo de 6, pro "B" ficar alinhado com o texto dos itens. No menu de opções não há recuo: os ícones das linhas já separam os itens dos rótulos.
- **Atalhos (só leitura):** no rodapé do menu, linhas de 28 px sem ícone, padding `0 7 0 10`, texto 12,5 em `--ui-label` e cursor padrão, sem hover, pra não parecerem opções.
- **`kbd`:** tecla saltada do rodapé: 11/600, altura de linha 18, largura mínima 20, padding `0 6`, borda de 1 px e sombra interna embaixo (`inset 0 -1.5px 0`) em `--ui-border-window`, fundo `--ui-raised`, cor `--ui-label` e raio 5. Espaço de 3 entre as teclas.
- **Grade de tabela:** largura 231, padding 12. Grade de 8 colunas de 23 px com `gap` 3 e células de raio 4, ocupando a largura toda do menu (no canvas, 18 px).
  - Célula apagada: `--ui-hover`, com borda `--ui-border-window`.
  - Célula acesa: `--ui-text`.
  - Contador em 13/600 com números tabulares.

### Scrollbar
Fina, invisível até o hover. Copie o bloco `::-webkit-scrollbar` de qualquer tela.

## Desvios obrigatórios em relação ao canvas

0. **Remover o botão Fixar e o grupo "Fixadas"** de todas as telas (D30).

1. **Remover o botão Modo foco** (aparece em `app-sidebar-open`). O modo foco está fora do v1.
2. **Remover o botão Anexar** (aparece em `app-writing-styles`). Anexos estão fora do v1.
3. **Remover as ações rápidas** (Aa, Tabela e Checklist) da barra em todas as telas (D20, D36). O menu Aa e a grade de tabela abrem na posição do clique direito no texto, e a grade entra no lugar do menu Aa.
4. **"Todas as notas"** vira texto fixo, sem a seta e sem ser botão (D18).
5. **Padding da nota:** usar 20/40 (do `note-styles.css`).
6. **Canto da janela:** usar o canto nativo do Windows 11, e não o raio de 14 do mockup.
7. **Texto mais compacto:** altura de linha de 24 px na nota (no canvas, 26) e 8 px entre parágrafos e blocos (`--block-gap`, no canvas 12). Parágrafos ficam com passo de 32 px (no canvas, 38).
8. **Listas mais compactas:** sem espaço entre itens (`--list-item-gap: 0`) e o bullet com `line-height: 0` pra não esticar a linha. O passo das listas com bullet e numeradas fica em 24 px (no canvas, 32). A caixa da checklist acompanha a linha de 24 px.
9. **Grupos da lista:** no lugar de "Esta semana", "Semana passada" e das semanas do canvas, os grupos são Hoje, Ontem, Últimos 7 dias, Últimos 30 dias e os meses (D16). O cabeçalho mantém o mesmo visual.
10. **Títulos com mais espaço embaixo:** Heading 1 com 26 px (no canvas, 10), Heading 2 com 22 (8) e Heading 3 com 10 (6). O espaço de cima e o Heading 4 não mudaram.

## Elementos que não estão no canvas

Desenhe-os com o padrão de menus acima, sem inventar estilo novo:

| Elemento | Especificação |
|---|---|
| Menu de clique direito da lista | itens **Renomear** e **Apagar**. Sem ícones, ou com ícones de 16 px como nos blocos do menu Aa. Abre na posição do mouse. |
| Seção "Aparência" do menu de opções (D39, D41) | a primeira do menu. Linhas "Tema" e "Idioma": a linha toda é o botão (30 px, 13,5, raio 8, hover `--ui-hover`). À direita, o valor atual em `--ui-muted` (sem bandeira: ela só aparece nas opções) e uma seta de 12 px, que gira 90° com as opções abertas. As opções abrem logo abaixo, dentro do menu, como uma árvore: um tronco de 1 px em `--ui-tree` desce de baixo do ícone da linha (18 px da esquerda), e de cada opção sai um galho curvo (raio 6, 9 px de largura) do tronco até ela; o tronco para no começo da última, cuja curva fecha o canto. Linhas de 28 px com recuo de 36 (o ícone delas alinha com o texto da linha de cima), Sistema primeiro, uma linha separadora com o mesmo recuo (o tronco passa por ela) e as opções reais. As opções ficam em `--ui-label`; a escolhida em `--ui-text`, peso 500, com check à direita. Ao abrir, um fade de 120 ms com 3 px de deslize. Depois, o interruptor "Efeito acrílico" (D40), igual aos de Layout. |
| Ícones do menu de opções | 16 px, traço de 1,6, em `--ui-icon`, 10 px antes do texto: Tema (monitor, sol ou lua, conforme o tema atual), Idioma (globo), Efeito acrílico (dois quadrados sobrepostos), Mostrar botão nova nota (+), Corretor ortográfico (linhas com check). |
| Bandeiras (D41) | SVG de 16×12, raio 2, com uma borda de 0,5 px a 12% de preto pras partes claras não sumirem no menu claro. Brasil pra Português, EUA (listras e cantão, sem estrelas) pra English. São as únicas cores saturadas da interface. |
| Rodapé dos atalhos | a seção Atalhos vira um rodapé: vai até as bordas do menu, com fundo `--ui-sidebar-bg`, linha de 1 px `--ui-border-soft` em cima e os cantos de baixo acompanhando o raio do menu. Atalhos sem ícone, com padding `0 7 0 10` (3 px a menos à direita: a tecla com contorno parecia mais longe da borda que o texto), em linhas de 28 px, 12,5 em `--ui-label`, sem quebra. |
| Foco por teclado no menu de opções | a linha em foco ganha o fundo `--ui-hover`, como no hover, em vez de um contorno: as setas andam de linha em linha. |
| Seção "Editor" do menu de opções | entre "Layout" e "Atalhos", com separador antes e depois. Rótulo de seção e interruptor iguais aos de "Layout". Um interruptor só: **Corretor ortográfico**. |
| Menu de clique direito da tabela | inserir linha acima/abaixo, inserir coluna à esquerda/direita, separador, apagar linha, apagar coluna e apagar tabela. Abre na posição do mouse. |
| Campo de link no menu Aa | troca o conteúdo do menu por um `input` de altura 32, raio 8 e borda `--ui-border-window`, com o placeholder "Cole o link" em `--ui-placeholder`. |
| Renomear inline | o campo ocupa exatamente o lugar do título: mesma fonte e cor (13/600, `--ui-title`), altura de 18 px, sem borda nem padding próprios. A edição aparece pelo texto selecionado, pelo cursor preto e pelo contorno de foco no item, que fica com fundo branco. |
| Data sozinha no começo da barra | com a sidebar aberta, a data fica a 24 px da borda (12 de padding + 12 de margem). Com a sidebar fechada, ela segue logo depois do botão de lista (6 de `gap` + 6 de margem). |
| Placeholder da nota vazia (D44) | na primeira linha, com a mesma fonte do corpo, em `--text-muted` com opacidade 0,55. Altura zero e `float`, pra o cursor ficar no começo da linha. Sem clique e sem seleção. |
| Dica do atalho (D43) | rodapé da sidebar, abaixo da lista: padding `8 18 12`, alinhada com os rótulos dos grupos. 11,5 px, altura de linha 16, `--ui-muted` com opacidade 0,8, uma linha com reticências. Sem linha em cima. |
| Aviso de atualização (D42) | rodapé da sidebar, abaixo da lista: padding `10 14`, linha de 1 px `--ui-border-soft` em cima (`--ui-acrylic-border` com acrílico). Texto "Versão X pronta" em 12,5, `--ui-label`, com reticências. Botão Reiniciar com 26 px de altura, padding `0 10`, raio 8, fundo `--ui-hover`, 12,5/500 em `--ui-text`, e hover em `--ui-border-window`. |
| Indicador "Salvo" (D37) | canto inferior direito da área da nota, a 20 px da direita e 12 px de baixo. 11 px, altura de linha 16, `--ui-muted` com opacidade 0,55. Entra em 200 ms e sai em 600 ms (ease-out). Sem clique, sem seleção e escondido de leitores de tela. |
| Item Tabela no menu Aa | em Blocos, entre Bloco de código e Divisor, com o ícone de tabela da barra antiga. |
| Divisor antes dos botões de janela | uma linha vertical de 1 × 16 px em `--ui-border-window` sempre separa o "…" (o último botão do app) dos botões do Windows. Fica no meio visual entre os dois ícones, com 19 px de cada lado. |

### Estados não desenhados
Use estes padrões:
- **Hover dos botões de ícone da barra e dos botões de janela:** fundo `--ui-hover`, inclusive no fechar, que fica **sem vermelho**.
- **Hover do item da lista:** fundo `rgba(24,24,27,.04)`.
- **Foco por teclado:** `outline` de 2 px `--accent`, com deslocamento de 2 px, em todo elemento interativo.

Se algum desses ficar estranho rodando, pergunte ao usuário antes de mudar.

**Animações** (D31): só na mudança de estado dos controles, com os tokens de `tokens.css`:
- `--ui-fade` (120 ms, ease-out): fundo, cor e sombra no hover e no estado ativo de itens de menu, botões da barra e itens da lista; fundo e borda da caixa da checklist.
- `--ui-slide` (180 ms, `cubic-bezier(.2,.8,.2,1)`): a bolinha e o trilho do interruptor, e o check da checklist, que cresce do centro.
- Menu de opções: abre em 140 ms (`--ui-ease-out`), de opacidade 0, 4 px acima e 98% do tamanho até o normal, a partir do canto de cima à direita. Fecha sem animação.
- Os outros menus e a sidebar abrem e fecham sem animação. Com `prefers-reduced-motion`, nada anima.
