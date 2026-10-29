import type { StatusPedido, StatusPagamento } from '../types';

export const STATUS_PEDIDO: Record<StatusPedido, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  RECEBIDO: 'Pedido recebido',
  EM_PREPARO: 'Em preparo',
  PRONTO: 'Pronto para retirada',
  RETIRADO: 'Retirado',
  CANCELADO: 'Cancelado',
  PAGAMENTO_RECUSADO: 'Pagamento recusado',
};

export const TOM_PEDIDO: Record<StatusPedido, string> = {
  AGUARDANDO_PAGAMENTO: 'neutro',
  RECEBIDO: 'info',
  EM_PREPARO: 'preparo',
  PRONTO: 'pronto',
  RETIRADO: 'concluido',
  CANCELADO: 'erro',
  PAGAMENTO_RECUSADO: 'erro',
};

export const STATUS_PAGAMENTO: Record<StatusPagamento, string> = {
  INICIANDO: 'Iniciando',
  PROCESSANDO: 'Processando',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
  EXPIRADO: 'Expirado',
  CANCELADO: 'Cancelado',
};

export const ETAPAS_PRINCIPAIS: StatusPedido[] = ['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'RETIRADO'];

export const ETAPAS_ROTULO: Record<string, string> = {
  RECEBIDO: 'Pedido recebido',
  EM_PREPARO: 'Em preparo',
  PRONTO: 'Pronto para retirada',
  RETIRADO: 'Retirado',
};

export function indiceDaEtapa(status: StatusPedido): number {
  return ETAPAS_PRINCIPAIS.indexOf(status);
}

export function proximoStatus(status: StatusPedido): StatusPedido | null {
  const mapa: Partial<Record<StatusPedido, StatusPedido>> = {
    RECEBIDO: 'EM_PREPARO',
    EM_PREPARO: 'PRONTO',
    PRONTO: 'RETIRADO',
  };
  return mapa[status] ?? null;
}
