# Documenta??o t?cnica ? Ra?zes do Nordeste

Documento de apoio do reposit?rio, reunindo requisitos, casos de uso, jornada, pagamento, decis?es e testes. O documento de entrega da atividade continua sendo o PDF gerado a partir do relat?rio.

## ?ndice

- [Requisitos](#requisitos)
- [Casos de uso](#casos-de-uso)
- [Jornada do cliente](#jornada-do-cliente)
- [Pagamento](#pagamento)
- [Decis?es de projeto](#decis?es-de-projeto)
- [Plano de testes](#plano-de-testes)

---

## Requisitos

Documento de apoio ao projeto front-end. Os requisitos abaixo refletem o que está implementado
na aplicação e servem de base para a rastreabilidade com telas, regras e testes.

---

### 1. Escopo

**Dentro do escopo**

- cardápio por unidade, com retirada no balcão;
- pedido multicanal (Web, App e Totem) com pagamento simulado localmente, sem gateway real;
- fidelidade por pontos, cupons e recompensas;
- acompanhamento do pedido e painel operacional com perfis;
- consentimento, transparência e direitos do titular (LGPD).

**Fora do escopo**

- entrega em domicílio;
- aplicativo nativo publicado em loja;
- backend, banco de dados e integração real com adquirente;
- emissão de nota fiscal e controle de estoque;
- programa de fidelidade com regras por segmento ou cashback.

---

### 2. Atores

| Ator | Descrição | Necessidades principais |
| --- | --- | --- |
| **Cliente** | pessoa que pede para retirar na unidade | ver cardápio correto da loja, pagar com segurança e saber quando retirar |
| **Atendente** | operador do balcão | localizar a comanda, confirmar retirada e cancelar pedidos sem pagamento |
| **Cozinha** | equipe de produção | ver a fila em ordem e avançar o preparo |
| **Gerente / Administrador** | responsável pela unidade | visão completa da fila, cancelamento e restauração da demonstração |

---

### 3. Requisitos funcionais

Legenda de prioridade: **E** essencial, **I** importante, **D** desejável.
Situação: **✔** implementado, **Pendente** ainda não implementado, **—** fora do escopo.

#### 3.1 Cliente

| ID | Requisito | Prioridade | Situação |
| --- | --- | --- | --- |
| RF-01 | O cliente deve selecionar a unidade de retirada entre Recife, Fortaleza e Natal, vendo endereço, horário e situação de abertura. | E | ✔ |
| RF-02 | O cardápio deve exibir apenas os produtos disponíveis na unidade selecionada, com preço, descrição, foto/ilustração e selos. | E | ✔ |
| RF-03 | O cliente deve buscar por nome/descrição e filtrar por categoria. | I | ✔ |
| RF-04 | O cliente deve personalizar o item com adicionais limitados pelo produto e observação livre. | E | ✔ |
| RF-05 | O carrinho deve somar itens idênticos, permitir alterar quantidade, remover itens e exibir subtotal. | E | ✔ |
| RF-06 | O cliente deve informar nome, telefone, e-mail e horário de retirada, com validação por campo. | E | ✔ |
| RF-07 | O sistema deve informar como os dados do pedido são usados e oferecer acesso à política, sem exigir consentimento obrigatório para criar o pedido. | E | ✔ |
| RF-08 | O cliente deve aplicar cupom de desconto, com mensagens específicas para cupom inexistente, expirado, já usado ou abaixo do mínimo. | E | ✔ |
| RF-09 | O cliente autenticado deve usar pontos no pedido, respeitando o limite de 50% do subtotal. | E | ✔ |
| RF-10 | O sistema deve representar a solicitação de pagamento externo por Pix ou cartão e exibir aprovação, recusa ou timeout; no protótipo, os retornos são simulados localmente, sem cobrança ou integração real. | E | ✔ |
| RF-11 | O cliente deve acompanhar o pedido pelos estados `AGUARDANDO_PAGAMENTO`, `RECEBIDO`, `EM_PREPARO`, `PRONTO`, `RETIRADO`, `PAGAMENTO_RECUSADO` e `CANCELADO`. | E | ✔ |
| RF-12 | O cliente autenticado deve consultar o histórico de pedidos e reabrir o acompanhamento. | I | ✔ |
| RF-13 | O cliente autenticado deve visualizar saldo, extrato e recompensas, e resgatar pontos gerando cupom. | E | ✔ |
| RF-14 | O cliente deve se cadastrar e autenticar com e-mail e senha, com sessão persistida no dispositivo. | E | ✔ |
| RF-15 | O cliente deve editar nome e telefone no perfil. | I | ✔ |
| RF-16 | O cliente deve alternar consentimentos de analytics e marketing a qualquer momento. | E | ✔ |
| RF-17 | O cliente deve exportar seus dados em JSON. | E | ✔ |
| RF-18 | O cliente deve excluir a conta e os dados, com confirmação por palavra-chave. | E | ✔ |
| RF-19 | O cliente deve consultar promoções e cupons ativos. | D | ✔ |
| RF-20 | O cliente deve consultar a política de privacidade em página própria. | E | ✔ |

#### 3.2 Operação

| ID | Requisito | Prioridade | Situação |
| --- | --- | --- | --- |
| RF-21 | O painel deve listar os pedidos da unidade com código, cliente, horário, itens, total e status. | E | ✔ |
| RF-22 | O painel deve filtrar por status e por unidade. | I | ✔ |
| RF-23 | O atendente deve confirmar a retirada de pedidos `PRONTO` e cancelar pedidos `AGUARDANDO_PAGAMENTO`. | E | ✔ |
| RF-24 | A cozinha deve avançar pedidos `RECEBIDO` e `EM_PREPARO`. | E | ✔ |
| RF-25 | O gerente deve avançar qualquer status ativo, cancelar pedidos e restaurar os dados de demonstração. | E | ✔ |
| RF-26 | O sistema deve indicar visualmente quando uma ação não é permitida ao perfil ativo. | I | ✔ |

#### 3.3 Totem

| ID | Requisito | Prioridade | Situação |
| --- | --- | --- | --- |
| RF-27 | O totem deve funcionar em rota própria, sem menu de navegação e com alvos ampliados. | E | ✔ |
| RF-28 | O totem deve solicitar o primeiro nome, apresentar aviso de privacidade e permitir continuar sem consentimento obrigatório. | E | ✔ |
| RF-29 | O totem deve montar o pedido, pagar e exibir o código de retirada, retornando ao início após 20 s. | E | ✔ |

#### 3.4 Canais

| ID | Requisito | Prioridade | Situação |
| --- | --- | --- | --- |
| RF-30 | A demonstração deve permitir alternar entre Web, App e Totem sem perder o estado. | I | ✔ |

---

### 4. Requisitos não funcionais

| ID | Categoria | Requisito | Como foi atendido |
| --- | --- | --- | --- |
| RNF-01 | Responsividade | Layout mobile-first, previsto para telas de 320 px a 1440 px. | Grid fluido e breakpoints em 640/900/1200 px; validar conforme a seção [Plano de testes](#plano-de-testes). |
| RNF-02 | Desempenho | Primeira renderização rápida e navegação sem recarregar a página. | SPA com Vite, sem UI kit, ícones SVG inline, bundle enxuto. |
| RNF-03 | Acessibilidade | Suporte a teclado, foco visível e contraste a verificar. | Skip link, atributos `aria-*`, regiões de status e `prefers-reduced-motion`; validação pendente. |
| RNF-04 | Usabilidade | Fluxo de pedido concluível sem instrução prévia. | Uma ação primária por tela, rótulos explícitos, estados vazios com CTA. |
| RNF-05 | Consistência | Mesmas regras e componentes em Web, App e Totem. | Fonte única de estado e componentes compartilhados. |
| RNF-06 | Privacidade | Não há envio dos dados de pedido a uma API ou gateway de pagamento. | Pedidos armazenados em `localStorage`; pagamento simulado localmente. |
| RNF-07 | Transparência | Finalidades e escolhas opcionais de privacidade devem ser claras. | Banner, checkout, totem, política e perfil. |
| RNF-08 | Manutenibilidade | Regras de negócio isoladas da interface. | `config/rules.ts`, `lib/pricing.ts`, `lib/status.ts`. |
| RNF-09 | Tipagem | Sem `any` implícito; build falha em erro de tipo. | `tsc --noEmit` antes do build. |
| RNF-10 | Compatibilidade | Navegadores modernos (Chromium, Firefox, Safari). | APIs padrão; `navigator.clipboard` com fallback de mensagem. |
| RNF-11 | Resiliência | Falha de pagamento não deixa o pedido em estado ambíguo. | Estados explícitos, nova tentativa e consulta por código. |
| RNF-12 | Publicação | Build estático com fallback de SPA. | `vercel.json` e `public/_redirects`. |

---

### 5. Regras de negócio

| ID | Regra | Implementação |
| --- | --- | --- |
| RN-01 | Cada ponto vale R$ 0,10 no resgate; 100 pontos = R$ 10,00. | `RULES.valorPonto` |
| RN-02 | O cliente ganha 1 ponto por R$ 1 do total pago. | `RULES.pontosPorReal`, `criarPedido` |
| RN-03 | Pontos cobrem no máximo 50% do subtotal e apenas em múltiplos de R$ 0,10. | `limiteDePontos` |
| RN-04 | Cupom é único por cliente/dispositivo e exige valor mínimo. | `validarCupom`, `cuponsUsados` |
| RN-05 | Cupom e pontos são cumulativos, nesta ordem de cálculo. | `descontoDoCupom` → `descontoDePontos` |
| RN-06 | Retirada exige antecedência mínima de 20 min, em intervalos de 15 min. | `RULES.antecedenciaMinimaMin`, `slotMinutos` |
| RN-07 | O mesmo produto aceita no máximo 20 unidades por item. | `RULES.maxItensPorProduto` |
| RN-08 | Pontos só são creditados após aprovação do pagamento. | `aprovarPagamento` |
| RN-09 | Cancelamento devolve pontos usados e remove os pontos ganhos. | `cancelarPedido` |
| RN-10 | Unidade fechada bloqueia novos pedidos, mas mantém o histórico. | `UNIDADES.aberta` |
| RN-11 | Item indisponível na unidade aparece desabilitado, não oculto. | `disponivelNaUnidade` |
| RN-12 | O código do pedido é único no dispositivo (`RZ-####`). | `gerarCodigoPedido` |
| RN-13 | As escolhas opcionais de analytics e marketing não condicionam a criação do pedido. | `ConsentBanner`, `Checkout`, `Totem` |
| RN-14 | Marketing é opcional e desligado por padrão. | `Consentimento.marketing` |
| RN-15 | Exclusão de conta remove cadastro, pedidos, pontos e consentimentos. | `excluirConta` |

---

### 6. Rastreabilidade

| Requisito | Tela / componente | Teste |
| --- | --- | --- |
| RF-01 | `/unidades`, seletor de unidade no header | T-02 |
| RF-02, RF-03 | `/cardapio` | T-03 |
| RF-04 | `/produto/:id` | T-04 |
| RF-05 | `/carrinho` | T-05 |
| RF-06, RF-07 | `/checkout` | T-06, T-07 |
| RF-08 | `/carrinho`, `/checkout` | T-08 |
| RF-09 | `/checkout` | T-09 |
| RF-10 | `/pagamento/:codigo`, `PaymentSimulator` | T-10, T-11, T-12 |
| RF-11 | `/pedido/:codigo`, `StatusTimeline` | T-13 |
| RF-12 | `/pedidos` | T-14 |
| RF-13 | `/fidelidade` | T-15 |
| RF-14, RF-15 | `/entrar`, `/cadastro`, `/perfil` | T-01, T-16 |
| RF-16 a RF-18 | `/perfil`, `/privacidade` | T-17, T-18 |
| RF-21 a RF-26 | `/operacao` | T-19, T-20 |
| RF-27 a RF-29 | `/totem` | T-21 |
| RF-30 | barra de canais | T-22 |

---

### 7. Premissas e restrições

- O volume de dados é de demonstração: 19 produtos, 6 categorias, 3 unidades e 4 cupons.
- O estado é local ao navegador; limpar os dados do site restaura a demonstração.
- O pagamento é determinístico para permitir teste repetível: final `0000` recusa; os demais
  aprovam; o botão de timeout simula ausência de resposta.
- Não há autenticação real: a sessão é um identificador em `localStorage`.
- O texto da política de privacidade é um modelo acadêmico e não substitui parecer jurídico.

---

## Casos de uso

O diagrama completo está em [`diagrams/casos-de-uso.svg`](./diagrams/casos-de-uso.svg)
(versão para impressão em [`diagrams/png/casos-de-uso.png`](./diagrams/png/casos-de-uso.png)).

---

### 1. Atores

| Ator | Tipo | Responsabilidade |
| --- | --- | --- |
| **Cliente** | primário | consulta o cardápio, monta o pedido, paga, acompanha e retira |
| **Atendente** | primário | organiza a fila do balcão, confirma retiradas e cancela pedidos sem pagamento |
| **Cozinha** | primário | assume e conclui o preparo dos pedidos recebidos |
| **Gerente / Administrador** | primário | supervisiona a fila, cancela pedidos e restaura a demonstração |
| **Sistemas de Pagamento Externos** | secundário, conceitual | representam a autorização e o retorno do pagamento; no protótipo, esse papel é simulado localmente, sem integração real |

O totem não é um ator: é um **canal** usado pelo próprio cliente. O ator externo de pagamento
consta no modelo para atender ao cenário conceitual do enunciado; a aplicação não envia
solicitações a um serviço real.

---

### 2. Visão geral dos casos de uso

| UC | Nome | Atores | Objetivo |
| --- | --- | --- | --- |
| UC-01 | Consultar cardápio por unidade | Cliente | ver o que existe na loja escolhida, com preço e disponibilidade |
| UC-02 | Cadastrar-se e autenticar | Cliente | ter sessão para histórico, pontos e perfil |
| UC-03 | Montar pedido e escolher retirada | Cliente | transformar itens em um pedido com horário |
| UC-04 | Aplicar cupom ou pontos | Cliente | reduzir o total dentro das regras |
| UC-05 | Realizar pagamento | Cliente; Sistemas de Pagamento Externos (conceitual) | representar a solicitação e o retorno do pagamento; no protótipo, simular a resposta e liberar a produção |
| UC-06 | Acompanhar status do pedido | Cliente | saber quando o pedido estará pronto |
| UC-07 | Consultar histórico | Cliente | reabrir pedidos anteriores |
| UC-08 | Resgatar recompensa | Cliente | trocar pontos por cupom |
| UC-09 | Gerenciar consentimento e dados pessoais | Cliente | exercer direitos de LGPD |
| UC-10 | Consultar fila da unidade | Atendente, Cozinha, Gerente | enxergar o trabalho pendente |
| UC-11 | Avançar status e confirmar retirada | Atendente, Cozinha, Gerente | mover a comanda no fluxo |
| UC-12 | Cancelar pedido | Atendente, Gerente | encerrar um pedido sem retirada |
| UC-13 | Preparar pedido | Cozinha | executar a produção |
| UC-14 | Acompanhar indicadores da unidade | Gerente | acompanhar volume e restaurar a demonstração |

Relações: **UC-05** inclui **UC-03** (não há pagamento sem pedido) e o **UC-03** pode incluir
**UC-04**. **UC-06** depende do retorno de **UC-05**. As relações não foram desenhadas como
`«include»` no diagrama para manter a leitura limpa em impressão; ficam registradas aqui e no
texto da seção 3.

---

### 3. Descrição detalhada — UC-05 Realizar pagamento

**Descrição:** o cliente confirma o pedido e simula um pagamento por Pix ou cartão. O componente
local gera um retorno demonstrativo e o sistema atualiza o estado visível do pedido.

**Atores:** Cliente e Sistemas de Pagamento Externos (conceitual). `PaymentSimulator` é o
componente local que representa o retorno externo, sem realizar uma chamada real.

**Pré-condições**

1. Existe um pedido com status `AGUARDANDO_PAGAMENTO` e código `RZ-####`.
2. O cliente informou nome, telefone e horário de retirada.
3. O valor total é maior que zero.

**Fluxo principal**

1. O cliente é direcionado para `/pagamento/:codigo`.
2. O sistema exibe o resumo (código, total, unidade e horário) e o aviso de ambiente simulado.
3. O cliente escolhe **Pix** ou **Cartão**.
4. **Pix:** o sistema exibe QR Code ilustrativo e código copia e cola; o cliente confirma
   "Já fiz o pagamento".
   **Cartão:** o cliente informa número, nome, validade e CVV; o sistema valida o formato e
   valida os campos, sem enviar dados a um serviço de pagamento.
5. A interface entra em estado **processando**, bloqueia reenvio e informa que não deve fechar
   a página.
6. O simulador local retorna **aprovado**.
7. O sistema altera o pedido para `RECEBIDO`, registra o `transacaoId`, credita os pontos
   (se houver cliente autenticado) e consome o cupom utilizado.
8. A tela de sucesso exibe o código de retirada, o horário e os pontos ganhos, com ação
   **Acompanhar pedido**.

**Fluxos alternativos**

- **A1 — Pagamento recusado (cartão terminado em `0000`):** o simulador retorna `declined`; o
  pedido passa a `PAGAMENTO_RECUSADO`; a tela mostra o motivo e oferece **Tentar novamente**
  com outro método. O pedido permanece no histórico.
- **A2 — Timeout / ausência de resposta:** a interface informa que o processamento continua e
  mantém o pedido em `AGUARDANDO_PAGAMENTO`; o cliente pode consultar pelo código ou tentar
  novamente. Nenhum ponto é creditado.
- **A3 — Erro de validação no cartão:** número com menos de 13 dígitos, nome com menos de 3
  caracteres, validade fora de `MM/AA` ou CVV com menos de 3 dígitos. A mensagem aparece junto
  ao formulário e o fluxo é bloqueado antes da simulação.
- **A4 — Pedido já pago:** ao reabrir a URL, o sistema identifica status diferente de
  `AGUARDANDO_PAGAMENTO` e mostra o estado atual, sem permitir pagar duas vezes.
- **A5 — Cancelamento durante o pagamento:** se o pedido for cancelado no painel, a tela de
  pagamento exibe o estado `CANCELADO` e desabilita as ações.

**Pós-condições**

- **Sucesso:** pedido `RECEBIDO`, pagamento `APROVADO`, pontos creditados, cupom consumido e
  pedido visível na fila da unidade.
- **Recusa:** pedido `PAGAMENTO_RECUSADO`, sem crédito de pontos e sem consumo de cupom.
- **Timeout:** pedido permanece `AGUARDANDO_PAGAMENTO` com pagamento `EXPIRADO`.

**Regras de negócio aplicáveis:** RN-02, RN-08, RN-12, RN-13.

**Requisitos relacionados:** RF-10, RF-11, RNF-11.

**Observação sobre o processamento:** a integração externa é conceitual no modelo. Em produção,
o backend enviaria a solicitação ao provedor e receberia aprovação, recusa ou timeout. A aplicação
**não** implementa cobrança nem se comunica com um gateway: `PaymentSimulator` roda localmente,
com latência de 1,2 a 2,6 s, retorno determinístico e painel de testes.

---

### 4. Descrição resumida — UC-06 Acompanhar status do pedido

**Atores:** Cliente (primário).

**Pré-condições:** pedido existente, acessível pelo código.

**Fluxo principal**

1. O cliente abre `/pedido/:codigo` (link do sucesso, histórico ou notificação).
2. O sistema exibe código, unidade, horário, total e a linha do tempo.
3. O estado atual é destacado; etapas futuras aparecem esmaecidas.
4. A tela mostra o status salvo no dispositivo; para ver mudanças feitas depois, o cliente precisa reabrir ou recarregar a página.
5. Ao chegar em `PRONTO`, o texto orienta a retirada no balcão com o código.
6. Em `RETIRADO`, a linha do tempo é concluída e a ação primária passa a ser "Fazer novo pedido".

**Fluxos alternativos**

- Pedido `PAGAMENTO_RECUSADO`: a tela oferece **Tentar pagar novamente**.
- Pedido `CANCELADO`: exibe motivo e remove ações de acompanhamento.
- Código inexistente: mensagem "Pedido não encontrado" com link para o cardápio.

**Pós-condição:** cliente informado; nenhum dado é alterado.

---

### 5. Descrição resumida — UC-09 Gerenciar consentimento e dados pessoais

**Atores:** Cliente (primário).

**Pré-condições:** sessão ativa.

**Fluxo principal**

1. O cliente acessa `/perfil`.
2. O sistema mostra dados cadastrais, consentimentos por finalidade, versão e data do aceite.
3. O cliente altera analytics ou marketing; a mudança é registrada com nova data.
4. O cliente pode **exportar** os dados: o sistema gera um JSON com cadastro, pedidos, pontos,
   consentimentos e preferências, baixado no navegador.
5. O cliente pode **excluir a conta**: digita `EXCLUIR` na confirmação.
6. O sistema remove cadastro, pedidos, pontos, cupons e consentimentos do dispositivo e encerra
   a sessão.

**Fluxos alternativos**

- Exportação sem dados: o JSON é gerado apenas com os dados existentes.
- Palavra-chave incorreta: exclusão bloqueada com mensagem de erro.
- Marketing desativado: a preferência fica desligada; isso não impede o pedido.

**Pós-condições:** direitos exercidos e registrados; nenhum dado permanece após a exclusão.

---

### 6. Matriz caso de uso × tela

| Caso de uso | Tela principal | Telas de apoio |
| --- | --- | --- |
| UC-01 | `/cardapio` | `/unidades`, `/` |
| UC-02 | `/entrar` | `/cadastro` |
| UC-03 | `/carrinho` | `/produto/:id`, `/checkout` |
| UC-04 | `/carrinho` | `/checkout`, `/fidelidade` |
| UC-05 | `/pagamento/:codigo` | `/checkout` |
| UC-06 | `/pedido/:codigo` | `/pedidos` |
| UC-07 | `/pedidos` | `/pedido/:codigo` |
| UC-08 | `/fidelidade` | `/checkout` |
| UC-09 | `/perfil` | `/privacidade` |
| UC-10, UC-11, UC-12 | `/operacao` | `/pedido/:codigo` |
| UC-13 | `/operacao` | — |
| UC-14 | `/operacao` | — |

---

## Jornada do cliente

Mapa da jornada do cliente desde o primeiro contato com a marca até a retirada do pedido.
Diagrama completo em [`diagrams/jornada.svg`](./diagrams/jornada.svg) (impressão:
[`diagrams/png/jornada.png`](./diagrams/png/jornada.png)).

**Persona de referência:** cliente de 24 a 40 anos, usa o celular no trajeto para o trabalho ou
para a faculdade, quer resolver o almoço em poucos minutos e valoriza comida regional sem
esperar em fila.

**Cenário:** pedido individual, retirada no balcão, pagamento por Pix ou cartão.

> **Leitura do diagrama.** O mapa em [`diagrams/jornada.svg`](./diagrams/jornada.svg) agrupa a
> jornada em **seis etapas** para caber em uma página A4: descoberta, unidade e cardápio,
> montagem (que inclui o carrinho), checkout, pagamento e preparo/retirada. A tabela da seção 1
> detalha nove momentos, separando **montagem** de **carrinho** e **preparo** de **retirada**;
> o pós-venda aparece como extensão, porque o diagrama encerra na retirada.

---

### 1. Visão por etapa

| # | Etapa | Ação do cliente | Pensamento | Emoção | Atrito | Oportunidade | Tela |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Descoberta | abre o site/app ou encontra o totem | "tem algo rápido e bom perto de mim?" | curioso | muitas opções genéricas, difícil confiar | identidade nordestina clara e proposta de retirada explícita | Início, Totem |
| 2 | Unidade e cardápio | escolhe a loja e explora o cardápio | "essa loja está aberta? tem o que eu quero?" | expectativa | preço ou item que não existe naquela loja | unidade sempre visível; item indisponível marcado, não escondido | Unidades, Cardápio |
| 3 | Montagem | personaliza o item e a quantidade | "consigo tirar a cebola? quanto fica com queijo?" | controle | adicionais sem preço claro ou limite escondido | preço do botão já somado; limite de adicionais por produto | Produto |
| 4 | Carrinho | revisa itens, cupom e total | "está certo? tem desconto?" | conferência | cupom recusado sem explicação | erro específico por motivo (expirado, mínimo, já usado) | Carrinho |
| 5 | Checkout | informa dados e horário; consulta o aviso de privacidade | "preciso mesmo dar meu telefone?" | desconfiança | formulário longo e pedido de dados sem justificativa | explicar a finalidade e deixar escolhas opcionais separadas | Checkout |
| 6 | Pagamento | paga por Pix ou cartão | "deu certo? foi cobrado duas vezes?" | ansiedade | ausência de retorno ou tela travada | estado "processando", retorno explícito e código de retirada | Pagamento |
| 7 | Preparo | consulta o status | "quanto falta? já posso ir?" | impaciência | status sem previsão e sem atualização automática | linha do tempo; atualização automática ainda pendente | Acompanhamento |
| 8 | Retirada | apresenta o código no balcão | "é esse mesmo? está pronto?" | alívio | fila confusa e comanda perdida | código curto, fila por status e confirmação no painel | Acompanhamento, Operação |
| 9 | Pós-venda | confere pontos e histórico | "ganhei pontos? valeu a pena?" | recompensa | pontos que não aparecem | crédito imediato, extrato e recompensas alcançáveis | Fidelidade, Meus pedidos |

---

### 2. Estados do sistema por etapa

| Etapa | Estado | Integração |
| --- | --- | --- |
| Descoberta | sem estado de pedido | nenhuma |
| Unidade e cardápio | unidade selecionada | catálogo mock por unidade |
| Montagem | carrinho em edição | cálculo de preço e adicionais |
| Checkout | carrinho validado + aviso de privacidade | dados do pedido no navegador |
| Pagamento | `AGUARDANDO_PAGAMENTO` → `RECEBIDO` | ator externo representado conceitualmente; simulador local sem gateway real |
| Preparo | `EM_PREPARO` → `PRONTO` | fila da cozinha |
| Retirada | `RETIRADO` | confirmação do atendente |
| Pós-venda | pontos creditados | fidelidade e histórico |

---

### 3. Momentos de decisão

1. **Qual canal usar?** Web no desktop do trabalho, app no celular, totem na loja.
2. **A unidade está aberta e tem o item?** Bloqueio de pedido fora do horário e marcação de
   indisponibilidade.
3. **Vale adicionar queijo?** O preço final é atualizado no botão antes da confirmação.
4. **Quais dados são usados no pedido?** A finalidade e a política são informadas; a escolha de
   marketing e analytics não bloqueia a compra.
5. **Uso cupom ou pontos?** O sistema mostra o teto de 50% e o impacto no total.
6. **O pagamento foi aprovado?** Três retornos distintos, todos com próximo passo.
7. **Já posso retirar?** O status `PRONTO` é o gatilho; o código é o comprovante.

---

### 4. Pontos de dor e respostas da interface

| Dor | Resposta implementada |
| --- | --- |
| "Não sei se a loja está aberta." | situação e horário no seletor de unidade e no cabeçalho |
| "O preço mudou quando adicionei o extra." | botão mostra o total atualizado em tempo real |
| "Meu cupom não funcionou." | mensagem por motivo, sem apagar o código digitado |
| "Não quero receber propaganda." | marketing opcional, desligado por padrão e revogável |
| "Paguei e a tela sumiu." | pedido recuperável pelo código e pelo histórico |
| "Não sei se já está pronto." | linha do tempo e texto de retirada; a tela não atualiza automaticamente |
| "Não achei meu pedido no balcão." | código curto na comanda e busca por código no painel |

---

### 5. Emoção ao longo do percurso

```
curiosidade → expectativa → controle → conferência → desconfiança
     → ansiedade → impaciência → alívio → recompensa
```

As maiores quedas estão no **checkout** (pedido de dados) e no **pagamento** (espera sem
resposta). Por isso a finalidade dos dados é explicada no contexto e o pagamento tem estado de
processamento visível com três desfechos claros.

---

### 6. Canais e continuidade

| Canal | Contexto de uso | Diferença de interface |
| --- | --- | --- |
| **Web** | desktop, planejamento da refeição | duas colunas, carrinho fixo, navegação completa |
| **App** | deslocamento, uma mão | largura de aplicativo, barra inferior, alvos maiores |
| **Totem** | na loja, em pé | tela cheia, sem menu; permite reinício imediato e volta ao início automaticamente após 20 segundos |

A jornada é a mesma; muda apenas a densidade de informação e o tamanho dos alvos. O estado fica no
navegador em que o pedido foi criado; não há sincronização entre dispositivos.

---

### 7. Oportunidades futuras

- aviso de "pedido pronto" por push/WhatsApp;
- repetir último pedido em um toque;
- tempo de preparo estimado a partir da fila real;
- fidelidade com metas e missões;
- retirada sem contato (código + QR no balcão).

---

## Pagamento

O estudo de caso exige representar o **retorno visual ao usuário**, sem implementar cobrança real.
O simulador executa localmente no navegador e não envia dados a um gateway externo. Este documento
descreve o fluxo implementado, os estados possíveis e como testar cada resposta.

Diagrama de sequência: [`diagrams/pagamento-sequencia.svg`](./diagrams/pagamento-sequencia.svg).

---

### 1. Onde o pagamento entra na jornada

```
Checkout (dados + aviso de privacidade + cupom/pontos)
        ↓  cria pedido  status AGUARDANDO_PAGAMENTO
/pagamento/:codigo
        ↓  escolha do método
Simulador local (1,2 s a 2,6 s de latência)
        ↓
aprovado → RECEBIDO → cozinha
recusado → PAGAMENTO_RECUSADO → nova tentativa
timeout  → permanece AGUARDANDO_PAGAMENTO → consultar pedido
```

O pedido é criado **antes** do pagamento. Isso garante que o código `RZ-####` já exista e que a
operação consiga enxergar pedidos que ainda não foram pagos.

---

### 2. Métodos

#### 2.1 Pix

- QR Code **ilustrativo**, gerado em CSS a partir de uma semente determinística (não é um QR
  Code válido).
- Código copia e cola fictício, com botão de cópia e fallback quando a área de transferência é
  bloqueada pelo navegador.
- Botão **Já fiz o pagamento** simula a confirmação do banco e retorna aprovação após 2,4 s.
- Aviso explícito: "O QR Code é ilustrativo. Nenhum valor é cobrado."

#### 2.2 Cartão

Validação no cliente, antes de qualquer chamada:

| Campo | Regra | Mensagem |
| --- | --- | --- |
| Número | mínimo de 13 dígitos; máscara em blocos de 4 | "Informe um número de cartão com pelo menos 13 dígitos." |
| Nome | mínimo de 3 caracteres | "Informe o nome impresso no cartão." |
| Validade | formato `MM/AA` | "A validade deve estar no formato MM/AA." |
| CVV | 3 ou 4 dígitos | "Informe um CVV com 3 ou 4 dígitos." |

Regra de simulação: **número terminado em `0000` é recusado**; qualquer outro válido é aprovado.
Nenhum dado de cartão é armazenado — o estado do formulário existe apenas em memória.

---

### 3. Estados do pagamento

| Estado | Significado | Efeito no pedido |
| --- | --- | --- |
| `INICIANDO` | pedido criado, aguardando ação | `AGUARDANDO_PAGAMENTO` |
| `APROVADO` | simulador local retornou aprovação | `RECEBIDO`, pontos creditados, cupom consumido |
| `RECUSADO` | simulador local retornou recusa | `PAGAMENTO_RECUSADO`, nova tentativa liberada |
| `EXPIRADO` | sem resposta no tempo esperado | permanece `AGUARDANDO_PAGAMENTO` |
| — | cancelamento manual | `CANCELADO`, fora do fluxo de pagamento |

Cada transação guarda `transacaoId`, número de `tentativas` e `atualizadoEm`, exibidos no painel
operacional e no acompanhamento.

---

### 4. Retorno visual

O retorno nunca é apenas um toast. Cada desfecho tem uma tela/estado próprio:

- **Aprovado:** bloco de confirmação com ícone, código de retirada, horário, pontos ganhos e
  ação **Acompanhar pedido**.
- **Recusado:** bloco de erro com motivo, ação **Tentar novamente** e link para o suporte.
- **Timeout:** aviso de processamento em andamento, ação **Consultar pedido** e possibilidade de
  nova tentativa; o pedido continua visível em `/pedidos`.

Enquanto a transação está em andamento, o formulário fica desabilitado e um `role="status"`
anuncia "Processando pagamento…". Isso evita duplo clique e duplicidade de pedidos.

---

### 5. Painel de testes

Sempre visível abaixo do formulário:

| Botão | Resultado | Uso |
| --- | --- | --- |
| **Forçar aprovação** | `APROVADO` em 1,2 s | demonstrar o caminho feliz |
| **Forçar recusa** | `RECUSADO` em 1,2 s | demonstrar erro sem digitar cartão |
| **Simular timeout** | `EXPIRADO` em 1,2 s | demonstrar ausência de resposta |

O painel só existe porque o pagamento é simulado; em produção ele seria removido.

---

### 6. Como o fluxo foi modelado

O sistema de pagamento externo deste fluxo é um **ator conceitual** para representar a integração
pedida no estudo de caso. A sequência abaixo descreve uma arquitetura futura, não o comportamento
executado pelo protótipo:

```
Cliente → Interface → Backend → Sistema de Pagamento Externo
                          ← aprovação / recusa / timeout
```

Na versão atual, `PaymentSimulator` produz esses resultados localmente; nenhuma requisição é
enviada ao backend ou a um gateway.

- **Idempotência:** o pedido é criado uma única vez no checkout; a tela de pagamento apenas
  atualiza o mesmo registro. Reabrir a URL não cria um segundo pedido.
- **Consistência:** pontos e cupom só são aplicados em `aprovarPagamento`, nunca na criação.
- **Falha segura:** qualquer desfecho inesperado mantém o pedido em `AGUARDANDO_PAGAMENTO`, que
  é um estado recuperável.
- **Auditoria:** `transacaoId`, `tentativas` e `atualizadoEm` ficam no pedido.

---

### 7. O que mudaria em produção

1. Backend cria o pedido e devolve a chave de idempotência.
2. O front-end recebe o `clientSecret`/QR real do gateway e nunca vê dados sensíveis de cartão.
3. O gateway envia webhook assinado; o backend confirma o pagamento e publica o evento.
4. A fila da cozinha é alimentada por evento, não por polling.
5. Conciliação diária e estorno automático em cancelamento.
6. Tokenização e conformidade PCI-DSS ficam com o gateway.

---

### 8. Roteiro rápido de verificação

1. Monte um pedido e vá ao checkout.
2. Crie o pedido e abra `/pagamento/:codigo`.
3. Clique em **Forçar aprovação** → confirme `RECEBIDO` e pontos creditados.
4. Repita e clique em **Forçar recusa** → confirme `PAGAMENTO_RECUSADO` e nova tentativa.
5. Repita e clique em **Simular timeout** → confirme que o pedido continua em
   `AGUARDANDO_PAGAMENTO`.
6. No cartão, use `4111 1111 1111 0000` → recusa determinística.
7. No painel operacional, avance o pedido aprovado até `RETIRADO`.

---

## Decis?es de projeto

Registro das decisões que sustentam a solução, no formato **contexto → decisão → consequência**.
O objetivo é tornar explícito o raciocínio técnico por trás do que foi entregue, inclusive os
trade-offs assumidos.

---

### ADR-01 — SPA React + TypeScript, sem backend

**Contexto.** O enunciado pede uma entrega front-end com dados mockados, e o prazo não comporta
um backend com autenticação, banco e webhooks. Ao mesmo tempo, o fluxo precisa ser demonstrável
de ponta a ponta e sobreviver a recarregamentos.

**Decisão.** Construir uma SPA em React 18 + TypeScript + Vite, com todo o estado e as regras de
negócio no cliente e persistência em `localStorage`.

**Consequências.**

- O avaliador consegue rodar o projeto com `npm install && npm run dev`, sem banco nem variáveis
  de ambiente.
- O build é estático e publica em qualquer CDN (Vercel, Netlify).
- Não há sincronização entre dispositivos: dois navegadores são dois "mundos".
- As permissões de operação são apenas simuladas; em produção seriam validadas no servidor.

**Alternativas descartadas.** Backend Node/Express (custo alto, sem ganho de avaliação de
interface), Firebase (dependência externa e credenciais), dados apenas em memória (perderia a
demonstração ao recarregar).

---

### ADR-02 — CSS próprio, mobile-first, sem UI kit

**Contexto.** O critério de avaliação valoriza clareza de fluxo e coerência, não estética. Um UI
kit (Material, Bootstrap, Chakra) traria aparência genérica e peso de bundle.

**Decisão.** Escrever CSS próprio com variáveis de tema, `clamp()` para tipografia fluida e
breakpoints em 640, 900 e 1200 px. O mobile define a ordem dos blocos; o desktop apenas
redistribui.

**Consequências.**

- Controle total sobre estados de foco, contraste e alvos de toque.
- Bundle pequeno e sem dependência de manutenção de terceiros.
- Exige disciplina manual de consistência — mitigada por tokens de cor, espaçamento e tipografia
  em `src/styles/global.css`.
- Sem componentes prontos de modal, select ou datepicker: resolvidos com elementos nativos e
  estilos próprios.

**Identidade visual.** Terracota (`#b5451b`) como cor de ação, creme (`#fff8f0`) como superfície
e verde (`#2f5d3a`) como apoio. Referências regionais aparecem no vocabulário do cardápio
(tapioca, cuscuz, carne de sol, queijo coalho) e em ilustrações vetoriais — sem caricatura.

---

### ADR-03 — `localStorage` como persistência simulada

**Contexto.** Precisa haver memória entre recarregamentos, mas não há servidor.

**Decisão.** Persistir um único estado serializável (usuários, sessão, pedidos, carrinho,
consentimento, cupons usados e papel operacional) em chaves prefixadas `raizes:`, com leitura
tolerante a falhas e versão de esquema.

**Consequências.**

- Demonstração contínua e reproduzível; o botão **Restaurar demonstração** (gerente) devolve o
  estado inicial.
- Dados ficam no dispositivo — o que reforça o discurso de LGPD, mas não substitui criptografia
  nem controle de acesso reais.
- Limpar os dados do site zera a demonstração; isso está documentado no README.
- Sem sincronização entre abas: cada aba relê o estado ao carregar, mas não escuta `storage`.

---

### ADR-04 — Canais Web, App e Totem na mesma base de código

**Contexto.** O estudo de caso exige multicanalidade (Web, App e Totem). Duplicar telas
triplicaria o esforço e criaria divergência de regras.

**Decisão.** Um único conjunto de páginas e regras. Web e App são o mesmo layout com uma moldura
de largura controlada, alternada por uma barra de demonstração. O Totem é uma **rota própria**
(`/totem`) com layout de quiosque, sem menu de navegação e com alvos ampliados. Após a confirmação,
a tela permite iniciar um novo atendimento imediatamente e retorna ao início automaticamente após
20 segundos.

**Consequências.**

- Consistência garantida por construção: preço, cupom e pontos são idênticos nos três canais.
- A barra de canais é assumidamente um recurso de demonstração — em produção o canal seria
  detectado por dispositivo/estação.
- O totem não compartilha o cabeçalho nem a barra inferior, o que evita interação acidental
  durante o uso em pé.

**Por que o totem não é um ator.** O totem é um **canal** operado pelo cliente. Nos casos de uso,
o ator continua sendo o Cliente. O sistema de pagamento externo aparece separadamente como ator
conceitual, sem integração real no protótipo.

---

### ADR-05 — Pagamento simulado localmente e determinístico

**Contexto.** O enunciado pede representar uma integração externa e o retorno visual, mas proíbe
implementar pagamento real.

**Decisão.** O sistema de pagamento externo é mantido como ator conceitual nos casos de uso. No
protótipo, um componente `PaymentSimulator` representa localmente seus possíveis retornos, com
latência de 1,2 s a 2,6 s e três desfechos: **aprovado**, **recusado** e **timeout**. A regra é
determinística: cartão terminado em `0000` é recusado; os demais válidos são aprovados. Um painel
de teste permite forçar cada desfecho. Nenhuma requisição é enviada a um provedor.

**Consequências.**

- Testes repetíveis: o mesmo cartão sempre produz o mesmo resultado.
- Nenhum dado de cartão é persistido; o formulário vive só em memória.
- Timeout mantém o pedido em `AGUARDANDO_PAGAMENTO` (estado recuperável), em vez de inventar um
  estado ambíguo.
- Não há cobrança real, chamada a gateway nem webhook; a tela identifica o pagamento como demonstração.

**Integração futura (conceitual).** Em produção, o fluxo seria `Cliente → Interface → Backend →
Sistema de Pagamento Externo`, com retorno de aprovação, recusa ou timeout. No protótipo, esse
papel é representado somente pela simulação local. O pedido nasce **antes** do pagamento para que
o código de retirada exista e a operação enxergue pedidos ainda não pagos.

---

### ADR-06 — Pedido criado antes do pagamento

**Contexto.** Duas abordagens são possíveis: pagar e só então criar o pedido, ou criar e depois
pagar.

**Decisão.** Criar o pedido no checkout com status `AGUARDANDO_PAGAMENTO`, redirecionar para
`/pagamento/:codigo` e evoluir o **mesmo** registro conforme o retorno do simulador local.

**Consequências.**

- Código de retirada disponível desde o início e URL de pagamento recarregável.
- Reabrir a URL não cria pedido duplicado (idempotência por código).
- A operação precisa filtrar pedidos não pagos — resolvido pelos filtros de status no painel.
- Pontos e cupom só são aplicados na aprovação, nunca na criação.

---

### ADR-07 — Máquina de estados explícita para o pedido

**Contexto.** Sem estados claros, o acompanhamento e o painel divergem.

**Decisão.** Estados `AGUARDANDO_PAGAMENTO`, `RECEBIDO`, `EM_PREPARO`, `PRONTO`, `RETIRADO`,
`PAGAMENTO_RECUSADO` e `CANCELADO`, com transições permitidas centralizadas e rótulos em
português na interface (`Rótulos`, `lib/status.ts`).

**Consequências.**

- Cliente e operação leem o mesmo vocabulário.
- Avanço de status é uma função pura testável; a interface só decide se o botão aparece.
- Estados terminais (`RETIRADO`, `CANCELADO`) bloqueiam novas ações.

---

### ADR-08 — Perfis de operação com permissões no cliente

**Contexto.** O enunciado pede atendente, cozinha e gerente. Não há autenticação real de
funcionário.

**Decisão.** Um seletor de perfil em `/operacao` simula o login operacional:

| Perfil | Avançar | Cancelar | Restaurar demo |
| --- | --- | --- | --- |
| Atendente | somente `PRONTO` | somente `AGUARDANDO_PAGAMENTO` | não |
| Cozinha | `RECEBIDO` e `EM_PREPARO` | não | não |
| Gerente | qualquer status ativo | qualquer pedido ativo | sim |

Ações não permitidas aparecem **desabilitadas com explicação**, não ocultas.

**Consequências.**

- Demonstra segregação de funções sem servidor.
- O texto de permissão precisa acompanhar o perfil para não gerar dúvida.
- Em produção, o papel viria do token e a validação seria repetida no backend — ponto declarado
  como limitação.

---

### ADR-09 — Regras de negócio isoladas da interface

**Contexto.** Preço, cupom, pontos e prazos aparecem em várias telas; duplicar a conta gera
divergência de centavos.

**Decisão.** Concentrar limites em `src/config/rules.ts` e cálculos em `src/lib/pricing.ts`
(funções puras: `precoUnitario`, `descontoDoCupom`, `validarCupom`, `limiteDePontos`,
`descontoDePontos`, `arredondar`).

**Consequências.**

- Uma única fonte de verdade para "1 ponto = R$ 0,10" e "50% do subtotal".
- Arredondamento em duas casas evita `0.30000000000000004` na tela.
- As funções podem ser cobertas por testes unitários sem renderizar React.

**Ordem de cálculo.** Subtotal → desconto de cupom → desconto de pontos (limitado a 50% do
subtotal) → total. Cupom e pontos são cumulativos, mas os pontos nunca ultrapassam o teto.

---

### ADR-10 — LGPD como parte do fluxo, não como página isolada

**Contexto.** O critério de avaliação exige avisos e clareza no uso dos dados, além de escolhas
opcionais para analytics e marketing.

**Decisão.** Tratar privacidade em quatro pontos:

1. **Banner de primeiro acesso** com "aceitar todos", "somente essenciais" e preferências por
   finalidade; as opções não essenciais começam desmarcadas.
2. **Aviso de privacidade no checkout e no totem**, com link para a política; criar pedido não
   depende de marcar uma caixa de consentimento.
3. **Registro local** da versão, data e escolhas opcionais junto às preferências do usuário.
4. **Direitos do titular** no perfil: revogar analytics/marketing, exportar JSON e excluir conta
   com confirmação por palavra-chave.

**Consequências.**

- Marketing e analytics começam **desligados** e não condicionam o pedido. Para fins acadêmicos,
  o relatório descreve os dados necessários ao pedido sob a hipótese de execução de contrato; isso
  não é parecer jurídico.
- O pagamento é uma simulação local: não há cobrança real nem envio de dados a um gateway externo.
- Os dados do pedido ficam no navegador; não há API de pedidos ou integração de pagamento.
- A exclusão remove cadastro, pedidos, pontos, cupons e consentimentos do dispositivo.
- O texto da política é um modelo acadêmico e está identificado como tal — não substitui parecer
  jurídico.
- Como não há servidor, "exportar" e "excluir" são completos por definição: não existe cópia
  remota.

---

### ADR-11 — Acessibilidade e desempenho como requisito, não como acabamento

**Contexto.** RNF-03 e RNF-02 precisam ser verificáveis.

**Decisão.** HTML semântico, um `h1` por página, `skip link`, foco visível, `aria-live` em status
e toasts, `aria-invalid` + mensagem por campo, alvos de 44 px (52 px nos campos e 56 px nas ações do totem) e
`prefers-reduced-motion`. Sem imagens rasterizadas: ícones e ilustrações em SVG/CSS.

**Consequências.**

- Navegação por teclado funciona nos fluxos principais.
- Bundle enxuto e primeira renderização rápida.
- Contraste precisa ser conferido a cada mudança de paleta; os pares usados ficam acima de 4,5:1
  para texto normal.

---

### ADR-12 — Documentação como parte da entrega

**Contexto.** O peso de documentação e postura profissional é de 10 pontos, e o PDF precisa seguir
a ABNT.

**Decisão.** Manter documentos de apoio em Markdown no repositório (requisitos, casos de uso,
jornada, pagamento, decisões e plano de testes) e gerar o documento final em DOCX com
`python-docx`, exportado para PDF. Os diagramas são gerados por script Python (biblioteca padrão)
em SVG, com PNG em 2× para impressão; os wireframes são um HTML próprio com frames exportados.

**Consequências.**

- Diagramas versionáveis e reproduzíveis (`python docs/tools/build_diagrams.py`).
- O PDF é derivado de fonte editável, não de captura de tela.
- Exige manter o script e o texto em sincronia quando uma regra muda.

---

### Resumo dos trade-offs

| Decisão | Ganho | Custo assumido |
| --- | --- | --- |
| SPA sem backend | entrega simples e publicável | sem multiusuário real |
| CSS próprio | controle e leveza | consistência manual |
| `localStorage` | demonstração persistente | dados por dispositivo |
| Canais na mesma base | consistência | barra de canais é artificial |
| Pagamento simulado | testes repetíveis | sem PCI/webhook reais |
| Permissões no cliente | segregação demonstrável | não é segurança real |
| LGPD local | história completa | sem auditoria em servidor |

---

## Plano de testes

Roteiro para validar a interface da **Rede Raízes do Nordeste**: fluxos principais, regras de
negócio, mensagens de erro, responsividade e privacidade. Os 22 cenários foram executados na
interface local; os resultados e as evidências resumidas estão registrados neste documento.

---

### 1. Objetivo e escopo

**Objetivo.** Verificar se o cliente conclui o pedido sem instrução prévia, se a operação move a
comanda corretamente conforme o perfil e se os direitos de LGPD são exercíveis na interface.

**No escopo**

- cadastro, autenticação e sessão;
- cardápio por unidade, adicionais e carrinho;
- checkout, cupom, pontos e preferências opcionais de privacidade;
- pagamento simulado (aprovação, recusa e timeout);
- acompanhamento, histórico e fidelidade;
- painel operacional com três perfis;
- totem;
- responsividade e acessibilidade básica.

**Fora do escopo**

- carga e estresse (não há backend);
- testes de penetração e PCI-DSS;
- compatibilidade com navegadores antigos;
- testes automatizados (registrados como próximo passo).

---

### 2. Estratégia

| Nível | Como é feito | Evidência |
| --- | --- | --- |
| **Funcional** | execução de cenários positivos e negativos na interface | 22 cenários executados; resultados na seção 4 |
| **Regras de negócio** | casos de borda de cupom, pontos e quantidade | mensagens e valores conferidos em T-04, T-05, T-08 e T-09 |
| **Usabilidade** | inspeção heurística com dez pontos de atenção | registrar achados e correções após a inspeção |
| **Responsividade** | rotas principais e totem em 320×720, 390×844, 768×1024 e 1440×900 | sem rolagem horizontal nas rotas verificadas (T-22) |
| **Acessibilidade** | percurso de checkout por teclado e foco visível | pedido concluído com Tab/Enter; foco visível (T-22); sem auditoria automatizada |
| **Privacidade** | preferências opcionais, revogação, exportação e exclusão | preferências e exportação/exclusão verificadas (T-17 e T-18) |

**Ambiente de execução.** Windows; navegador integrado ao VS Code (Chromium 150.0.7871.250,
Electron 43.8.3); Node.js v24.22.0; aplicação servida localmente pelo Vite em
`http://127.0.0.1:5173`. Os cenários foram executados na interface com automação Playwright. Os
dados locais foram limpos ou restaurados entre os blocos; nos casos que exigiam estado acumulado,
como cupom reutilizado e pontos, a sequência foi mantida.

**Critério de aceite.** Marque um cenário como aprovado somente depois de executá-lo e comparar o
resultado observado com o esperado, inclusive valores, status e mensagens. Registre divergências
com evidências. As evidências abaixo se referem à execução da interface local, não a testes com
usuários nem a uma auditoria automatizada.

**Severidade.** S1 bloqueia o pedido; S2 quebra uma regra de negócio; S3 é cosmético ou de texto.

---

### 3. Cenários de teste

#### T-01 — Cadastro e autenticação

| Campo | Descrição |
| --- | --- |
| **Objetivo** | garantir que o cliente cria conta, entra e que credenciais inválidas são recusadas |
| **Pré-condições** | sessão encerrada; dados de demonstração restaurados |
| **Passos** | 1. abrir `/entrar`; 2. informar e-mail e senha incorretos; 3. tentar entrar; 4. abrir `/cadastro`; 5. preencher nome, e-mail, telefone, senha e confirmação; 6. marcar o aceite; 7. concluir |
| **Dados de entrada** | inválido: `cliente@raizes.com` / `senhaerrada` · válido: `Ana Souza`, `ana.teste@raizes.com`, `(81) 98888-7777`, senha `raizes123`, confirmação `raizes123` |
| **Resultado esperado** | passo 3 bloqueado com mensagem; passo 7 conta criada, sessão iniciada e redirecionamento para `/` com toast de boas-vindas |
| **Mensagens** | `E-mail ou senha incorretos. Confira os dados e tente novamente.` · `Conta criada com sucesso. Bom te ver por aqui!` |
| **Requisitos** | RF-14 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado |

**Variações negativas:** senha com menos de 8 caracteres → `A senha deve ter pelo menos 8
caracteres.`; confirmação diferente → `As senhas não conferem.`; e-mail já existente → `Este
e-mail já está cadastrado.`; aceite desmarcado → `É necessário aceitar os termos e a política de
privacidade.`

---

#### T-02 — Unidade fechada bloqueia o pedido

| Campo | Descrição |
| --- | --- |
| **Objetivo** | impedir pedido em unidade fechada e explicar o motivo |
| **Pré-condições** | perfil cliente; nenhum item no carrinho |
| **Passos** | 1. abrir `/unidades`; 2. selecionar **Natal — Ponta Negra** (fechada); 3. abrir `/cardapio`; 4. tentar adicionar um item |
| **Dados de entrada** | unidade `u-natal`, produto `tap-carne` |
| **Resultado esperado** | unidade marcada como **Fechada**; o cardápio continua consultável; a ação de adicionar é bloqueada com aviso e o item não entra no carrinho |
| **Mensagens** | `Esta unidade está fechada. Escolha outra unidade para pedir.` |
| **Requisitos** | RF-01, RN-10 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado |

---

#### T-03 — Cardápio filtrado por unidade e item indisponível

| Campo | Descrição |
| --- | --- |
| **Objetivo** | confirmar que o catálogo respeita a unidade e que indisponibilidade é visível |
| **Pré-condições** | unidade **Fortaleza — Meireles** selecionada |
| **Passos** | 1. abrir `/cardapio`; 2. buscar `tapioca` e conferir os resultados; 3. filtrar por **Bebidas** e conferir a combinação dos filtros; 4. limpar a busca e a categoria; 5. localizar **Empada de Frango**, indisponível em Fortaleza; 6. abrir o produto e tentar adicioná-lo |
| **Dados de entrada** | unidade `u-fortaleza`; termo `tapioca`; categoria `cat-bebidas`; produto `sal-empada` |
| **Resultado esperado** | a busca retorna produtos cujo nome ou descrição contém `tapioca`; combinada com **Bebidas**, a lista fica vazia e o contador indica 0; após limpar os filtros, **Empada de Frango** continua visível com indicação de indisponibilidade e a ação de adicionar desabilitada |
| **Mensagens** | a página do produto informa `Este item não está disponível em Raízes — Meireles.`; a ação de adicionar fica desabilitada |
| **Requisitos** | RF-02, RF-03, RN-11 |
| **Severidade** | S2 |
| **Situação** | Executado — aprovado |

---

#### T-04 — Adicionais, observação e preço do botão

| Campo | Descrição |
| --- | --- |
| **Objetivo** | validar limite de adicionais por produto e atualização do preço |
| **Pré-condições** | unidade Recife; produto `tap-carne` (R$ 18,90; máx. 2 adicionais) |
| **Passos** | 1. abrir `/produto/tap-carne`; 2. marcar **Queijo coalho extra** (R$ 3,00); 3. marcar **Carne de sol extra** (R$ 6,00); 4. tentar marcar um terceiro adicional; 5. digitar observação `sem cebola`; 6. adicionar ao carrinho |
| **Dados de entrada** | adicionais `queijo-extra`, `carne-extra`, `pimenta`; observação `sem cebola`; quantidade 1 |
| **Resultado esperado** | botão exibe **Adicionar · R$ 27,90**; o terceiro adicional é bloqueado com aviso; o item entra no carrinho com os dois adicionais e a observação |
| **Mensagens** | `Escolha no máximo 2 adicionais.` · `Item adicionado ao carrinho.` |
| **Requisitos** | RF-04, RN-07 |
| **Severidade** | S2 |
| **Situação** | Executado — aprovado |

---

#### T-05 — Carrinho: agrupamento, quantidade e remoção

| Campo | Descrição |
| --- | --- |
| **Objetivo** | validar soma de itens idênticos, limite de 20 unidades e recálculo |
| **Pré-condições** | carrinho com 1 tapioca com queijo (R$ 21,90) |
| **Passos** | 1. adicionar a mesma configuração novamente; 2. adicionar a mesma tapioca **sem** queijo; 3. abrir `/carrinho`; 4. aumentar a quantidade até o limite; 5. remover um item |
| **Dados de entrada** | duas configurações distintas; tentativa de quantidade 25 |
| **Resultado esperado** | itens idênticos somam quantidade; configurações diferentes ficam em linhas separadas; quantidade máxima 20; subtotal e total recalculados; item removido com toast |
| **Mensagens** | `Item removido do carrinho.` |
| **Requisitos** | RF-05, RN-07 |
| **Severidade** | S2 |
| **Situação** | Executado — aprovado |

**Conferência de valores:** a configuração com queijo foi agrupada em 2 unidades: 2 × R$ 21,90 +
1 × R$ 18,90 = **R$ 62,70**.

---

#### T-06 — Checkout: validação por campo

| Campo | Descrição |
| --- | --- |
| **Objetivo** | impedir pedido com dados inválidos e indicar o campo |
| **Pré-condições** | carrinho com pelo menos 1 item; unidade Recife |
| **Passos** | 1. abrir `/checkout`; 2. deixar nome vazio; 3. telefone com 8 dígitos; 4. e-mail `ana@`; 5. enviar |
| **Dados de entrada** | nome ``, telefone `9999-0000`, e-mail `ana@`, horário não escolhido |
| **Resultado esperado** | envio bloqueado; resumo de erros no topo; cada campo inválido indicado com `aria-invalid` e mensagem própria |
| **Mensagens** | `Informe seu nome completo.` · `Informe um telefone com DDD (10 ou 11 dígitos).` · `Informe um e-mail válido para o comprovante.` · `Escolha um horário de retirada.` · `Revise os campos destacados para continuar.` |
| **Requisitos** | RF-06 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado |

**Observação:** o e-mail é opcional para retirada, mas quando preenchido precisa ser válido.

---

#### T-07 — Pedido com preferências opcionais desativadas

| Campo | Descrição |
| --- | --- |
| **Objetivo** | garantir que a criação do pedido não depende das escolhas opcionais de analytics e marketing |
| **Pré-condições** | primeira visita, carrinho com item disponível e dados de checkout válidos |
| **Passos** | 1. no banner, escolher **Somente essenciais**; 2. preencher nome, telefone, e-mail e horário; 3. conferir o aviso e o link de privacidade; 4. clicar em **Confirmar e pagar** |
| **Dados de entrada** | `Maria Lima`, `(81) 99999-0000`, horário `19:30`, unidade `u-recife` |
| **Resultado esperado** | sem checkbox obrigatório; pedido criado e tela de simulação aberta; analytics e marketing permanecem desativados |
| **Mensagens** | aviso de armazenamento local e ausência de gateway real; nenhuma mensagem de consentimento obrigatório |
| **Requisitos** | RF-07, RN-13, RNF-06, RNF-07 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado após alteração do fluxo |

---

#### T-08 — Cupom: aplicação válida e quatro erros distintos

| Campo | Descrição |
| --- | --- |
| **Objetivo** | validar aplicação e mensagens específicas por motivo de recusa |
| **Pré-condições** | abrir a aplicação em um navegador com dados locais limpos, sem `RAIZES10` previamente utilizado; conseguir montar um carrinho de R$ 36,70 e outro de R$ 20,00 |
| **Passos** | 1. Com subtotal de R$ 36,70, aplicar `RAIZES10` e conferir o desconto e o total; 2. remover o cupom e aplicar `NAOEXISTE`; 3. aplicar `EXPIRADO2024`; 4. retirar itens até o subtotal ficar abaixo de R$ 30,00 (por exemplo, R$ 20,00) e aplicar `RAIZES10`; 5. voltar ao subtotal de R$ 36,70, aplicar `RAIZES10` e concluir o pedido com pagamento aprovado; 6. montar outro pedido de R$ 36,70 e aplicar novamente `RAIZES10` |
| **Dados de entrada** | `RAIZES10` (10%, mínimo R$ 30,00); `NAOEXISTE` (inexistente); `EXPIRADO2024` (validade encerrada em 2024); subtotal de R$ 36,70 para aplicação válida e reutilização; subtotal de R$ 20,00 para testar o mínimo |
| **Resultado esperado** | no subtotal de R$ 36,70, `RAIZES10` aplica desconto de R$ 3,67 e o total fica R$ 33,03; `NAOEXISTE` é recusado; `EXPIRADO2024` é recusado; com subtotal de R$ 20,00, `RAIZES10` é recusado; após um pedido com pagamento aprovado usando `RAIZES10`, uma nova tentativa é recusada como cupom já utilizado. As tentativas inválidas não aplicam desconto nem apagam o código digitado |
| **Mensagens** | `Cupom não encontrado. Confira o código digitado.` · `Este cupom está expirado.` · `Este cupom exige um valor mínimo de R$ 30,00.` · `Este cupom já foi utilizado.` |
| **Requisitos** | RF-08, RN-04, RN-05 |
| **Severidade** | S2 |
| **Situação** | Executado — aprovado |

**Conferência de valores:** R$ 36,70 − R$ 3,67 (10%) = **R$ 33,03**. Em R$ 20,00, o cupom é recusado por não atingir o mínimo; não há desconto nesse caso.

---

#### T-09 — Pontos: teto de 50% do subtotal

| Campo | Descrição |
| --- | --- |
| **Objetivo** | impedir resgate acima do limite e conferir o desconto |
| **Pré-condições** | login com `cliente@raizes.com` (120 pontos); subtotal R$ 36,70 |
| **Passos** | 1. montar um carrinho de R$ 14,90; 2. entrar na conta demo; 3. abrir `/checkout`; 4. ativar o uso de pontos e informar 120; 5. conferir o valor ajustado pelo campo e o desconto no resumo |
| **Dados de entrada** | saldo 120 pontos; subtotal R$ 14,90 |
| **Resultado esperado** | o campo limita o uso a **74 pontos** (R$ 7,40), que não ultrapassam 50% do subtotal; o resumo atualiza o desconto para R$ 7,40 e o total para R$ 7,50 |
| **Mensagens** | não aplicável; o valor é limitado pelo campo ao máximo permitido |
| **Requisitos** | RF-09, RN-01, RN-03 |
| **Severidade** | S2 |
| **Situação** | Executado — aprovado |

**Conferência:** para subtotal de R$ 14,90, metade é R$ 7,45. Como cada ponto vale R$ 0,10,
o limite inteiro é 74 pontos (R$ 7,40), mesmo com saldo de 120 pontos.

---

#### T-10 — Pagamento Pix aprovado

| Campo | Descrição |
| --- | --- |
| **Objetivo** | concluir o pagamento e liberar o pedido para a cozinha |
| **Pré-condições** | pedido criado com status `AGUARDANDO_PAGAMENTO` |
| **Passos** | 1. abrir `/pagamento/:codigo`; 2. selecionar **Pix**; 3. copiar o código; 4. clicar em **Já fiz o pagamento**; 5. aguardar o retorno |
| **Dados de entrada** | pedido de R$ 33,03; método Pix |
| **Resultado esperado** | estado **processando** com formulário desabilitado; retorno **Pagamento aprovado**; pedido passa a `RECEBIDO`; pontos creditados; ações **Acompanhar pedido** e **Meus pedidos** |
| **Mensagens** | `Código Pix copiado.` · `Pagamento aprovado` · `Você ganhou 33 pontos neste pedido.` |
| **Requisitos** | RF-10, RN-02, RN-08 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado |

---

#### T-11 — Cartão recusado (final 0000)

| Campo | Descrição |
| --- | --- |
| **Objetivo** | representar recusa simulada com retorno visual e nova tentativa |
| **Pré-condições** | pedido em `AGUARDANDO_PAGAMENTO` |
| **Passos** | 1. selecionar **Cartão**; 2. informar número `4111 1111 1111 0000`; 3. nome `MARIA LIMA`; 4. validade `12/30`; 5. CVV `123`; 6. pagar; 7. clicar em **Tentar novamente** |
| **Dados de entrada** | cartão final `0000`, valor R$ 33,03 |
| **Resultado esperado** | retorno **Pagamento recusado** com motivo e contador de tentativas; pedido em `PAGAMENTO_RECUSADO`; nenhum ponto creditado; botão reinicia o pagamento |
| **Mensagens** | `Pagamento recusado` · `Tentativas realizadas: 1.` · `Pagamento reiniciado. Você pode tentar novamente.` |
| **Requisitos** | RF-10, RNF-11 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado |

**Validações do formulário:** número com 12 dígitos → `Informe um número de cartão com pelo menos
13 dígitos.`; nome `AB` → `Informe o nome impresso no cartão.`; validade `13/30` → `A validade deve
estar no formato MM/AA.`; CVV `12` → `Informe um CVV com 3 ou 4 dígitos.`

---

#### T-12 — Timeout da simulação local

| Campo | Descrição |
| --- | --- |
| **Objetivo** | verificar que a ausência de resposta não deixa o pedido ambíguo |
| **Pré-condições** | pedido em `AGUARDANDO_PAGAMENTO` |
| **Passos** | 1. abrir o pagamento; 2. clicar em **Simular timeout**; 3. observar o pedido em `/pedidos`; 4. clicar em **Tentar novamente** |
| **Dados de entrada** | botão de teste **Simular timeout** (1,2 s) |
| **Resultado esperado** | tela **Pagamento não confirmado**; pedido permanece `AGUARDANDO_PAGAMENTO` com pagamento `EXPIRADO`; nenhum valor cobrado; nova tentativa liberada |
| **Mensagens** | `Pagamento não confirmado` · `A simulação ainda não confirmou este pagamento. Tente novamente em instantes.` |
| **Requisitos** | RF-10, RN-08, RNF-11 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado |

---

#### T-13 — Acompanhamento do pedido

| Campo | Descrição |
| --- | --- |
| **Objetivo** | confirmar que o cliente enxerga o mesmo status da operação |
| **Pré-condições** | pedido aprovado (`RECEBIDO`) |
| **Passos** | 1. abrir `/pedido/:codigo`; 2. no painel, mover para `EM_PREPARO`; 3. voltar ao acompanhamento e recarregar a página; 4. mover para `PRONTO`; 5. confirmar retirada no painel |
| **Dados de entrada** | código do pedido; perfil gerente no painel |
| **Resultado esperado** | linha do tempo marca etapas concluídas; status atual em destaque; em `PRONTO` o texto orienta a retirada; em `RETIRADO` a ação primária vira novo pedido |
| **Mensagens** | `Seu pedido está pronto! Apresente o código RZ-#### no balcão.` |
| **Requisitos** | RF-11 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado |

---

#### T-14 — Histórico de pedidos

| Campo | Descrição |
| --- | --- |
| **Objetivo** | reabrir pedidos anteriores e conferir estados |
| **Pré-condições** | login com pedidos no histórico (incluindo um cancelado e um recusado) |
| **Passos** | 1. abrir `/pedidos`; 2. conferir a ordem por data; 3. abrir um pedido `RETIRADO`; 4. abrir o cancelado |
| **Dados de entrada** | conta `cliente@raizes.com` |
| **Resultado esperado** | lista ordenada do mais recente para o mais antigo; pedido cancelado exibe seus detalhes e o aviso de cancelamento, sem linha do tempo nem ação para avançar status |
| **Mensagens** | `Você ainda não fez pedidos.` quando a lista está vazia |
| **Requisitos** | RF-12 |
| **Severidade** | S2 |
| **Situação** | Executado — aprovado |

---

#### T-15 — Fidelidade: resgate e saldo insuficiente

| Campo | Descrição |
| --- | --- |
| **Objetivo** | validar conversão, resgate e geração de cupom |
| **Pré-condições** | login com 120 pontos |
| **Passos** | 1. abrir `/fidelidade`; 2. resgatar **R$ 10 de desconto** (100 pts); 3. conferir o saldo; 4. tentar resgatar recompensa de 150 pts |
| **Dados de entrada** | saldo 120; recompensas 50, 100, 150 e 250 pts |
| **Resultado esperado** | saldo 120 → **20 pontos**; cupom gerado e listado; extrato registra o resgate; recompensa acima do saldo desabilitada com quanto falta |
| **Mensagens** | `Recompensa resgatada! Cupom RESG-XXXX liberado.` · `Pontos insuficientes para esta recompensa.` |
| **Requisitos** | RF-13, RN-01 |
| **Severidade** | S2 |
| **Situação** | Executado — aprovado |

---

#### T-16 — Perfil: edição e validação

| Campo | Descrição |
| --- | --- |
| **Objetivo** | validar atualização de nome e telefone |
| **Pré-condições** | sessão ativa |
| **Passos** | 1. abrir `/perfil`; 2. limpar o nome e salvar; 3. telefone com 9 dígitos e salvar; 4. corrigir e salvar |
| **Dados de entrada** | nome `A`, telefone `98888-777`, depois `Ana Souza` / `(81) 98888-7777` |
| **Resultado esperado** | alterações inválidas bloqueadas; alteração válida persistida e refletida no cabeçalho |
| **Mensagens** | `Informe seu nome completo.` · `Informe um telefone com DDD.` · `Dados atualizados.` |
| **Requisitos** | RF-15 |
| **Severidade** | S3 |
| **Situação** | Executado — aprovado |

---

#### T-17 — Consentimento: banner e preferências

| Campo | Descrição |
| --- | --- |
| **Objetivo** | verificar granularidade e padrão conservador |
| **Pré-condições** | dados do site limpos (primeiro acesso) |
| **Passos** | 1. abrir `/`; 2. observar o banner; 3. abrir **Preferências**; 4. conferir o estado de analytics e marketing; 5. escolher **Somente essenciais**; 6. recarregar |
| **Dados de entrada** | nenhum |
| **Resultado esperado** | banner bloqueia a decisão até a escolha; necessários sempre ativos; analytics e marketing **desligados** por padrão; escolha persistida e banner não reaparece; versão `2026-1` visível |
| **Mensagens** | `Preferências de privacidade` · `Somente essenciais` |
| **Requisitos** | RF-16, RNF-07, RN-14 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado |

---

#### T-18 — LGPD: exportar e excluir dados

| Campo | Descrição |
| --- | --- |
| **Objetivo** | comprovar que os direitos do titular são exercíveis na interface |
| **Pré-condições** | login com pedidos e pontos |
| **Passos** | 1. abrir `/perfil`; 2. clicar em **Baixar meus dados (JSON)**; 3. validar o JSON; 4. clicar em **Excluir minha conta**; 5. digitar palavra incorreta; 6. digitar `EXCLUIR` e confirmar |
| **Dados de entrada** | confirmação `apagar` (inválida) e `EXCLUIR` (válida) |
| **Resultado esperado** | JSON contém usuário, preferências de privacidade, pedidos e pontos; botão de exclusão fica desabilitado com palavra errada; com `EXCLUIR`, dados associados são removidos e a sessão encerra |
| **Mensagens** | `Arquivo com seus dados foi gerado.` · botão permanece desabilitado até `EXCLUIR` |
| **Requisitos** | RF-17, RF-18, RN-15 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado |

---

#### T-19 — Operação: permissões de atendente e cozinha

| Campo | Descrição |
| --- | --- |
| **Objetivo** | garantir segregação de funções no painel |
| **Pré-condições** | pelo menos um pedido pago e um aguardando pagamento |
| **Passos** | 1. abrir `/operacao`; 2. observar as ações de atendente em pedido recebido e aguardando; 3. selecionar **Cozinha**; 4. avançar o pedido recebido por `EM_PREPARO` até `PRONTO`; 5. conferir as ações permitidas e bloqueadas |
| **Dados de entrada** | perfis `atendente` e `cozinha` |
| **Resultado esperado** | atendente avança apenas `PRONTO` e cancela apenas `AGUARDANDO_PAGAMENTO`; cozinha avança `RECEBIDO` e `EM_PREPARO` e não cancela; ações bloqueadas aparecem desabilitadas com explicação textual |
| **Mensagens** | `Você está como Atendente.` · `Você está como Cozinha.` · `Ação disponível apenas para o perfil cozinha.` |
| **Requisitos** | RF-23, RF-24, RF-26 |
| **Severidade** | S2 |
| **Situação** | Executado — aprovado |

---

#### T-20 — Operação: gerente, cancelamento e restauração

| Campo | Descrição |
| --- | --- |
| **Objetivo** | validar poder total do gerente e recuperação da demonstração |
| **Pré-condições** | perfil **Gerente** |
| **Passos** | 1. avançar um pedido `RECEBIDO` → `EM_PREPARO` → `PRONTO` → `RETIRADO`; 2. cancelar outro pedido pago e ainda não retirado; 3. conferir a devolução dos pontos; 4. clicar em **Restaurar dados de demonstração** |
| **Dados de entrada** | fila de demonstração |
| **Resultado esperado** | todas as transições permitidas; cancelamento devolve pontos usados e remove os ganhos; restauração devolve o estado inicial com a fila de exemplo |
| **Mensagens** | `Pedido RZ-#### cancelado.` · `Dados de demonstração restaurados.` |
| **Requisitos** | RF-25, RN-09 |
| **Severidade** | S2 |
| **Situação** | Executado — aprovado |

---

#### T-21 — Totem: fluxo completo sem gate de consentimento

| Campo | Descrição |
| --- | --- |
| **Objetivo** | validar o canal de quiosque sem menu e com alvos ampliados |
| **Pré-condições** | abrir `/totem` em 390×844 |
| **Passos** | 1. informar primeiro nome; 2. continuar sem marcar caixa de consentimento; 3. conferir o aviso e o link de privacidade; 4. escolher itens; 5. pagar com Pix em **Já fiz o pagamento**; 6. confirmar que o código aparece; 7. aguardar 20 s; 8. repetir o fluxo e testar **Novo atendimento** antes do prazo |
| **Dados de entrada** | nome `João`; 2 itens; Pix |
| **Resultado esperado** | nome válido permite avançar sem checkbox; sem menu de navegação; campos de 52 px e ações de 56 px; confirmação exibe código; após 20 s, o totem volta ao início e limpa os dados do atendimento; **Novo atendimento** faz o mesmo imediatamente |
| **Mensagens** | aviso de armazenamento local e simulação sem cobrança real · `Digite seu primeiro nome para começarmos.` |
| **Requisitos** | RF-27, RF-28, RF-29 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado após alteração do fluxo |

---

#### T-22 — Canais e responsividade

| Campo | Descrição |
| --- | --- |
| **Objetivo** | garantir layout íntegro nos canais e nas larguras de referência |
| **Pré-condições** | build de produção |
| **Passos** | 1. medir `/`, `/cardapio`, `/checkout`, `/pedido/:codigo` e `/operacao` em 320×720, 390×844, 768×1024 e 1440×900; 2. alternar **Web / App / Totem**; 3. navegar por teclado até concluir um pedido |
| **Dados de entrada** | larguras citadas; percurso por `Tab`/`Enter` |
| **Resultado esperado** | nenhuma rolagem horizontal (`documentElement.scrollWidth <= window.innerWidth`); troca de canal preserva carrinho; foco visível; pedido concluído com teclado |
| **Mensagens** | não aplicável |
| **Requisitos** | RF-30, RNF-01, RNF-03 |
| **Severidade** | S1 |
| **Situação** | Executado — aprovado |

---

### 4. Resultados da execução

| ID | Resultado observado |
| --- | --- |
| T-01 | Aprovado: login inválido recusado; cadastro válido criou a sessão e exibiu boas-vindas. |
| T-02 | Aprovado: Natal fechada exibiu aviso e bloqueou a adição ao carrinho. |
| T-03 | Aprovado: busca retornou 4 itens; busca + Bebidas retornou 0; Empada de Frango ficou indisponível e sem ação de adicionar. |
| T-04 | Aprovado: dois adicionais aceitos, terceiro bloqueado; R$ 27,90 e observação no carrinho. |
| T-05 | Aprovado: configurações iguais agrupadas, distintas separadas, limite 20 e remoção; subtotal conferido em R$ 62,70. |
| T-06 | Aprovado: nome, telefone e e-mail inválidos bloquearam o envio e mostraram mensagens por campo. |
| T-07 | Aprovado: com **Somente essenciais**, o pedido foi criado sem checkbox obrigatório; analytics e marketing permaneceram desativados e o pedido não registrou consentimento artificial. |
| T-08 | Aprovado: RAIZES10 deu R$ 3,67 de desconto e total R$ 33,03; inexistente, expirado, mínimo e reutilização foram recusados. |
| T-09 | Aprovado: 120 pontos foram limitados a 74; desconto R$ 7,40 e total R$ 7,50. |
| T-10 | Aprovado: código Pix copiado; pagamento processou e aprovou; pedido ficou RECEBIDO e saldo aumentou em 33 pontos. |
| T-11 | Aprovado: cartão final 0000 foi recusado, tentativa 1 registrada e nova tentativa reabriu o formulário. |
| T-12 | Aprovado: timeout exibiu pagamento não confirmado; pagamento EXPIRADO e pedido AGUARDANDO_PAGAMENTO. |
| T-13 | Aprovado: painel avançou o pedido até PRONTO; acompanhamento mostrou aviso de retirada e código. |
| T-14 | Aprovado: histórico exibiu pedidos retirado, recusado e cancelado; detalhes do cancelado não mostraram linha do tempo nem avanço. |
| T-15 | Aprovado: saldo 120 → 20 após resgate de 100; cupom RESG-XXXX gerado e recompensa de 150 bloqueada. |
| T-16 | Aprovado: nome e telefone inválidos foram bloqueados; dados válidos persistiram após recarga. |
| T-17 | Aprovado: essenciais permaneceram ativos; analytics e marketing ficaram desligados após salvar e recarregar. |
| T-18 | Aprovado: JSON válido incluiu usuário, preferências de privacidade e 3 pedidos; exclusão exigiu EXCLUIR, removeu os dados associados e encerrou a sessão. |
| T-19 | Aprovado: atendente e cozinha tiveram ações conforme permissões; ações não permitidas ficaram desabilitadas. |
| T-20 | Aprovado: gerente avançou pedido até RETIRADO; cancelamento devolveu pontos (16 → 24) e a restauração voltou a 120 pontos e fila vazia. |
| T-21 | Aprovado: nome avançou sem checkbox; Pix foi aprovado com 2 itens e exibiu o código; **Novo atendimento** reiniciou imediatamente e outro atendimento retornou ao início automaticamente após 20 s. |
| T-22 | Aprovado: seis rotas verificadas nas quatro larguras sem rolagem horizontal; Web/App/Totem preservaram carrinho e Tab/Enter concluíram pedido com foco visível. |

**Resumo:** 22 cenários executados e aprovados. A verificação foi feita na interface local; não
representa teste com usuários, auditoria automatizada de acessibilidade ou compatibilidade com
navegadores diferentes do ambiente registrado.

---

### 5. Matriz de cobertura

| Requisito | Cenários |
| --- | --- |
| RF-01, RN-10 | T-02 |
| RF-02, RF-03, RN-11 | T-03 |
| RF-04, RN-07 | T-04, T-05 |
| RF-05 | T-05 |
| RF-06 | T-06 |
| RF-07, RN-13 | T-07 |
| RF-08, RN-04, RN-05 | T-08 |
| RF-09, RN-01, RN-03 | T-09 |
| RF-10, RN-02, RN-08 | T-10, T-11, T-12 |
| RF-11 | T-13 |
| RF-12 | T-14 |
| RF-13 | T-15 |
| RF-14 | T-01 |
| RF-15 | T-16 |
| RF-16, RN-14 | T-17 |
| RF-17, RF-18, RN-15 | T-18 |
| RF-23, RF-24, RF-26 | T-19 |
| RF-25, RN-09 | T-20 |
| RF-27 a RF-29 | T-21 |
| RF-30, RNF-01, RNF-03 | T-22 |

**Cobertura:** 22 cenários, sendo 9 com foco negativo (T-01, T-02, T-04, T-06, T-07, T-08, T-11,
T-12, T-15). Todos os requisitos funcionais possuem pelo menos um cenário associado.

---

### 6. Avaliação heurística

A inspeção foi realizada em 29/10/2026 na aplicação publicada, nos viewports de 390 × 844 px
(mobile) e 1440 × 900 px (desktop). Foram percorridos início, seleção de unidade, cardápio,
detalhe do produto, carrinho, checkout com erros de validação e pagamento aprovado/reaberto.
Esta é uma avaliação heurística individual; não substitui teste com usuários.

#### 6.1 Pontos a verificar

| # | Heurística | Verificação | Situação |
| --- | --- | --- | --- |
| H-01 | Visibilidade do estado do sistema | Toasts cobrem ações importantes no mobile? | Corrigido e retestado: toasts anteriores são dispensados ao validar; resumo inline permanece visível |
| H-02 | Reconhecimento em vez de memorização | A unidade selecionada fica visível nas telas de pedido? | Verificado: unidade aparece no cardápio, carrinho e checkout |
| H-03 | Consistência e padrão | Os termos "pedido" e "comanda" são usados com sentido consistente? | Verificado com ressalva: "comanda" aparece na confirmação de pagamento |
| H-04 | Prevenção de erros | A tela bloqueia nova cobrança de um pedido já processado? | Verificado: reabrir pagamento aprovado mostra "Pagamento já processado" |
| H-05 | Controle e liberdade do usuário | Há uma nova tentativa após recusa ou timeout? | Verificado nos cenários T-11 e T-12 |
| H-06 | Ajuda e documentação | O limite de uso dos pontos está explicado no checkout? | Verificado: limite de 50% e necessidade de login são informados |
| H-07 | Correspondência com o mundo real | O aviso de pagamento simulado é claro para o cliente? | Verificado com ressalva: simulação clara; controles de teste ficam visíveis |
| H-08 | Estética e minimalismo | A barra de canais compete com a navegação principal? | Verificado: canais no topo e navegação principal separada |
| H-09 | Acessibilidade | O foco do teclado é visível nos elementos interativos? | Verificado: Tab exibe contorno de foco de 2 px; também registrado em T-22 |
| H-10 | Mensagens de erro | Os erros aparecem perto do campo que precisa de correção? | Verificado: resumo geral e mensagens junto aos campos inválidos |

#### 6.2 Registro dos achados

- **H-01 — checkout mobile, 390 × 844 px:** a inspeção inicial identificou que o toast de validação
  e um toast anterior de item adicionado podiam cobrir parcialmente os campos junto à navegação
  inferior. A correção remove os toasts ativos quando o envio é bloqueado e mantém o resumo geral
  e as mensagens específicas no próprio formulário. No reteste, após adicionar um item e enviar o
  checkout vazio, não havia toast visível; o resumo de erros e os campos permaneceram legíveis, sem
  sobreposição com a navegação fixa. **Situação: corrigido e retestado; sem sobreposição observada
  neste fluxo e viewport.**
- **H-02 — cardápio e carrinho:** depois de selecionar Recife, o cardápio informa "Exibindo o
  cardápio de Raízes — Boa Viagem" e o carrinho/checkout repetem a unidade. Não foi necessário
  memorizar a seleção.
- **H-03 — pagamento aprovado:** a interface usa "pedido" como termo principal. A confirmação diz
  que a cozinha recebeu a "comanda"; o contexto permite entender o significado, mas vale considerar
  trocar por "pedido" ou explicar "comanda" para manter a linguagem uniforme.
- **H-04 — prevenção de nova cobrança:** após aprovar um pedido de demonstração e recarregar a
  mesma rota de pagamento, a tela exibiu "Pagamento já processado" e ofereceu apenas acompanhar o
  pedido. Não reapresentou o formulário de cobrança.
- **H-05 e H-06:** os fluxos de nova tentativa após recusa/timeout estão registrados como aprovados
  em T-11 e T-12. No checkout, o resgate de pontos depende de login e o limite de 50% do subtotal é
  informado; T-09 registra o limite calculado de 74 pontos para subtotal de R$ 14,90.
- **H-07 — pagamento:** checkout e simulador informam que nenhum valor real é cobrado. Os botões
  "Forçar aprovação", "Forçar recusa" e "Simular timeout" também ficam visíveis; são úteis para a
  demonstração acadêmica, mas devem continuar claramente identificados como controles de teste.
- **H-08 a H-10:** no mobile e desktop, o seletor de canal no topo não compete visualmente com a
  navegação principal. O primeiro Tab mostra o link para pular ao conteúdo com contorno de 2 px.
  No checkout, o resumo de validação é acompanhado por mensagens próximas dos campos inválidos.

#### 6.3 Teste exploratório com usuários

| Item | Definição |
| --- | --- |
| Data | 29/10/2026 |
| Aplicação | versão publicada na Vercel |
| Participantes | 6 colegas de trabalho |
| Tarefas exploradas | montar pedido; aplicar cupom; trocar de unidade; testar cupom inválido; consultar privacidade; acompanhar pedido |
| Resultado relatado | nenhum participante identificou bug, erro ou mau funcionamento |
| Métricas | tempo, conclusão sem ajuda e satisfação não foram medidos formalmente |
| Limitação | não foram registrados perfil demográfico, desempenho individual ou evidências de cada tarefa |

O resultado é uma observação exploratória, não uma comprovação de ausência de defeitos nem uma
validação estatística de usabilidade. A inspeção individual H-01 identificou sobreposição de toast
com campos no checkout mobile; os participantes não terem relatado esse ponto não invalida o achado.

**Possíveis próximos passos:** observar conclusão sem ajuda e tempo por tarefa; perguntar satisfação
em escala de 1 a 5; investigar se o código de retirada é compreendido, se o limite de 50% dos pontos
fica claro e se pessoas que procuram "LGPD" encontram a área de privacidade.

---

### 7. Responsividade e acessibilidade

O cenário T-22 registrou as medidas de largura, a navegação por teclado no checkout e o foco
visível. A sobreposição de toast identificada no checkout mobile foi corrigida e retestada em H-01.
As demais verificações abaixo (alvos, semântica, contraste e movimento reduzido) ainda não foram
executadas.

| Verificação | Método | Resultado |
| --- | --- | --- |
| Rolagem horizontal | `document.documentElement.scrollWidth <= window.innerWidth` em seis rotas e quatro larguras | Verificado: sem overflow horizontal |
| Sobreposição de elementos | reteste com item no carrinho e checkout inválido, a 390 × 844 px | Verificado: sem toast cobrindo campos ou navegação; resumo de erros inline visível; ver H-01 |
| Alvos de toque | inspeção de altura dos botões | Pendente de verificação |
| Navegação por teclado | checkout e pagamento com `Tab`, `Enter` e `Space` | Verificado: pedido aprovado |
| Foco visível | inspeção do contorno do elemento focado | Verificado: contorno visível |
| Estrutura semântica | árvore de acessibilidade no navegador | Pendente de verificação |
| Contraste | auditoria automatizada (Lighthouse/axe) | Pendente de verificação |
| Movimento reduzido | `prefers-reduced-motion` | Pendente de verificação |

---

### 8. Riscos residuais

| Risco | Impacto | Mitigação atual |
| --- | --- | --- |
| Dados por dispositivo | pedido não aparece em outro navegador | declarado no README e na tela de demonstração |
| Permissões no cliente | podem ser contornadas por devtools | aceito como simulação; produção valida no servidor |
| Pagamento determinístico | não cobre todos os códigos reais de recusa | três desfechos representados + validação de formulário |
| Sem testes automatizados | regressões dependem de roteiro manual | plano detalhado e funções puras isoladas para futura cobertura |
| Texto jurídico | política é modelo acadêmico | aviso explícito na página `/privacidade` |

---

### 9. Conclusão do plano

Os 22 cenários funcionais foram executados e aprovados na interface local. A avaliação heurística
foi registrada na versão publicada em 29/10/2026; o achado H-01 foi corrigido e retestado no
checkout mobile. Foi realizado um teste exploratório com seis usuários, sem identificação relatada
de bugs, erros ou mau funcionamento; métricas formais não foram coletadas. As verificações
restantes de acessibilidade continuam pendentes, e os resultados não equivalem a uma validação
completa de usabilidade ou acessibilidade.

---
