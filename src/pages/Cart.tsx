import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { QuantityStepper } from '../components/QuantityStepper';
import { formatarBRL } from '../lib/format';
import { precoUnitario, totalItem } from '../lib/pricing';
import { getProduto } from '../mocks';
import { RULES } from '../config/rules';

export function Cart() {
  const {
    carrinho,
    unidade,
    subtotal,
    atualizarQuantidade,
    removerItem,
    limparCarrinho,
    quantidadeCarrinho,
  } = useApp();
  const navigate = useNavigate();

  const linhas = carrinho.itens.flatMap((item) => {
    const produto = getProduto(item.produtoId);
    return produto ? [{ item, produto }] : [];
  });

  if (linhas.length === 0) {
    return (
      <div className="container page">
        <EmptyState
          icone="cart"
          titulo="Seu carrinho está vazio"
          descricao="Escolha uma unidade e adicione tapiocas, cuscuz ou um café para começar."
        >
          <Link to="/cardapio" className="btn btn-primary">
            Ver cardápio
          </Link>
        </EmptyState>
      </div>
    );
  }

  const unidadeFechada = Boolean(unidade && !unidade.aberta);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Carrinho</span>
          <h1>Revise seu pedido</h1>
          <p>
            {quantidadeCarrinho} {quantidadeCarrinho === 1 ? 'item' : 'itens'} para retirada
            {unidade ? ` em ${unidade.nome}` : ''}.
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-small" onClick={limparCarrinho}>
          <Icon nome="trash" tamanho={16} /> Limpar carrinho
        </button>
      </div>

      {unidadeFechada && (
        <div className="alert alert-warning">
          <Icon nome="clock" tamanho={18} />
          <p>
            A unidade <strong>{unidade?.nome}</strong> está fechada. Escolha outra unidade para
            finalizar o pedido.
          </p>
        </div>
      )}

      <div className="cart-layout">
        <div className="cart-list">
          {linhas.map(({ item, produto }) => {
            const nomesAdicionais = item.adicionais
              .map((adicionalId) => produto.adicionais.find((a) => a.id === adicionalId)?.nome)
              .filter(Boolean);
            return (
              <article key={item.chave} className="cart-item">
                <div className="cart-item-info">
                  <h2>{produto.nome}</h2>
                  {nomesAdicionais.length > 0 && (
                    <p className="cart-item-addons">+ {nomesAdicionais.join(', ')}</p>
                  )}
                  {item.observacao && (
                    <p className="cart-item-obs">Obs.: {item.observacao}</p>
                  )}
                  <p className="cart-item-unit">
                    {formatarBRL(precoUnitario(produto, item.adicionais))} por unidade
                  </p>
                </div>
                <div className="cart-item-controls">
                  <QuantityStepper
                    valor={item.quantidade}
                    onMudar={(valor) => atualizarQuantidade(item.chave, valor)}
                    max={RULES.maxItensPorProduto}
                    rotulo={`Quantidade de ${produto.nome}`}
                  />
                  <strong className="cart-item-total">
                    {formatarBRL(totalItem(item, linhas.map((linha) => linha.produto)))}
                  </strong>
                  <button
                    type="button"
                    className="icon-button icon-button-danger"
                    onClick={() => removerItem(item.chave)}
                    aria-label={`Remover ${produto.nome} do carrinho`}
                  >
                    <Icon nome="trash" tamanho={18} />
                  </button>
                </div>
              </article>
            );
          })}
          <Link to="/cardapio" className="link-arrow cart-continue">
            <Icon nome="arrow-left" tamanho={16} /> Continuar comprando
          </Link>
        </div>

        <aside className="cart-summary" aria-label="Resumo do pedido">
          <h2>Resumo</h2>
          <dl className="summary-list">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatarBRL(subtotal)}</dd>
            </div>
            <div>
              <dt>Cupom e pontos</dt>
              <dd className="summary-muted">Aplicados no checkout</dd>
            </div>
            <div className="summary-total">
              <dt>Total parcial</dt>
              <dd>{formatarBRL(subtotal)}</dd>
            </div>
          </dl>
          <p className="summary-note">
            <Icon nome="store" tamanho={16} /> Retirada no balcão. Sem taxa de entrega.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => navigate('/checkout')}
            disabled={unidadeFechada || !unidade}
          >
            Ir para o checkout <Icon nome="arrow-right" tamanho={18} />
          </button>
          {!unidade && (
            <Link to="/unidades" className="btn btn-secondary btn-block">
              Escolher unidade
            </Link>
          )}
          <p className="summary-lgpd">
            <Icon nome="lock" tamanho={14} /> Seus dados são usados apenas para processar o pedido.
          </p>
        </aside>
      </div>
    </div>
  );
}
