import { Icon } from './Icon';

interface QuantityStepperProps {
  valor: number;
  onMudar: (valor: number) => void;
  min?: number;
  max?: number;
  tamanho?: 'normal' | 'grande';
  rotulo?: string;
}

export function QuantityStepper({
  valor,
  onMudar,
  min = 1,
  max = 20,
  tamanho = 'normal',
  rotulo = 'Quantidade',
}: QuantityStepperProps) {
  return (
    <div className={`stepper ${tamanho === 'grande' ? 'stepper-grande' : ''}`} role="group" aria-label={rotulo}>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onMudar(Math.max(min, valor - 1))}
        disabled={valor <= min}
        aria-label="Diminuir quantidade"
      >
        <Icon nome="minus" tamanho={16} />
      </button>
      <span className="stepper-value" aria-live="polite">
        {valor}
      </span>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onMudar(Math.min(max, valor + 1))}
        disabled={valor >= max}
        aria-label="Aumentar quantidade"
      >
        <Icon nome="plus" tamanho={16} />
      </button>
    </div>
  );
}
