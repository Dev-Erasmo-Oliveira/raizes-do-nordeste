import { ETAPAS_PRINCIPAIS, ETAPAS_ROTULO, indiceDaEtapa } from '../lib/status';
import type { StatusPedido } from '../types';
import { Icon } from './Icon';

export function StatusTimeline({ status }: { status: StatusPedido }) {
  const atual = indiceDaEtapa(status);
  if (atual < 0) return null;

  return (
    <ol className="timeline" aria-label="Etapas do pedido">
      {ETAPAS_PRINCIPAIS.map((etapa, indice) => {
        const estado =
          status === 'RETIRADO'
            ? 'done'
            : indice < atual
              ? 'done'
              : indice === atual
                ? 'current'
                : 'todo';
        return (
          <li key={etapa} className={`timeline-step is-${estado}`}>
            <span className="timeline-dot" aria-hidden="true">
              {estado === 'done' ? <Icon nome="check" tamanho={13} /> : indice + 1}
            </span>
            <span className="timeline-label">{ETAPAS_ROTULO[etapa]}</span>
            {estado === 'current' && <span className="timeline-now">Agora</span>}
          </li>
        );
      })}
    </ol>
  );
}
