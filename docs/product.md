# Produto

## O que é

Um app de notas pessoal pra Windows, inspirado no Notes do Mac. Serve tanto pra notas rápidas quanto pra notas mais completas, com uma interface extremamente simples. É pra um único usuário, numa máquina só, sem conta e sem servidor.

## Princípios

1. **Abre na hora e não atrapalha.** Tempo de abertura e de troca de nota importam mais que recursos.
2. **Fiel ao design.** As telas em `design/screens/` e o `design/note-styles.css` são a referência visual. Desvios só com decisão registrada em [decisions.md](decisions.md).
3. **v1 enxuto.** Só entra o que está listado abaixo. Ideia nova vai pra [roadmap.md](roadmap.md), não pro código.
4. **As notas são do usuário.** Cada nota é um arquivo Markdown legível fora do app. O app nunca pode perder ou corromper conteúdo.
5. **Sem inventar moda.** Quando houver um padrão consolidado (Windows, Markdown), ele vence uma solução criativa.

## Escopo do v1

- Janela sem moldura nativa, com uma barra única no topo: área de arrastar mais botões de janela próprios.
- Lista lateral (sidebar) agrupada por data (Hoje, Ontem, Últimos 7 dias, Últimos 30 dias e meses), que pode ser mostrada ou escondida e ter a largura ajustada.
- Editor rico (Tiptap) com os estilos de escrita do design e atalhos de Markdown ao digitar.
- Nova nota e menu de opções (três pontos), com o interruptor do corretor ortográfico.
- Renomear e apagar pelo clique direito na lista.
- Formatação (menu Aa) e inserir tabela pelo clique direito no texto.
- Salvamento automático em arquivos `.md` em `Documentos\Notas`, com um "Salvo" discreto no canto.
- Tema claro e escuro, seguindo o Windows ou escolhido no menu de opções (D39), e efeito acrílico opcional na sidebar (D40).
- Interface em português e inglês, seguindo o Windows ou escolhida no menu de opções (D41).

## Fora do v1

Não implementar, nem deixar "preparado" com código morto:

- busca (Ctrl K ou qualquer outra);
- captura rápida global (atalho com o app em segundo plano);
- mini nota sempre no topo;
- anexos e imagens;
- modo foco;
- fixar nota (removido, D30);
- animações além da mudança de estado dos controles (D31);
- painel de Snap Layouts no hover do botão maximizar;
- pastas, tags, filtros;
- sincronização própria (o OneDrive na pasta de notas é responsabilidade do usuário);
- assinatura de código;
- escolher a pasta de notas pela interface.
