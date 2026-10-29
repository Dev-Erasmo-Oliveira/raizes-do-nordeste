import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { PaymentSimulator, type ResultadoPagamento } from '../components/PaymentSimulator';
import { QuantityStepper } from '../components/QuantityStepper';
import { RULES } from '../config/rules';
import { formatarBRL } from '../lib/format';
import { chaveDoItem, precoUnitario, subtotalCarrinho, totalItem } from '../lib/pricing';
import { CATEGORIAS, PRODUTOS, UNIDADES, disponivelNaUnidade, getProduto } from '../mocks';
import type {
  AdicionalDoPedido,
  ItemCarrinho,
  ItemPedido,
  MetodoPagamento,
  Produto,
} from '../types';

type Etapa = 'inicio' | 'cardapio' | 'carrinho' | 'pagamento' | 'concluido';

const TEMPO_RETORNO_TOTEM_MS = 20_000;

export function Totem() {
  const {
    criarPedido,
    pedidos,
    aprovarPagamento,
    recusarPagamento,
    expirarPagamento,
    reiniciarPagamento,
    cancelarPedido,
    notificar,
  } = useApp();

  const unidade = UNIDADES.find((loja) => loja.aberta) ?? UNIDADES[0];

  const [etapa, setEtapa] = useState<Etapa>('inicio');
  const [nome, setNome] = useState('');
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState(CATEGORIAS[0].id);
  const [produtoAtivo, setProdutoAtivo] = useState<Produto | null>(null);
  const [adicionais, setAdicionais] = useState<string[]>([]);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');
  const [metodo, setMetodo] = useState<MetodoPagamento>('pix');
  const [pedidoCodigo, setPedidoCodigo] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoPagamento | null>(null);
  const [erro, setErro] = useState('');

  const subtotal = subtotalCarrinho(itens, PRODUTOS);
  const quantidadeTotal = itens.reduce((soma, item) => soma + item.quantidade, 0);
  const pedido = pedidoCodigo
    ? pedidos.find((item) => item.codigo === pedidoCodigo)
    : undefined;
  const produtosDaCategoria = PRODUTOS.filter(
    (produto) =>
      produto.categoriaId === categoriaAtiva && disponivelNaUnidade(produto, unidade.id),
  );

  function iniciar() {
    if (nome.trim().length < 2) {
      setErro('Digite seu primeiro nome para começarmos.');
      return;
    }
    setErro('');
    setEtapa('cardapio');
  }

  function abrirProduto(produto: Produto) {
    setProdutoAtivo(produto);
    setAdicionais([]);
    setQuantidade(1);
    setObservacao('');
    setErro('');
  }

  function fecharProduto() {
    setProdutoAtivo(null);
    setErro('');
  }

  function alternarAdicional(id: string) {
    if (!produtoAtivo) return;
    setErro('');
    setAdicionais((atuais) => {
      if (atuais.includes(id)) return atuais.filter((item) => item !== id);
      if (atuais.length >= produtoAtivo.addonMax) {
        setErro(`Escolha no máximo ${produtoAtivo.addonMax} adicionais.`);
        return atuais;
      }
      return [...atuais, id];
    });
  }

  function adicionarItem() {
    if (!produtoAtivo) return;
    if (adicionais.length < produtoAtivo.addonMin) {
      setErro(`Escolha pelo menos ${produtoAtivo.addonMin} adicional(is).`);
      return;
    }
    const chave = chaveDoItem(produtoAtivo.id, adicionais, observacao);
    setItens((atuais) => {
      const existente = atuais.find((item) => item.chave === chave);
      if (existente) {
        return atuais.map((item) =>
          item.chave === chave
            ? {
                ...item,
                quantidade: Math.min(
                  item.quantidade + quantidade,
                  RULES.maxItensPorProduto,
                ),
              }
            : item,
        );
      }
      return [
        ...atuais,
        {
          chave,
          produtoId: produtoAtivo.id,
          adicionais,
          quantidade,
          observacao: observacao.trim(),
        },
      ];
    });
    notificar(`${produtoAtivo.nome} adicionado.`, 'sucesso');
    fecharProduto();
  }

  function irParaPagamento() {
    if (itens.length === 0) return;
    const itensPedido: ItemPedido[] = itens.flatMap((item) => {
      const produto = getProduto(item.produtoId);
      if (!produto) return [];
      const adicionaisDoItem: AdicionalDoPedido[] = item.adicionais.flatMap((id) => {
        const adicional = produto.adicionais.find((candidato) => candidato.id === id);
        return adicional
          ? [{ id: adicional.id, nome: adicional.nome, preco: adicional.preco }]
          : [];
      });
      return [
        {
          produtoId: produto.id,
          nome: produto.nome,
          quantidade: item.quantidade,
          adicionais: adicionaisDoItem,
          observacao: item.observacao,
          precoUnitario: precoUnitario(produto, item.adicionais),
        },
      ];
    });

    const novoPedido = criarPedido(
      {
        unidadeId: unidade.id,
        canal: 'totem',
        clienteNome: nome,
        itens: itensPedido,
        pontosUsados: 0,
        metodo,
        retiradaEm: new Date(
          Date.now() + RULES.antecedenciaMinimaMin * 60000,
        ).toISOString(),
      },
      { limparCarrinho: false },
    );
    setPedidoCodigo(novoPedido.codigo);
    setEtapa('pagamento');
    setResultado(null);
  }

  function tratarResultado(novoResultado: ResultadoPagamento) {
    if (!pedidoCodigo) return;
    if (novoResultado === 'APROVADO') {
      aprovarPagamento(pedidoCodigo);
      setResultado('APROVADO');
      setEtapa('concluido');
    } else if (novoResultado === 'RECUSADO') {
      recusarPagamento(pedidoCodigo);
      setResultado('RECUSADO');
    } else {
      expirarPagamento(pedidoCodigo);
      setResultado('EXPIRADO');
    }
  }

  function tentarNovamente() {
    if (!pedidoCodigo) return;
    reiniciarPagamento(pedidoCodigo);
    setResultado(null);
  }

  const resetar = useCallback(() => {
    setEtapa('inicio');
    setNome('');
    setItens([]);
    setCategoriaAtiva(CATEGORIAS[0].id);
    setProdutoAtivo(null);
    setAdicionais([]);
    setQuantidade(1);
    setObservacao('');
    setMetodo('pix');
    setPedidoCodigo(null);
    setResultado(null);
    setErro('');
  }, []);

  useEffect(() => {
    if (etapa !== 'concluido') return;

    const temporizador = window.setTimeout(resetar, TEMPO_RETORNO_TOTEM_MS);
    return () => window.clearTimeout(temporizador);
  }, [etapa, resetar]);

  function cancelarAtendimento() {
    if (pedidoCodigo) {
      const atual = pedidos.find((item) => item.codigo === pedidoCodigo);
      if (atual && (atual.status === 'AGUARDANDO_PAGAMENTO' || atual.status === 'PAGAMENTO_RECUSADO')) {
        cancelarPedido(pedidoCodigo);
      }
    }
    resetar();
  }

  return (
    <div className="totem-shell">
      <header className="totem-header">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            R
          </span>
          <span className="brand-text">
            <strong>Raízes</strong>
            <small>do Nordeste</small>
          </span>
        </Link>
        <div className="totem-unit">
          <Icon nome="pin" tamanho={18} /> {unidade.nome} · {unidade.cidade}
        </div>
        <Link to="/" className="btn btn-ghost btn-small">
          Sair do totem
        </Link>
      </header>

      <main className="totem-main">
        {etapa === 'inicio' && (
          <section className="totem-start">
            <span className="eyebrow">Totem de autoatendimento</span>
            <h1>Bem-vindo à Raízes</h1>
            <p className="totem-lead">
              Peça sem fila, pague aqui no totem e retire no balcão quando chamarem seu nome.
            </p>
            <div className="totem-start-grid">
              <div className="totem-start-form">
                <label htmlFor="totem-nome">Como podemos chamar você?</label>
                <input
                  id="totem-nome"
                  className="totem-input"
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                  placeholder="Seu primeiro nome"
                  autoFocus
                />
                <p className="panel-footnote">
                  Este pedido fica salvo neste navegador. O pagamento é uma simulação, sem
                  cobrança real.{' '}
                  <a href="/privacidade" target="_blank" rel="noreferrer">
                    Política de Privacidade
                  </a>
                </p>
                {erro && (
                  <p className="form-error" role="alert">
                    {erro}
                  </p>
                )}
                <button type="button" className="btn btn-primary btn-totem" onClick={iniciar}>
                  Começar pedido <Icon nome="arrow-right" tamanho={22} />
                </button>
              </div>

              <ol className="totem-steps">
                <li>
                  <span>1</span>
                  <div>
                    <strong>Escolha os itens</strong>
                    <p>Toque no que você quer e personalize.</p>
                  </div>
                </li>
                <li>
                  <span>2</span>
                  <div>
                    <strong>Pague no totem</strong>
                    <p>Pix ou cartão, no ambiente de teste.</p>
                  </div>
                </li>
                <li>
                  <span>3</span>
                  <div>
                    <strong>Retire no balcão</strong>
                    <p>Mostre o código quando chamarem.</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>
        )}

        {etapa === 'cardapio' && (
          <section className="totem-menu">
            <div className="totem-menu-head">
              <div>
                <span className="eyebrow">Olá, {nome}</span>
                <h1>Monte seu pedido</h1>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-totem"
                onClick={() => setEtapa('carrinho')}
                disabled={itens.length === 0}
              >
                <Icon nome="cart" tamanho={22} /> Carrinho ({quantidadeTotal})
              </button>
            </div>

            <div className="totem-categories" role="tablist" aria-label="Categorias">
              {CATEGORIAS.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  role="tab"
                  aria-selected={categoriaAtiva === categoria.id}
                  className={`totem-category ${categoriaAtiva === categoria.id ? 'is-active' : ''}`}
                  onClick={() => setCategoriaAtiva(categoria.id)}
                >
                  {categoria.nome}
                </button>
              ))}
            </div>

            <div className="totem-product-grid">
              {produtosDaCategoria.map((produto) => (
                <button
                  key={produto.id}
                  type="button"
                  className="totem-product"
                  onClick={() => abrirProduto(produto)}
                >
                  <strong>{produto.nome}</strong>
                  <small>{produto.descricao}</small>
                  <span className="totem-product-price">{formatarBRL(produto.preco)}</span>
                </button>
              ))}
            </div>

            {itens.length > 0 && (
              <div className="totem-bottom-bar">
                <span>
                  {quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'} ·{' '}
                  <strong>{formatarBRL(subtotal)}</strong>
                </span>
                <button
                  type="button"
                  className="btn btn-primary btn-totem"
                  onClick={() => setEtapa('carrinho')}
                >
                  Revisar pedido <Icon nome="arrow-right" tamanho={22} />
                </button>
              </div>
            )}

            {produtoAtivo && (
              <div
                className="modal-overlay totem-sheet-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="totem-produto-titulo"
                onClick={(evento) => {
                  if (evento.target === evento.currentTarget) fecharProduto();
                }}
              >
                <div className="totem-sheet">
                  <button
                    type="button"
                    className="icon-button totem-sheet-close"
                    onClick={fecharProduto}
                    aria-label="Fechar detalhes do item"
                  >
                    <Icon nome="x" tamanho={24} />
                  </button>
                  <div className="totem-sheet-head">
                    <div>
                      <h2 id="totem-produto-titulo">{produtoAtivo.nome}</h2>
                      <p>{produtoAtivo.descricao}</p>
                      <strong className="totem-sheet-price">
                        {formatarBRL(produtoAtivo.preco)}
                      </strong>
                    </div>
                  </div>

                  {produtoAtivo.addonMax > 0 && (
                    <fieldset className="addon-group">
                      <legend>
                        Adicionais{' '}
                        <small>
                          {produtoAtivo.addonMin > 0
                            ? `Escolha de ${produtoAtivo.addonMin}`
                            : 'Até'}{' '}
                          {produtoAtivo.addonMax}
                        </small>
                      </legend>
                      {produtoAtivo.adicionais.map((adicional) => {
                        const marcado = adicionais.includes(adicional.id);
                        return (
                          <label
                            key={adicional.id}
                            className={`addon-option ${marcado ? 'is-checked' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={marcado}
                              onChange={() => alternarAdicional(adicional.id)}
                            />
                            <span>{adicional.nome}</span>
                            <strong>+ {formatarBRL(adicional.preco)}</strong>
                          </label>
                        );
                      })}
                    </fieldset>
                  )}

                  <div className="field">
                    <label htmlFor="totem-observacao">Observação</label>
                    <textarea
                      id="totem-observacao"
                      rows={2}
                      maxLength={140}
                      value={observacao}
                      onChange={(evento) => setObservacao(evento.target.value)}
                      placeholder="Ex.: sem cebola, bem passado…"
                    />
                  </div>

                  {erro && (
                    <p className="form-error" role="alert">
                      {erro}
                    </p>
                  )}

                  <div className="totem-sheet-footer">
                    <QuantityStepper
                      valor={quantidade}
                      onMudar={setQuantidade}
                      max={RULES.maxItensPorProduto}
                      tamanho="grande"
                      rotulo="Quantidade do item"
                    />
                    <strong>
                      {formatarBRL(precoUnitario(produtoAtivo, adicionais) * quantidade)}
                    </strong>
                    <button type="button" className="btn btn-primary btn-totem" onClick={adicionarItem}>
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {etapa === 'carrinho' && (
          <section className="totem-cart">
            <div className="totem-page-head">
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={() => setEtapa('cardapio')}
              >
                <Icon nome="arrow-left" tamanho={18} /> Adicionar mais itens
              </button>
              <h1>Seu carrinho</h1>
            </div>

            {itens.length === 0 ? (
              <div className="empty-state">
                <h2>Carrinho vazio</h2>
                <p>Volte ao cardápio e escolha algo gostoso.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setEtapa('cardapio')}
                >
                  Ver cardápio
                </button>
              </div>
            ) : (
              <div className="totem-cart-layout">
                <div className="totem-cart-list">
                  {itens.map((item) => {
                    const produto = getProduto(item.produtoId);
                    if (!produto) return null;
                    const nomesAdicionais = item.adicionais
                      .map((id) => produto.adicionais.find((a) => a.id === id)?.nome)
                      .filter(Boolean);
                    return (
                      <article key={item.chave} className="totem-cart-item">
                        <div>
                          <strong>{produto.nome}</strong>
                          {nomesAdicionais.length > 0 && (
                            <small>+ {nomesAdicionais.join(', ')}</small>
                          )}
                          {item.observacao && <small>Obs.: {item.observacao}</small>}
                        </div>
                        <QuantityStepper
                          valor={item.quantidade}
                          onMudar={(valor) =>
                            setItens((atuais) =>
                              atuais.map((candidato) =>
                                candidato.chave === item.chave
                                  ? { ...candidato, quantidade: valor }
                                  : candidato,
                              ),
                            )
                          }
                          max={RULES.maxItensPorProduto}
                          tamanho="grande"
                          rotulo={`Quantidade de ${produto.nome}`}
                        />
                        <strong>{formatarBRL(totalItem(item, PRODUTOS))}</strong>
                        <button
                          type="button"
                          className="icon-button icon-button-danger"
                          aria-label={`Remover ${produto.nome}`}
                          onClick={() =>
                            setItens((atuais) =>
                              atuais.filter((candidato) => candidato.chave !== item.chave),
                            )
                          }
                        >
                          <Icon nome="trash" tamanho={22} />
                        </button>
                      </article>
                    );
                  })}
                </div>

                <aside className="totem-checkout">
                  <h2>Fechar pedido</h2>
                  <div className="totem-total">
                    <span>Total</span>
                    <strong>{formatarBRL(subtotal)}</strong>
                  </div>
                  <p className="totem-note">Retirada no balcão · sem taxa de entrega</p>

                  <fieldset className="totem-methods">
                    <legend>Forma de pagamento</legend>
                    <label className={`payment-method ${metodo === 'pix' ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="totem-metodo"
                        value="pix"
                        checked={metodo === 'pix'}
                        onChange={() => setMetodo('pix')}
                      />
                      <span>
                        <strong>Pix</strong>
                        <small>Aprovação na hora</small>
                      </span>
                    </label>
                    <label
                      className={`payment-method ${metodo === 'cartao' ? 'is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="totem-metodo"
                        value="cartao"
                        checked={metodo === 'cartao'}
                        onChange={() => setMetodo('cartao')}
                      />
                      <span>
                        <strong>Cartão</strong>
                        <small>Dados fictícios de teste</small>
                      </span>
                    </label>
                  </fieldset>

                  <button
                    type="button"
                    className="btn btn-primary btn-totem btn-block"
                    onClick={irParaPagamento}
                  >
                    Continuar para pagamento <Icon nome="arrow-right" tamanho={22} />
                  </button>
                  <p className="totem-note">
                    <Icon nome="lock" tamanho={16} /> Nenhum pagamento real será processado.
                  </p>
                </aside>
              </div>
            )}
          </section>
        )}

        {etapa === 'pagamento' && (
          <section className="totem-payment">
            <div className="totem-page-head">
              <div>
                <span className="eyebrow">Pedido {pedidoCodigo}</span>
                <h1>Pagamento</h1>
              </div>
              <button type="button" className="btn btn-ghost btn-small" onClick={cancelarAtendimento}>
                Cancelar atendimento
              </button>
            </div>

            {resultado === 'RECUSADO' ? (
              <div className="result-card result-error">
                <span className="result-icon" aria-hidden="true">
                  <Icon nome="x" tamanho={34} />
                </span>
                <h2>Pagamento recusado</h2>
                <p>A simulação recusou o pagamento. Nenhum valor foi cobrado.</p>
                <div className="result-actions">
                  <button type="button" className="btn btn-primary" onClick={tentarNovamente}>
                    Tentar novamente
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={cancelarAtendimento}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : resultado === 'EXPIRADO' ? (
              <div className="result-card result-warning">
                <span className="result-icon" aria-hidden="true">
                  <Icon nome="clock" tamanho={34} />
                </span>
                <h2>Pagamento não confirmado</h2>
                <p>O tempo de resposta da simulação expirou. Nenhum valor foi cobrado.</p>
                <div className="result-actions">
                  <button type="button" className="btn btn-primary" onClick={tentarNovamente}>
                    Tentar novamente
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={cancelarAtendimento}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="totem-payment-grid">
                <PaymentSimulator
                  metodo={pedido?.pagamento.metodo ?? metodo}
                  valor={pedido?.total ?? subtotal}
                  onResultado={tratarResultado}
                />
                <aside className="totem-payment-summary">
                  <h2>Resumo</h2>
                  <p>
                    <Icon nome="user" tamanho={18} /> {nome}
                  </p>
                  <p>
                    <Icon nome="store" tamanho={18} /> {unidade.nome}
                  </p>
                  <ul>
                    {itens.map((item) => {
                      const produto = getProduto(item.produtoId);
                      return (
                        <li key={item.chave}>
                          <span>
                            {item.quantidade}x {produto?.nome}
                          </span>
                          <strong>{formatarBRL(totalItem(item, PRODUTOS))}</strong>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="totem-total">
                    <span>Total</span>
                    <strong>{formatarBRL(pedido?.total ?? subtotal)}</strong>
                  </div>
                </aside>
              </div>
            )}
          </section>
        )}

        {etapa === 'concluido' && (
          <section className="totem-success">
            <span className="totem-success-icon" aria-hidden="true">
              <Icon nome="check" tamanho={48} />
            </span>
            <span className="eyebrow">Pagamento aprovado</span>
            <h1>Pedido confirmado!</h1>
            <p className="totem-lead">
              Obrigado, {nome}. A cozinha já recebeu sua comanda. Retire no balcão quando chamarem
              seu nome.
            </p>
            <div className="totem-code">
              <span>Seu código</span>
              <strong>{pedidoCodigo}</strong>
            </div>
            <p className="totem-success-total">
              Total pago: <strong>{formatarBRL(pedido?.total ?? 0)}</strong>
            </p>
            <p className="totem-success-total" role="status">
              Esta tela voltará ao início automaticamente em 20 segundos.
            </p>
            <button type="button" className="btn btn-primary btn-totem" onClick={resetar}>
              Novo atendimento
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
