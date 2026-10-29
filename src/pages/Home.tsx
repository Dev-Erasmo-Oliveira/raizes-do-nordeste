import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { ProductCard } from '../components/ProductCard';
import { STATUS_PEDIDO } from '../lib/status';
import { CATEGORIAS, UNIDADES, maisPedidos } from '../mocks';

export function Home() {
  const { unidade, unidadeId, usuario, pedidos } = useApp();
  const destaques = maisPedidos();

  const pedidoAtivo = usuario
    ? pedidos.find(
        (pedido) =>
          pedido.clienteId === usuario.id &&
          ['AGUARDANDO_PAGAMENTO', 'RECEBIDO', 'EM_PREPARO', 'PRONTO'].includes(pedido.status),
      )
    : undefined;

  return (
    <>
      <section className="home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Rede Raízes do Nordeste</span>
            <h1>Peça para retirar no balcão</h1>
            <p className="hero-lead">
              Escolha a unidade, monte seu pedido e selecione o horário da retirada.
            </p>
            <div className="hero-actions">
              <Link to="/cardapio" className="btn btn-primary">
                Ver cardápio <Icon nome="arrow-right" tamanho={18} />
              </Link>
              <Link to="/unidades" className="btn btn-secondary">
                Escolher unidade
              </Link>
            </div>
            <div className="hero-unit">
              <Icon nome={unidade ? 'pin' : 'info'} tamanho={16} />
              {unidade ? (
                <span>
                  <strong>{unidade.nome}</strong> · {unidade.aberta ? 'Aberto agora' : 'Fechado'} ·{' '}
                  {unidade.horario}
                </span>
              ) : (
                <span>Nenhuma unidade selecionada. Escolha uma para liberar o pedido.</span>
              )}
            </div>
          </div>

        </div>
      </section>

      <div className="container">
        {pedidoAtivo && (
          <Link to={`/pedido/${pedidoAtivo.codigo}`} className="active-order">
            <span className="active-order-icon" aria-hidden="true">
              <Icon nome="clock" tamanho={20} />
            </span>
            <span>
              <strong>Pedido {pedidoAtivo.codigo}</strong>
              <small>{STATUS_PEDIDO[pedidoAtivo.status]} · toque para acompanhar</small>
            </span>
            <Icon nome="arrow-right" tamanho={18} />
          </Link>
        )}
      </div>

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Cardápio</span>
            <h2>Escolha por categoria</h2>
          </div>
          <Link to="/cardapio" className="link-arrow">
            Cardápio completo <Icon nome="arrow-right" tamanho={16} />
          </Link>
        </div>
        <div className="category-row">
          {CATEGORIAS.map((categoria) => (
            <Link
              key={categoria.id}
              to={`/cardapio?categoria=${categoria.id}`}
              className="category-chip"
            >
              {categoria.nome}
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Cardápio</span>
            <h2>Mais pedidos</h2>
          </div>
        </div>
        <div className="product-grid">
          {destaques.map((produto) => (
            <ProductCard key={produto.id} produto={produto} unidadeId={unidadeId} />
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="units-strip">
          <div>
            <span className="eyebrow">Onde estamos</span>
            <h2>{UNIDADES.length} unidades para te atender</h2>
          </div>
          <div className="units-strip-list">
            {UNIDADES.map((loja) => (
              <Link key={loja.id} to="/unidades" className="units-strip-item">
                <strong>{loja.nome}</strong>
                <span>{loja.cidade}</span>
                <small className={loja.aberta ? 'is-open' : 'is-closed'}>
                  {loja.aberta ? 'Aberto agora' : 'Fechado'}
                </small>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
