import { STATUS_PEDIDO, TOM_PEDIDO } from '../lib/status';
import type { StatusPedido } from '../types';

export function StatusBadge({ status }: { status: StatusPedido }) {
  return <span className={`badge badge-${TOM_PEDIDO[status]}`}>{STATUS_PEDIDO[status]}</span>;
}
