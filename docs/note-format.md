# Formato da nota

Este é o contrato do arquivo em disco. Ele é a parte mais sensível do app: um erro aqui perde conteúdo do usuário. Qualquer mudança neste formato precisa de OK do usuário e de testes de ida e volta.

## Pasta e nome do arquivo

- **Pasta:** `Documentos\Notas`. O caminho vem de `notesDir` nas preferências. **D05**
- **Nome:** `AAAA-MM-DD_HHMMSS.md`, com a data e hora **local** de criação. Ex.: `2026-10-30_122905.md`. **D06**
  - Em colisão, acrescentar um sufixo: `2026-10-30_122905_2.md`.
  - O nome nunca muda depois de criado.
- **O que o app lê:** só arquivos `*.md` na raiz da pasta, sem subpastas. Ignora arquivos ocultos, `*.tmp` e qualquer outra extensão.
- **Codificação:** UTF-8 sem BOM, com quebra de linha `\n`. Ao ler, aceitar `\r\n` e BOM.

## Estrutura

````markdown
---
created: 2026-10-30T12:29:05-03:00
updated: 2026-10-30T13:02:41-03:00
title: Mercado
---
café, pão, ovos, banana

- [ ] pagar a conta
- [x] separar documentos
````

### Front matter (YAML)

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `created` | data e hora ISO 8601 com fuso | sim | Gravado ao criar o arquivo e nunca muda. Fonte da verdade da data de criação. |
| `updated` | data e hora ISO 8601 com fuso | sim | Atualizado a cada gravação com alteração. |
| `title` | string | não | Ausente equivale a usar a data. Só existe quando o usuário renomeia. |

- Campos desconhecidos no front matter devem ser **preservados** ao regravar. Isso inclui o `pinned` de notas antigas, da época do fixar (D30).
- **Arquivo sem front matter ou com `created` inválida** (criado ou editado por fora): usar a data do nome do arquivo. Se ele não seguir o padrão, usar a data de criação do arquivo no sistema. Na próxima gravação, completar o front matter.

### Corpo (Markdown, GFM)

Mapeamento entre o editor e o Markdown:

| Editor | Markdown |
|---|---|
| Corpo (parágrafo) | texto normal |
| Título 1 / 2 / 3 / 4 | `#` / `##` / `###` / `####` |
| Título 5 e 6 (só preservação, de notas editadas fora) | `#####` / `######`, com o mesmo visual do Título 4 |
| Pequeno (estilo de bloco) | parágrafo inteiro em `<small>…</small>` |
| Negrito | `**texto**` |
| Itálico | `*texto*` |
| Sublinhado | `<u>texto</u>` |
| Tachado | `~~texto~~` |
| Código inline | `` `texto` `` |
| Link | `[texto](url)` |
| Destaque | `==texto==` |
| Lista com marcadores | `- item` (aninhamento com 2 espaços) |
| Lista numerada | `1. item` |
| Checklist | `- [ ] item` / `- [x] item` |
| Citação | `> texto` |
| Bloco de código | cercas com ` ``` ` (linguagem opcional) |
| Divisor | `---` |
| Tabela | tabela GFM, com a primeira linha como cabeçalho e células só inline |

### Regras de ida e volta (round-trip)

1. Converter `md → editor → md` sem nenhuma edição deve produzir o **mesmo conteúdo semântico**. Diferenças só de normalização (`*` virando `-` em listas, espaços extras) são aceitas.
2. Tudo que o usuário pode criar no editor precisa sobreviver a salvar, fechar e reabrir sem perda.
3. **Markdown que o editor não suporta** (vindo de edição externa: imagem, HTML arbitrário, nota de rodapé) não pode ser apagado silenciosamente. Preserve como texto literal se não houver nó equivalente. Perder conteúdo é bug grave.
4. Um parágrafo com `<small>` que **não** ocupa o parágrafo inteiro é tratado como texto normal com HTML literal preservado. Ele não vira o estilo "Pequeno".
5. Na tabela, `|` dentro de uma célula é escapado como `\|`.

### Como a preservação funciona
- **O que é preservado:** imagens (`![alt](url)`), tags HTML inline (exceto `<u>`), blocos HTML e comentários.
- **Como:** esse conteúdo vira nós atômicos `rawInline` ou `rawBlock`, que guardam o texto original e o devolvem igual ao salvar. No editor, ele aparece em fonte mono e cinza. Dá pra apagar, mas não editar.
- **Normalizações aceitas na primeira gravação:**
  - as colunas da tabela ganham espaçamento alinhado (`| A   | B |`), e a tabela fica separada do texto por uma única linha em branco;
  - `*` e `+` em listas viram `-`.
- **Limitação conhecida:** notas de rodapé (`[^1]` e `[^1]: texto`) não são suportadas pelo parser. Elas viram um link com o texto da nota no endereço. O conteúdo continua no arquivo, mas a sintaxe muda.

### Testes obrigatórios

Cobertos em `src/renderer/domain/note.test.ts` (front matter) e `src/renderer/editor/markdown.test.ts` (corpo). Eles testam cada linha da tabela de mapeamento, mais:
- front matter ausente, parcial e com campos desconhecidos;
- arquivo com `\r\n` e com BOM;
- tabela com `|` escapado;
- checklist aninhada dentro de lista;
- conteúdo não suportado (preservação).

## Dados derivados (não gravados)

São calculados em memória a partir do arquivo:

- **Título exibido:** `title` ou a data formatada (ver a seção "Título" em [behavior.md](behavior.md)).
- **Prévia:** o primeiro texto do corpo sem sintaxe Markdown.
- **Grupo da lista:** Hoje, Ontem, Últimos 7 dias, Últimos 30 dias ou o mês, pela idade de `created` (ver "Agrupamento" em [behavior.md](behavior.md)).

## Formatos de data na interface

Em português e em inglês (D41). O inglês segue o padrão americano (mês antes do dia), com hora de 24 h.

| Uso | Português | Inglês |
|---|---|---|
| Título na lista | `Sex, 30 out · 12:29` | `Fri, Oct 30 · 12:29` |
| Cabeçalho da nota | `Sex, 30 de outubro · 12:29` | `Fri, October 30 · 12:29` |
| Prefixo da prévia (nota renomeada) | `Sex 09:14 · ` | `Fri 09:14 · ` |
| Dia no cabeçalho de grupo | `30 out` | `Oct 30` |
| Intervalo no cabeçalho de grupo | `24 – 28 out` / `26 out – 1 nov` | `Oct 24 – 28` / `Oct 26 – Nov 1` |
| Grupo de mês | `Setembro` / `Dezembro de 2025` | `September` / `December 2025` |
| Com ano (não é o atual) | `30 out 2025`, `29 dez 2025 – 4 jan 2026` | `Oct 30, 2025`, `Dec 29, 2025 – Jan 4, 2026` |

- **Dias:** Seg, Ter, Qua, Qui, Sex, Sáb, Dom / Mon, Tue, Wed, Thu, Fri, Sat, Sun.
- **Meses abreviados:** jan, fev, mar, abr, mai, jun, jul, ago, set, out, nov, dez / Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec.
- **Ano:** só aparece quando não é o ano atual (suposição; ver [decisions.md](decisions.md#pontos-em-aberto)).
