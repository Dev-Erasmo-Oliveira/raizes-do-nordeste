import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { formatarBRL, formatarDataHora } from '../lib/format';
import { getUnidade } from '../mocks';

export function Orders() {
  const { usuario, pedidos } = useApp();

  if (!usuario) return null;

  const meusPedidos = pedidos
    .filter(
      (pedido) =>
        pedido.clienteId === usuario.id ||
        pedido.clienteEmail?.toLowerCase() === usuario.email.toLowerCase(),
    )
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Histórico</span>
          <h1>Meus pedidos</h1>
          <p>Acompanhe pedidos em andamento e consulte o que você já pediu.</p>
        </div>
        <Link to="/cardapio" className="btn btn-primary btn-small">
          Novo pedido
        </Link>
      </div>

      {meusPedidos.length === 0 ? (
        <EmptyState
          icone="bag"
          titulo="Nenhum pedido por aqui"
          descricao="Seu histórico fica salvo neste dispositivo assim que você faz o primeiro pedido."
        >
          <Link to="/cardapio" className="btn btn-primary">
            Ver cardápio
          </Link>
        </EmptyState>
      ) : (
        <div className="orders-list">
          {meusPedidos.map((pedido) => {
            const unidade = getUnidade(pedido.unidadeId);
            const itens = pedido.itens.reduce((soma, item) => soma + item.quantidade, 0);
            return (
              <article key={pedido.id} className="order-card">
                <div className="order-card-head">
                  <div>
                    <strong>{pedido.codigo}</strong>
                    <span>{formatarDataHora(pedido.criadoEm)}</span>
                  </div>
                  <StatusBadge status={pedido.status} />
                </div>
                <div className="order-card-body">
                  <p>
                    {unidade?.nome ?? 'Unidade'} · {itens} {itens === 1 ? 'item' : 'itens'}
                  </p>
                  <strong>{formatarBRL(pedido.total)}</strong>
                </div>
                <div className="order-card-actions">
                  {pedido.status === 'AGUARDANDO_PAGAMENTO' ? (
                    <Link to={`/pagamento/${pedido.codigo}`} className="btn btn-primary btn-small">
                      Concluir pagamento
                    </Link>
                  ) : (
                    <Link to={`/pedido/${pedido.codigo}`} className="btn btn-secondary btn-small">
                      Ver detalhes
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
