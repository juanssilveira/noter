# Noter

App de notas pessoal pra Windows: Electron + React + TypeScript + Vite + Tiptap. As notas são arquivos Markdown em `Documentos\Notas`. O desenvolvimento é feito por agentes, e `docs/` é a fonte da verdade do projeto.

## Documentação

| Documento | Leia quando |
|---|---|
| [docs/product.md](docs/product.md) | sempre: o que é o app, os princípios e o que está **fora** do v1 |
| [docs/decisions.md](docs/decisions.md) | antes de propor qualquer mudança. Tem as decisões, os motivos e os **pontos em aberto** |
| [docs/behavior.md](docs/behavior.md) | ao implementar qualquer funcionalidade: a especificação de cada fluxo |
| [docs/note-format.md](docs/note-format.md) | ao mexer em leitura, gravação, parse ou serialização de notas |
| [docs/architecture.md](docs/architecture.md) | ao criar arquivos, canais IPC, estado ou extensões do editor |
| [docs/design.md](docs/design.md) | ao mexer em qualquer coisa visual. Lista tokens e desvios do canvas |
| [docs/glossary.md](docs/glossary.md) | quando precisar nomear algo |
| [docs/roadmap.md](docs/roadmap.md) | pra saber a próxima etapa e o que fica pra depois do v1 |

Arquivos de apoio:
- `docs/design/note-styles.css`: os estilos do conteúdo da nota (tokens de cor, tipografia e espaçamento);
- `docs/design/screens/`: as telas do canvas em HTML, só pra referência.

## Regras

1. **Siga os documentos.** Se o código e o documento divergirem, o documento vence, ou o documento é atualizado com o OK do usuário.
2. **Nada fora do escopo.** Funcionalidade que não está em `docs/product.md` não entra, nem "preparada pro futuro".
3. **Não decida o que está em aberto.** Os pontos em aberto de `docs/decisions.md` são decididos pelo usuário. Pergunte antes de implementar.
4. **Nunca perca conteúdo de nota.** Leia `docs/note-format.md` antes de mexer no I/O ou na conversão de Markdown, e mantenha os testes de ida e volta passando.
5. **Fidelidade visual.** Compare o resultado com `docs/design/screens/`, respeitando os desvios listados em `docs/design.md`.
6. **Idiomas e nomes:** código, arquivos, pastas e identificadores em inglês, com os nomes de `docs/glossary.md`; arquivos em kebab-case (D28, D32). Interface em pt-BR e em inglês (D41): todo texto visível fica em `src/renderer/i18n/strings.ts`, nos dois idiomas, e nunca direto no componente. O português com acentuação correta.
7. **Código formatado e sem erro de lint.** Antes de concluir uma tarefa que mexeu na `src/`, rode `npm run format` e depois `npm run lint`, e corrija o que sobrar. No Claude Code, um hook já formata cada arquivo editado.
8. **Mantenha os docs vivos.** Ao concluir uma etapa, marque em `docs/roadmap.md`. Quando uma decisão nova for tomada com o usuário, registre em `docs/decisions.md`. Quando a estrutura ou os comandos mudarem, atualize `docs/architecture.md`.
