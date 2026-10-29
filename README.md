# Rede Raízes do Nordeste — Front-end multicanal

Aplicação front-end do estudo de caso **Rede Raízes do Nordeste**, desenvolvida para o
**Projeto Multidisciplinar — Trilha Front-End**. O produto simula a operação de uma rede de
lanchonetes nordestinas com **retirada no balcão**, três unidades (Recife, Fortaleza e Natal),
fidelidade por pontos e **pagamento simulado localmente**.

> Projeto acadêmico. Todos os dados são fictícios. Os dados de pedidos ficam no navegador,
> e o pagamento é simulado sem cobrança ou comunicação com um gateway real.

---

## Sumário

- [Demonstração](#demonstração)
- [Escopo funcional](#escopo-funcional)
- [Stack e decisões técnicas](#stack-e-decisões-técnicas)
- [Como executar](#como-executar)
- [Contas e dados de demonstração](#contas-e-dados-de-demonstração)
- [Rotas](#rotas)
- [Regras de negócio](#regras-de-negócio)
- [Canais Web, App e Totem](#canais-web-app-e-totem)
- [LGPD e privacidade](#lgpd-e-privacidade)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Documentação](#documentação)
- [Deploy](#deploy)
- [Acessibilidade e desempenho](#acessibilidade-e-desempenho)
- [Limitações e próximos passos](#limitações-e-próximos-passos)

---

## Demonstração

| Item | Link |
| --- | --- |
| Aplicação publicada | [raizes-do-nordeste-self.vercel.app](https://raizes-do-nordeste-self.vercel.app/) |
| Repositório público | [Dev-Erasmo-Oliveira/raizes-do-nordeste](https://github.com/Dev-Erasmo-Oliveira/raizes-do-nordeste) |
| Wireframes navegáveis | [`docs/WIREFRAMES.html`](./docs/WIREFRAMES.html) |

As instruções de publicação estão em [Deploy](#deploy).

---

## Escopo funcional

**Cliente**

- cardápio por unidade, com busca, categorias, adicionais e observação;
- carrinho com agrupamento de itens iguais e cálculo de subtotal;
- checkout com dados de contato, horário de retirada e aviso de privacidade;
- cupom de desconto e resgate de pontos no mesmo pedido;
- pagamento Pix ou cartão com retorno visual de aprovação, recusa e timeout;
- acompanhamento do pedido em sete estados e histórico;
- programa de fidelidade: ganho, extrato e resgate de recompensas;
- perfil com exportação de dados e exclusão de conta.

**Operação**

- painel único com fila da unidade;
- três perfis com permissões distintas: atendente, cozinha e gerente;
- avanço de status, cancelamento e confirmação de retirada;
- restauração dos dados de demonstração (somente gerente).

**Fora do escopo** (declarado no enunciado): entrega, aplicativo nativo, backend real,
integração real com adquirente e emissão fiscal.

---

## Stack e decisões técnicas

| Camada | Escolha | Motivo |
| --- | --- | --- |
| UI | React 18 + TypeScript | componentes tipados e previsíveis, sem dependência de framework visual |
| Build | Vite 5 | dev server rápido e build estático simples de publicar |
| Rotas | React Router 6 | rotas aninhadas, layout compartilhado e proteção por sessão |
| Estado | Context API + `useReducer`-like helpers | um único estado de aplicação, sem biblioteca extra |
| Persistência | `localStorage` | simula backend e mantém a demonstração entre recargas |
| Estilo | CSS próprio, mobile-first | controle total do layout e nenhum peso de UI kit |
| Ícones | SVG inline | sem requisições extras nem dependência de fonte de ícones |
| Testes | roteiro manual documentado | ver a seção de plano de testes em [`docs/PROJETO.md`](./docs/PROJETO.md) |

O projeto não usa backend. O `AppContext` concentra catálogo, carrinho, pedidos, sessão,
pontos, consentimento e papéis. Em produção, essas funções seriam substituídas por chamadas
autenticadas a uma API, com validação de permissões no servidor.

---

## Como executar

Pré-requisitos: **Node.js 18+** e npm.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # checagem de tipos + build de produção em dist/
npm run preview  # serve o build local
```

O build falha se houver erro de TypeScript (`tsc --noEmit` roda antes do Vite).

---

## Contas e dados de demonstração

| Perfil | Acesso |
| --- | --- |
| Cliente | `cliente@raizes.com` / `raizes123` (120 pontos, histórico e termos aceitos no cadastro) |
| Operação | rota `/operacao`, sem login; o perfil é trocado no próprio painel |

O painel operacional começa como **atendente**. Para liberar todas as ações e o botão de
restaurar a demonstração, selecione **gerente**.

Cupons disponíveis:

| Código | Regra | Mínimo |
| --- | --- | --- |
| `RAIZES10` | 10% de desconto | R$ 30,00 |
| `NORDESTE5` | R$ 5,00 de desconto | R$ 25,00 |
| `BEMVINDO15` | 15% de desconto | R$ 40,00 |
| `EXPIRADO2024` | expirado de propósito (teste de erro) | — |

Cartões de teste: qualquer número com 13 a 16 dígitos é **aprovado**, exceto os terminados em
`0000`, que são **recusados**. O botão **Simular timeout** mantém o pedido aguardando pagamento.

---

## Rotas

| Rota | Tela | Acesso |
| --- | --- | --- |
| `/` | Início | público |
| `/unidades` | Unidades e horários | público |
| `/cardapio` | Cardápio por unidade | público |
| `/produto/:id` | Detalhe do produto | público |
| `/carrinho` | Carrinho | público |
| `/checkout` | Checkout e aviso de privacidade | público |
| `/pagamento/:codigo` | Pagamento simulado | público (por código do pedido) |
| `/pedido/:codigo` | Acompanhamento | público (por código do pedido) |
| `/promocoes` | Cupons e campanhas | público |
| `/privacidade` | Política de privacidade | público |
| `/entrar` | Login | público |
| `/cadastro` | Cadastro | público |
| `/operacao` | Painel operacional | público com perfil simulado |
| `/pedidos` | Meus pedidos | sessão |
| `/fidelidade` | Fidelidade | sessão |
| `/perfil` | Perfil e privacidade | sessão |
| `/totem` | Totem (quiosque) | público, layout próprio |

Rotas protegidas redirecionam para `/entrar` e voltam ao destino original após o login.

---

## Regras de negócio

Centralizadas em [`src/config/rules.ts`](./src/config/rules.ts) e
[`src/lib/pricing.ts`](./src/lib/pricing.ts):

- **Pontos:** 1 ponto por R$ 1 efetivamente pago (o total após descontos).
- **Resgate:** 1 ponto = R$ 0,10. **100 pontos = R$ 10,00**.
- **Limite:** pontos cobrem no máximo **50% do subtotal**, sempre em múltiplos de R$ 0,10.
- **Cupom:** validado por existência, uso único, validade e valor mínimo; aplicado sobre o subtotal.
- **Cupom + pontos:** combináveis; o cupom incide primeiro e os pontos sobre o subtotal restante
  respeitando o teto de 50%.
- **Retirada:** antecedência mínima de 20 minutos, intervalos de 15 minutos.
- **Quantidade:** até 20 unidades do mesmo item.
- **Pontos do pedido:** creditados somente após aprovação do pagamento; devolvidos em caso de
  cancelamento.
- **Código do pedido:** `RZ-####`, único, usado como elo entre cliente, cozinha e balcão.
- **Status:** `AGUARDANDO_PAGAMENTO → RECEBIDO → EM_PREPARO → PRONTO → RETIRADO`, com
  `PAGAMENTO_RECUSADO` e `CANCELADO` como desvios.

---

## Canais Web, App e Totem

A barra verde no topo (`Ver como: Web · App · Totem`) é um recurso de demonstração:

- **Web** — layout responsivo de navegador.
- **App** — mesma aplicação com largura de aplicativo móvel, simulando o app do cliente.
- **Totem** — rota `/totem`, independente, com layout de quiosque, alvos grandes e sem menu
  de navegação. Após o pagamento aprovado, a confirmação volta ao início automaticamente em
  20 segundos; o botão **Novo atendimento** também permite reiniciar antes desse prazo.

A troca de canal não altera dados nem regras: é a mesma base de código e o mesmo estado.

---

## LGPD e privacidade

- **Banner de privacidade** no primeiro acesso: aceitar todos, somente essenciais ou preferências
  opcionais de analytics e marketing.
- **Aviso de privacidade** no checkout e no totem; consentimento não é exigido para criar pedidos.
- **Preferências opcionais** salvas localmente; o protótipo não envia eventos de análise nem ofertas.
- **Marketing desligado por padrão**; pode ser revogado no perfil a qualquer momento.
- **Exportação** dos dados em JSON.
- **Exclusão** de conta, pedidos, pontos e consentimentos, com confirmação por palavra-chave.
- **Minimização:** os dados de pedido ficam no navegador e não são enviados a uma API ou gateway
  de pagamento; não há cobrança real.

Detalhes nas decisões de projeto em [`docs/PROJETO.md`](./docs/PROJETO.md) e na página `/privacidade`.

---

## Estrutura do projeto

```
raizes-do-nordeste/
├─ public/                  # _redirects (SPA em Netlify)
├─ src/
│  ├─ components/           # header, nav, cartões, simulador de pagamento, timeline…
│  ├─ config/rules.ts       # limites de pontos, antecedência, versão dos termos
│  ├─ context/AppContext.tsx# estado da aplicação, pedidos, sessão, LGPD, papéis
│  ├─ lib/                  # preços, formatação, status, persistência
│  ├─ mocks/                # unidades, produtos, cupons, recompensas
│  ├─ pages/                # 18 telas
│  ├─ styles/               # tokens e CSS global
│  ├─ App.tsx               # rotas
│  └─ main.tsx              # entrada
├─ docs/
│  ├─ WIREFRAMES.html       # wireframes de baixa fidelidade (mobile e desktop)
│  ├─ diagrams/             # diagramas em SVG e PNG
│  ├─ wireframes/           # frames exportados em PNG
│  ├─ tools/                # gerador dos diagramas e do documento final
│  └─ PROJETO.md             # requisitos, modelos, decisões, pagamento e testes
├─ vercel.json              # fallback de SPA na Vercel
└─ 4772692_Projeto_Front_End.docx # fonte editável do documento
```

---

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [`docs/PROJETO.md`](./docs/PROJETO.md) | requisitos, casos de uso, jornada, pagamento, decisões e plano de testes em um único documento |
| [`docs/WIREFRAMES.html`](./docs/WIREFRAMES.html) | 12 telas mobile + 4 desktop com anotações de fluxo |

Os diagramas são gerados por `python docs/tools/build_diagrams.py` (somente biblioteca padrão)
e ficam em `docs/diagrams/` (SVG vetorial e PNG em 2× para impressão). O relatório é gerado por
`python docs/tools/build_report.py`. Para atualizar o DOCX e o sumário sem exportar PDF, use
`python docs/tools/build_report.py --no-pdf --update-docx`; o Microsoft Word deve estar instalado.
Para gerar o DOCX e o PDF localmente, execute o script sem parâmetros. O PDF usa o nome
`<RU>_Projeto_Front_End.pdf` e deve ser mantido fora do repositório.

Antes de entregar, edite o bloco **Dados da entrega** no topo de `docs/tools/build_report.py`
(`ALUNO`, `RU`, `INSTITUICAO`, `CIDADE`, `DEPLOY_URL`, `REPO_URL`), rode o script novamente e
confira o Apêndice A. O nome do PDF e a tabela de links são atualizados automaticamente.
Não rode o script com o `npm run dev` aberto sem necessidade: o Word cria arquivos temporários
na raiz, e o `vite.config.ts` já ignora `*.tmp` para não derrubar o servidor.

---

## Deploy

O build é estático (`dist/`). Duas opções prontas:

**Vercel**

```bash
npm i -g vercel
vercel --prod
```

O arquivo [`vercel.json`](./vercel.json) já configura o rewrite de SPA.

**Netlify**

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

O arquivo [`public/_redirects`](./public/_redirects) cobre o fallback das rotas.

**GitHub Pages** exige ajuste de `base` no `vite.config.ts` e um fallback `404.html`; por isso,
as opções acima são as recomendadas para a entrega.

Os links públicos estão registrados na tabela de demonstração e no documento final.

---

## Acessibilidade e desempenho

- HTML semântico, um `h1` por página e hierarquia de títulos consistente.
- `skip link`, foco visível, `aria-label` em ícones e `aria-live` em status e toasts.
- Contraste ainda precisa de validação automatizada antes de uso público.
- Alvos de toque de pelo menos 44 px nas ações principais (52 px nos campos e 56 px nas ações do totem).
- `prefers-reduced-motion` respeitado.
- Formulários com `label` associado e mensagens de erro por campo.
- Sem imagens rasterizadas: ilustrações e ícones são SVG/CSS, o que reduz o peso da página.
- Bundle de produção enxuto (React + Router, sem UI kit).

---

## Limitações e próximos passos

- **Sem backend:** dados por dispositivo; dois navegadores não compartilham pedidos.
- **Pagamento simulado:** nenhuma chamada a adquirente; não há PCI nem webhook real.
- **Perfis simulados:** as permissões são aplicadas no cliente; em produção seriam validadas
  no servidor.
- **Notificações:** o aviso de "pedido pronto" é visual; não há push, e-mail ou WhatsApp.
- **Próximos passos:** API real, autenticação por token, WebSocket para a fila da cozinha,
  testes automatizados (Vitest + Playwright) e impressão térmica da comanda.

---

## Autor

**Nome:** Erasmo Carlos Gonçalves de Oliveira
**RU:** 4772692
**Instituição:** Centro Universitário Internacional (UNINTER)
**Professor:** Prof. Esp. Giuliano Lanes de Almeida
