import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { StatusBadge } from '../components/StatusBadge';
import { formatarBRL, formatarHora } from '../lib/format';
import { STATUS_PEDIDO } from '../lib/status';
import { getUnidade } from '../mocks';
import type { PapelOperacao, Pedido, StatusPedido } from '../types';

const PAPEIS: { id: PapelOperacao; nome: string; descricao: string }[] = [
  {
    id: 'atendente',
    nome: 'Atendente',
    descricao: 'Recebe o cliente, confere pagamentos e entrega pedidos prontos.',
  },
  {
    id: 'cozinha',
    nome: 'Cozinha',
    descricao: 'Aceita a comanda e avança o preparo até deixar o pedido pronto.',
  },
  {
    id: 'gerente',
    nome: 'Gerente',
    descricao: 'Acesso completo: acompanha a fila, cancela pedidos e restaura o ambiente.',
  },
];

const FILA: { id: 'todos' | 'pendentes' | 'preparo' | 'prontos' | 'finalizados'; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Toda a fila' },
  { id: 'pendentes', rotulo: 'Aguardando pagamento' },
  { id: 'preparo', rotulo: 'Em produção' },
  { id: 'prontos', rotulo: 'Prontos' },
  { id: 'finalizados', rotulo: 'Finalizados' },
];

const STATUS_FILA: Record<(typeof FILA)[number]['id'], StatusPedido[]> = {
  todos: [
    'AGUARDANDO_PAGAMENTO',
    'RECEBIDO',
    'EM_PREPARO',
    'PRONTO',
    'RETIRADO',
    'CANCELADO',
    'PAGAMENTO_RECUSADO',
  ],
  pendentes: ['AGUARDANDO_PAGAMENTO', 'PAGAMENTO_RECUSADO'],
  preparo: ['RECEBIDO', 'EM_PREPARO'],
  prontos: ['PRONTO'],
  finalizados: ['RETIRADO', 'CANCELADO'],
};

const ACAO_POR_STATUS: Partial<Record<StatusPedido, string>> = {
  RECEBIDO: 'Iniciar preparo',
  EM_PREPARO: 'Marcar pronto',
  PRONTO: 'Confirmar retirada',
};

function podeAvancar(papel: PapelOperacao, pedido: Pedido): boolean {
  if (!ACAO_POR_STATUS[pedido.status]) return false;
  if (papel === 'gerente') return true;
  if (papel === 'cozinha') return pedido.status === 'RECEBIDO' || pedido.status === 'EM_PREPARO';
  return pedido.status === 'PRONTO';
}

function podeCancelar(papel: PapelOperacao, pedido: Pedido): boolean {
  if (['RETIRADO', 'CANCELADO'].includes(pedido.status)) return false;
  return papel === 'gerente' || (papel === 'atendente' && pedido.status === 'AGUARDANDO_PAGAMENTO');
}

export function Operations() {
  const {
    pedidos,
    papel,
    definirPapel,
    avancarStatus,
    cancelarPedido,
    restaurarDemo,
    notificar,
    unidadeId,
  } = useApp();
  const [fila, setFila] = useState<(typeof FILA)[number]['id']>('todos');
  const [somenteUnidade, setSomenteUnidade] = useState(false);

  const pedidosFiltrados = useMemo(() => {
    return pedidos
      .filter((pedido) => STATUS_FILA[fila].includes(pedido.status))
      .filter((pedido) => (somenteUnidade && unidadeId ? pedido.unidadeId === unidadeId : true))
      .sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime());
  }, [pedidos, fila, somenteUnidade, unidadeId]);

  const contadores = useMemo(
    () => ({
      pagamento: pedidos.filter((item) => item.status === 'AGUARDANDO_PAGAMENTO').length,
      preparo: pedidos.filter((item) => item.status === 'RECEBIDO' || item.status === 'EM_PREPARO')
        .length,
      prontos: pedidos.filter((item) => item.status === 'PRONTO').length,
      faturamento: pedidos
        .filter((item) => item.status !== 'CANCELADO' && item.status !== 'PAGAMENTO_RECUSADO')
        .reduce((total, item) => total + item.total, 0),
    }),
    [pedidos],
  );

  const papelAtual = PAPEIS.find((item) => item.id === papel) ?? PAPEIS[0];

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Operação</span>
          <h1>Painel da unidade</h1>
          <p>
            Acompanhe a fila de pedidos e mova cada comanda conforme as permissões do seu perfil.
            Este painel simula a operação de balcão e cozinha.
          </p>
        </div>
        <Link to="/" className="btn btn-ghost btn-small">
          <Icon nome="arrow-left" tamanho={16} /> Voltar ao site
        </Link>
      </div>

      <section className="ops-roles" aria-label="Perfil de acesso">
        {PAPEIS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ops-role ${papel === item.id ? 'is-active' : ''}`}
            aria-pressed={papel === item.id}
            onClick={() => {
              definirPapel(item.id);
              notificar(`Perfil ativo: ${item.nome}.`, 'info');
            }}
          >
            <strong>{item.nome}</strong>
            <small>{item.descricao}</small>
          </button>
        ))}
      </section>

      <div className="ops-permission">
        <Icon nome="lock" tamanho={16} />
        <p>
          Você está como <strong>{papelAtual.nome}</strong>.{' '}
          {papel === 'atendente'
            ? 'Pode confirmar retiradas de pedidos prontos e cancelar pedidos ainda não pagos.'
            : papel === 'cozinha'
              ? 'Pode iniciar o preparo e marcar pedidos como prontos.'
              : 'Pode executar todas as ações, inclusive cancelar pedidos e restaurar os dados de demonstração.'}
        </p>
      </div>

      <div className="ops-metrics">
        <div className="ops-metric">
          <span>Aguardando pagamento</span>
          <strong>{contadores.pagamento}</strong>
        </div>
        <div className="ops-metric">
          <span>Em produção</span>
          <strong>{contadores.preparo}</strong>
        </div>
        <div className="ops-metric">
          <span>Prontos para retirada</span>
          <strong>{contadores.prontos}</strong>
        </div>
        <div className="ops-metric">
          <span>Total em pedidos</span>
          <strong>{formatarBRL(contadores.faturamento)}</strong>
        </div>
      </div>

      <div className="ops-toolbar">
        <div className="filter-row" role="group" aria-label="Filtrar fila">
          {FILA.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`filter-chip ${fila === item.id ? 'is-active' : ''}`}
              aria-pressed={fila === item.id}
              onClick={() => setFila(item.id)}
            >
              {item.rotulo}
            </button>
          ))}
        </div>
        <label className="ops-toggle">
          <input
            type="checkbox"
            checked={somenteUnidade}
            onChange={(evento) => setSomenteUnidade(evento.target.checked)}
          />
          <span>Somente a minha unidade</span>
        </label>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <Icon nome="bag" tamanho={28} />
          </span>
          <h2>Nenhum pedido nesta fila</h2>
          <p>
            Faça um pedido no site ou no totem para ver a comanda aparecer aqui. O painel lê os
            mesmos dados mockados do aplicativo.
          </p>
          <div className="empty-actions">
            <Link to="/cardapio" className="btn btn-primary">
              Criar pedido de teste
            </Link>
          </div>
        </div>
      ) : (
        <div className="ops-table-wrap">
          <table className="data-table ops-table">
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Cliente</th>
                <th scope="col">Unidade</th>
                <th scope="col">Retirada</th>
                <th scope="col">Total</th>
                <th scope="col">Status</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => {
                const unidade = getUnidade(pedido.unidadeId);
                const itens = pedido.itens.reduce((soma, item) => soma + item.quantidade, 0);
                const liberado = podeAvancar(papel, pedido);
                const cancelavel = podeCancelar(papel, pedido);
                return (
                  <tr key={pedido.id}>
                    <td>
                      <strong>{pedido.codigo}</strong>
                      <small className="ops-cell-sub">
                        {itens} {itens === 1 ? 'item' : 'itens'} ·{' '}
                        {pedido.canal === 'totem' ? 'Totem' : 'Web/App'}
                      </small>
                    </td>
                    <td>{pedido.clienteNome}</td>
                    <td>{unidade?.nome.replace('Raízes — ', '') ?? '—'}</td>
                    <td>{formatarHora(pedido.retiradaEm)}</td>
                    <td>{formatarBRL(pedido.total)}</td>
                    <td>
                      <StatusBadge status={pedido.status} />
                    </td>
                    <td>
                      <div className="ops-actions">
                        {ACAO_POR_STATUS[pedido.status] && (
                          <button
                            type="button"
                            className="btn btn-primary btn-small"
                            disabled={!liberado}
                            title={
                              liberado
                                ? ACAO_POR_STATUS[pedido.status]
                                : 'Seu perfil não pode executar esta ação'
                            }
                            onClick={() => {
                              const proximo = ACAO_POR_STATUS[pedido.status];
                              avancarStatus(pedido.codigo);
                              notificar(
                                `${pedido.codigo}: ${proximo?.toLowerCase()} registrado.`,
                                'sucesso',
                              );
                            }}
                          >
                            {ACAO_POR_STATUS[pedido.status]}
                          </button>
                        )}
                        {cancelavel && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-small"
                            onClick={() => cancelarPedido(pedido.codigo)}
                          >
                            Cancelar
                          </button>
                        )}
                        {!liberado && !cancelavel && (
                          <span className="ops-cell-sub">{STATUS_PEDIDO[pedido.status]}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {papel === 'gerente' && (
        <section className="panel ops-admin">
          <div>
            <h2>Administração da demonstração</h2>
            <p className="panel-sub">
              Restaura contas, pedidos, carrinho, consentimentos e preferências de canal para o
              estado inicial. Útil antes de apresentar o projeto.
            </p>
          </div>
          <button type="button" className="btn btn-danger" onClick={restaurarDemo}>
            <Icon nome="trash" tamanho={18} /> Restaurar dados de demonstração
          </button>
        </section>
      )}

      <div className="page-note">
        <Icon nome="info" tamanho={16} />
        <p>
          Permissões simuladas no front-end para representar o RBAC do projeto. Em produção, essas
          regras seriam validadas no servidor, por perfil autenticado.
        </p>
      </div>
    </div>
  );
}
