import { useApp } from '../context/AppContext';
import { Icon } from './Icon';

export function ToastStack() {
  const { toasts, fecharToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.tipo}`}>
          <span className="toast-icon" aria-hidden="true">
            <Icon
              nome={
                toast.tipo === 'sucesso' ? 'check' : toast.tipo === 'erro' ? 'x' : 'info'
              }
              tamanho={18}
            />
          </span>
          <p>{toast.mensagem}</p>
          <button
            type="button"
            className="toast-close"
            onClick={() => fecharToast(toast.id)}
            aria-label="Fechar aviso"
          >
            <Icon nome="x" tamanho={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
