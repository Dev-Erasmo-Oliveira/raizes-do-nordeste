import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { StatusBadge } from '../components/StatusBadge';
import { StatusTimeline } from '../components/StatusTimeline';
import { STATUS_PAGAMENTO, STATUS_PEDIDO, proximoStatus } from '../lib/status';
import { formatarBRL, formatarDataHora, formatarHora } from '../lib/format';
import { getUnidade } from '../mocks';

export function OrderTracking() {
  const { codigo } = useParams<{ codigo: string }>();
  const { pedidos, avancarStatus, notificar } = useApp();
  const pedido = pedidos.find((item) => item.codigo === codigo);

  if (!pedido) {
    return (
      <div className="container page">
        <EmptyState
          icone="search"
          titulo="Pedido não encontrado"
          descricao="Confira o código informado ou abra seus pedidos na conta."
        >
          <Link to="/pedidos" className="btn btn-primary">
            Meus pedidos
          </Link>
        </EmptyState>
      </div>
    );
  }

  const unidade = getUnidade(pedido.unidadeId);
  const proximo = proximoStatus(pedido.status);
  const mostrarTimeline = ['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'RETIRADO'].includes(pedido.status);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Acompanhamento</span>
          <h1>Pedido {pedido.codigo}</h1>
          <p>
            Feito em {formatarDataHora(pedido.criadoEm)} · retirada prevista às{' '}
            {formatarHora(pedido.retiradaEm)}.
          </p>
        </div>
        <StatusBadge status={pedido.status} />
      </div>

      {pedido.status === 'AGUARDANDO_PAGAMENTO' && (
        <div className="alert alert-warning">
          <Icon nome="clock" tamanho={18} />
          <p>
            Este pedido ainda aguarda pagamento.{' '}
            <Link to={`/pagamento/${pedido.codigo}`}>Concluir pagamento</Link> para enviá-lo à
            cozinha.
          </p>
        </div>
      )}

      {pedido.status === 'PAGAMENTO_RECUSADO' && (
        <div className="alert alert-error">
          <Icon nome="x" tamanho={18} />
          <p>
            O pagamento foi recusado. Nenhum valor foi cobrado.{' '}
            <Link to={`/pagamento/${pedido.codigo}`}>Tentar novamente</Link>.
          </p>
        </div>
      )}

      {pedido.status === 'CANCELADO' && (
        <div className="alert alert-error">
          <Icon nome="x" tamanho={18} />
          <p>Este pedido foi cancelado. Se precisar, monte um novo pedido no cardápio.</p>
        </div>
      )}

      <div className="tracking-layout">
        <div className="tracking-main">
          {mostrarTimeline && (
            <section className="panel" aria-labelledby="status-title">
              <div className="panel-head">
                <h2 id="status-title">Status do pedido</h2>
                <StatusBadge status={pedido.status} />
              </div>
              <StatusTimeline status={pedido.status} />
              {pedido.status === 'PRONTO' && (
                <p className="ready-callout">
                  <Icon nome="store" tamanho={18} /> Seu pedido está pronto. Retire no balcão
                  informando o código <strong>{pedido.codigo}</strong>.
                </p>
              )}
              {pedido.status === 'RETIRADO' && (
                <p className="ready-callout">
                  <Icon nome="check" tamanho={18} /> Pedido retirado. Bom apetite!
                </p>
              )}
              {proximo && (
                <button
                  type="button"
                  className="btn btn-ghost btn-small demo-advance"
                  onClick={() => {
                    avancarStatus(pedido.codigo);
                    notificar(`Status atualizado: ${STATUS_PEDIDO[proximo]}.`, 'info');
                  }}
                >
                  <Icon nome="chart" tamanho={16} /> Avançar status (demonstração)
                </button>
              )}
            </section>
          )}

          <section className="panel" aria-labelledby="itens-title">
            <h2 id="itens-title">Itens do pedido</h2>
            <ul className="order-items">
              {pedido.itens.map((item) => (
                <li key={`${item.produtoId}-${item.nome}-${item.observacao}`}>
                  <div>
                    <strong>
                      {item.quantidade}x {item.nome}
                    </strong>
                    {item.adicionais.length > 0 && (
                      <small>+ {item.adicionais.map((adicional) => adicional.nome).join(', ')}</small>
                    )}
                    {item.observacao && <small>Obs.: {item.observacao}</small>}
                  </div>
                  <span>{formatarBRL(item.precoUnitario * item.quantidade)}</span>
                </li>
              ))}
            </ul>
            <dl className="summary-list">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatarBRL(pedido.subtotal)}</dd>
              </div>
              {pedido.descontoCupom > 0 && (
                <div>
                  <dt>Cupom {pedido.cupomCodigo}</dt>
                  <dd>- {formatarBRL(pedido.descontoCupom)}</dd>
                </div>
              )}
              {pedido.descontoPontos > 0 && (
                <div>
                  <dt>Pontos ({pedido.pontosUsados})</dt>
                  <dd>- {formatarBRL(pedido.descontoPontos)}</dd>
                </div>
              )}
              <div className="summary-total">
                <dt>Total</dt>
                <dd>{formatarBRL(pedido.total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="tracking-aside">
          <section className="panel">
            <h2>Retirada</h2>
            <p className="checkout-summary-unit">
              <Icon nome="store" tamanho={16} /> {unidade?.nome}
            </p>
            <p className="tracking-address">{unidade?.endereco}</p>
            <p className="tracking-address">
              <Icon nome="clock" tamanho={16} /> Hoje, às {formatarHora(pedido.retiradaEm)}
            </p>
            <p className="tracking-address">
              <Icon nome="user" tamanho={16} /> {pedido.clienteNome}
            </p>
            <p className="tracking-address">
              <Icon nome="ticket" tamanho={16} /> {pedido.canal === 'totem' ? 'Totem' : 'Web/App'}
            </p>
          </section>

          <section className="panel">
            <h2>Pagamento</h2>
            <p className="tracking-address">
              <strong>{pedido.pagamento.metodo === 'pix' ? 'Pix' : 'Cartão de crédito'}</strong>
            </p>
            <p className="tracking-address">
              Situação: {STATUS_PAGAMENTO[pedido.pagamento.status]}
            </p>
            <p className="tracking-address">Transação: {pedido.pagamento.transacaoId}</p>
            <p className="tracking-address">Tentativas: {pedido.pagamento.tentativas}</p>
            {pedido.clienteId && pedido.pontosGanhos > 0 && (
              <p className="tracking-address">
                <Icon nome="star" tamanho={16} /> {pedido.pontosGanhos} pontos neste pedido
              </p>
            )}
          </section>

          <section className="panel">
            <h2>Privacidade</h2>
            <p className="tracking-address">
              Os dados deste pedido ficam salvos neste navegador. O pagamento foi simulado e
              nenhuma informação foi enviada a um gateway externo.
            </p>
            <Link to="/privacidade" className="link-arrow">
              Política de Privacidade
            </Link>
          </section>

          <Link to="/pedidos" className="btn btn-secondary btn-block">
            Ver todos os pedidos
          </Link>
        </aside>
      </div>
    </div>
  );
}
