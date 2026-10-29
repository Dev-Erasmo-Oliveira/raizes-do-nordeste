import type { ReactNode } from 'react';
import { Icon, type NomeIcone } from './Icon';

interface EmptyStateProps {
  icone?: NomeIcone;
  titulo: string;
  descricao: string;
  children?: ReactNode;
}

export function EmptyState({ icone = 'bag', titulo, descricao, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        <Icon nome={icone} tamanho={28} />
      </span>
      <h2>{titulo}</h2>
      <p>{descricao}</p>
      {children && <div className="empty-actions">{children}</div>}
    </div>
  );
}
