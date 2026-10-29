import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { PaymentSimulator, type ResultadoPagamento } from '../components/PaymentSimulator';
import { formatarBRL, formatarHora } from '../lib/format';
import { STATUS_PAGAMENTO } from '../lib/status';
import { getUnidade } from '../mocks';

export function Payment() {
  const { codigo } = useParams<{ codigo: string }>();
  const {
    pedidos,
    aprovarPagamento,
    recusarPagamento,
    expirarPagamento,
    reiniciarPagamento,
    notificar,
    usuario,
  } = useApp();
  const [resultado, setResultado] = useState<ResultadoPagamento | null>(null);

  const pedido = pedidos.find((item) => item.codigo === codigo);

  if (!pedido) {
    return (
      <div className="container page">
        <EmptyState
          icone="search"
          titulo="Pedido não encontrado"
          descricao="O código informado não existe ou o pedido foi removido."
        >
          <Link to="/" className="btn btn-primary">
            Voltar ao início
          </Link>
        </EmptyState>
      </div>
    );
  }

  const unidade = getUnidade(pedido.unidadeId);
  const valor = formatarBRL(pedido.total);

  function tratarResultado(novoResultado: ResultadoPagamento) {
    if (!pedido) return;
    if (novoResultado === 'APROVADO') {
      aprovarPagamento(pedido.codigo);
      setResultado('APROVADO');
    } else if (novoResultado === 'RECUSADO') {
      recusarPagamento(pedido.codigo);
      setResultado('RECUSADO');
    } else {
      expirarPagamento(pedido.codigo);
      setResultado('EXPIRADO');
    }
  }

  function tentarNovamente() {
    if (!pedido) return;
    reiniciarPagamento(pedido.codigo);
    setResultado(null);
    notificar('Pagamento reiniciado. Você pode tentar novamente.', 'info');
  }

  if (resultado === 'APROVADO') {
    return (
      <div className="container page">
        <div className="result-card result-success">
          <span className="result-icon" aria-hidden="true">
            <Icon nome="check" tamanho={34} />
          </span>
          <h1>Pagamento aprovado</h1>
          <p>
            Pedido <strong>{pedido.codigo}</strong> confirmado no valor de{' '}
            <strong>{valor}</strong>. A cozinha já recebeu sua comanda.
          </p>
          {usuario && pedido.pontosGanhos > 0 && (
            <p className="result-note">
              <Icon nome="star" tamanho={16} /> Você ganhou {pedido.pontosGanhos} pontos neste
              pedido.
            </p>
          )}
          <div className="result-actions">
            <Link to={`/pedido/${pedido.codigo}`} className="btn btn-primary">
              Acompanhar pedido <Icon nome="arrow-right" tamanho={18} />
            </Link>
            <Link to="/pedidos" className="btn btn-secondary">
              Meus pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (resultado === 'RECUSADO' || pedido.status === 'PAGAMENTO_RECUSADO') {
    return (
      <div className="container page">
        <div className="result-card result-error">
          <span className="result-icon" aria-hidden="true">
            <Icon nome="x" tamanho={34} />
          </span>
          <h1>Pagamento recusado</h1>
          <p>
            A simulação recusou o pagamento do pedido <strong>{pedido.codigo}</strong>. Nenhum
            valor foi cobrado e seu pedido não foi enviado para a cozinha.
          </p>
          <p className="result-note">Tentativas realizadas: {pedido.pagamento.tentativas}.</p>
          <div className="result-actions">
            <button type="button" className="btn btn-primary" onClick={tentarNovamente}>
              Tentar novamente
            </button>
            <Link to="/cardapio" className="btn btn-secondary">
              Voltar ao cardápio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (resultado === 'EXPIRADO' || pedido.pagamento.status === 'EXPIRADO') {
    return (
      <div className="container page">
        <div className="result-card result-warning">
          <span className="result-icon" aria-hidden="true">
            <Icon nome="clock" tamanho={34} />
          </span>
          <h1>Pagamento não confirmado</h1>
          <p>
            O tempo de resposta da simulação expirou para o pedido{' '}
            <strong>{pedido.codigo}</strong>. Nenhum valor foi cobrado.
          </p>
          <div className="result-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                notificar(
                  'A simulação ainda não confirmou este pagamento. Tente novamente em instantes.',
                  'info',
                )
              }
            >
              Verificar status
            </button>
            <button type="button" className="btn btn-primary" onClick={tentarNovamente}>
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (pedido.status !== 'AGUARDANDO_PAGAMENTO') {
    return (
      <div className="container page">
        <div className="result-card">
          <span className="result-icon" aria-hidden="true">
            <Icon nome="check" tamanho={34} />
          </span>
          <h1>Pagamento já processado</h1>
          <p>
            O pedido <strong>{pedido.codigo}</strong> está com status{' '}
            <strong>{STATUS_PAGAMENTO[pedido.pagamento.status]}</strong>.
          </p>
          <div className="result-actions">
            <Link to={`/pedido/${pedido.codigo}`} className="btn btn-primary">
              Acompanhar pedido
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Pagamento demonstrativo</span>
          <h1>Finalize com segurança</h1>
          <p>
            Pedido <strong>{pedido.codigo}</strong> · {pedido.itens.length}{' '}
            {pedido.itens.length === 1 ? 'item' : 'itens'} · retirada às{' '}
            {formatarHora(pedido.retiradaEm)}
          </p>
        </div>
        <Link to={`/pedido/${pedido.codigo}`} className="btn btn-ghost btn-small">
          Ver resumo do pedido
        </Link>
      </div>

      <div className="payment-layout">
        <div>
          <PaymentSimulator
            metodo={pedido.pagamento.metodo}
            valor={pedido.total}
            onResultado={tratarResultado}
          />
        </div>

        <aside className="payment-summary" aria-label="Resumo do pedido">
          <h2>Resumo</h2>
          <p className="checkout-summary-unit">
            <Icon nome="store" tamanho={16} /> {unidade?.nome ?? 'Unidade'}
          </p>
          <p className="payment-pickup">
            <Icon nome="clock" tamanho={16} /> Retirada às {formatarHora(pedido.retiradaEm)}
          </p>
          <ul className="checkout-items">
            {pedido.itens.map((item) => (
              <li key={`${item.produtoId}-${item.nome}`}>
                <span className="checkout-item-qty">{item.quantidade}x</span>
                <span className="checkout-item-name">{item.nome}</span>
                <strong>{formatarBRL(item.precoUnitario * item.quantidade)}</strong>
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
              <dd>{valor}</dd>
            </div>
          </dl>
          <p className="summary-note">
            <Icon nome="lock" tamanho={16} /> Demonstração local: não há cobrança real nem envio
            de dados a um gateway. Não informe dados reais do cartão.
          </p>
          <p className="summary-note">
            Tentativas de pagamento: {pedido.pagamento.tentativas} · Transação{' '}
            {pedido.pagamento.transacaoId}
          </p>
        </aside>
      </div>
    </div>
  );
}
