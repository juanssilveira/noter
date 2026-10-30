# Roadmap

## v1: ordem de implementação

Cada etapa termina com o app rodando (`npm run dev`) e com os testes passando. Faça uma etapa por vez e marque aqui o que concluir.

- [x] **1. Scaffold e janela**
  - Electron (migrado do Tauri), React, TS, Vite e Vitest.
  - Fonte Geist embutida e tokens de UI em CSS.
  - Janela sem moldura, barra arrastável e botões de janela próprios.
  - X fecha o app (D33), instância única e estado da janela (`window-state.ts`).
- [x] **2. Domínio do formato**
  - `parse` e `serialize` de front matter e corpo.
  - Título, prévia, grupos da lista e datas em pt-BR (os grupos eram semanas; mudaram depois, D16).
  - Testes de ida e volta do front matter conforme [note-format.md](note-format.md). O corpo é mantido literalmente aqui; os testes de Markdown ↔ editor ficam na etapa 5.
- [x] **3. I/O de arquivos**
  - Comandos de listar, ler, salvar (atômico), criar e apagar (Lixeira), e a pasta de notas.
  - Validação de nome de arquivo.
- [x] **4. Lista lateral**
  - Leitura da pasta, agrupamento, seleção e abrir a última nota.
  - Mostrar e esconder com Ctrl \.
- [x] **5. Editor**
  - Tiptap com `note-styles.css`, atalhos de Markdown e checklist.
  - Conversão Markdown nos dois sentidos e salvamento automático.
  - Testes de ida e volta do corpo, com cada linha da tabela de mapeamento, tabela com `|` escapado, checklist aninhada e preservação de conteúdo não suportado ([note-format.md](note-format.md#testes-obrigatórios)).
- [x] **6. Ciclo da nota**
  - Rascunho e Ctrl T.
  - Cursor na última posição ao reabrir a nota (D12), guardado em `cursors` nas preferências.
  - Menu de clique direito da lista (renomear inline, apagar). O fixar foi removido depois (D30).
  - Releitura ao ganhar foco.
- [x] **7. Ações rápidas**
  - Menu Aa (estilos, marcas, blocos e campo de link).
  - Grade de tabela, edição de tabela (Tab e clique direito) e Ctrl + clique em link.
  - Depois, Aa e Tabela saíram da barra e foram pro clique direito no texto (D36).
- [x] **8. Menu de opções e preferências**
  - Interruptores, lista de atalhos e persistência em `config.json`.
- [ ] **9. Acabamento**
  - Comparar cada tela com `docs/design/screens/`.
  - Estados de hover e foco.
  - Instalador (`npm run dist`).

## Migração

- [x] **Tauri para Electron, sem bandeja** (D01, D33, D34)
  - Processo principal em `src/main/`, lógica pura em `src/main/core/` e contrato em `src/shared/`.
  - I/O de notas, preferências e estado da janela em Node, com os mesmos formatos de arquivo.

## Depois do v1

Sem ordem e sem compromisso. Não implementar sem pedido do usuário.

- Busca (Ctrl K)
- Captura rápida global
- Mini nota sempre no topo
- Anexos e imagens
- Modo foco
- Painel de Snap Layouts no hover do maximizar
- Monitorar a pasta em tempo real
- Escolher a pasta de notas pela interface
