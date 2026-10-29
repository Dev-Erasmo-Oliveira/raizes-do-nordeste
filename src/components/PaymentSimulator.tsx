import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { formatarBRL } from '../lib/format';
import type { MetodoPagamento } from '../types';
import { Icon } from './Icon';

export type ResultadoPagamento = 'APROVADO' | 'RECUSADO' | 'EXPIRADO';

interface PaymentSimulatorProps {
  metodo: MetodoPagamento;
  valor: number;
  onResultado: (resultado: ResultadoPagamento) => void;
  desabilitado?: boolean;
}

const CODIGO_PIX =
  '00020126580014BR.GOV.BCB.PIX0136raizes-do-nordeste-mock5204000053039865802BR5925REDE RAIZES DO NORDESTE6009RECIFE62070503***6304A1B2';

function gerarCelulas(semente: string): boolean[] {
  const total = 21 * 21;
  const celulas: boolean[] = [];
  let hash = 2166136261;
  for (let indice = 0; indice < total; indice += 1) {
    hash ^= semente.charCodeAt(indice % semente.length);
    hash = Math.imul(hash, 16777619);
    celulas.push(((hash >>> 7) & 7) > 2);
  }
  return celulas;
}

const CELULAS_PIX = gerarCelulas(CODIGO_PIX);

export function PaymentSimulator({
  metodo,
  valor,
  onResultado,
  desabilitado = false,
}: PaymentSimulatorProps) {
  const { notificar } = useApp();
  const [numero, setNumero] = useState('');
  const [nome, setNome] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  function executar(resultado: ResultadoPagamento, atraso = 2600) {
    if (processando || desabilitado) return;
    setErro('');
    setProcessando(true);
    timer.current = window.setTimeout(() => {
      setProcessando(false);
      onResultado(resultado);
    }, atraso);
  }

  function pagarCartao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (processando || desabilitado) return;
    const digitos = numero.replace(/\D/g, '');
    if (digitos.length < 13) {
      setErro('Informe um número de cartão com pelo menos 13 dígitos.');
      return;
    }
    if (nome.trim().length < 3) {
      setErro('Informe o nome impresso no cartão.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(validade)) {
      setErro('A validade deve estar no formato MM/AA.');
      return;
    }
    if (cvv.replace(/\D/g, '').length < 3) {
      setErro('Informe um CVV com 3 ou 4 dígitos.');
      return;
    }
    executar(digitos.endsWith('0000') ? 'RECUSADO' : 'APROVADO');
  }

  async function copiarPix() {
    try {
      await navigator.clipboard.writeText(CODIGO_PIX);
      setCopiado(true);
      notificar('Código Pix copiado.', 'sucesso');
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      notificar('Não foi possível copiar automaticamente. Selecione o código manualmente.', 'erro');
    }
  }

  function formatarNumeroCartao(valorDigitado: string) {
    return valorDigitado
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function formatarValidade(valorDigitado: string) {
    const digitos = valorDigitado.replace(/\D/g, '').slice(0, 4);
    if (digitos.length <= 2) return digitos;
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  }

  return (
    <div className="payment-simulator">
      <div className="payment-gateway-head">
        <span className="gateway-mark" aria-hidden="true">
          <Icon nome="lock" tamanho={18} />
        </span>
        <div>
          <strong>Pagamento Raízes</strong>
          <small>Simulador local · sem cobrança real</small>
        </div>
        <span className="payment-total">{formatarBRL(valor)}</span>
      </div>

      {processando && (
        <div className="payment-processing" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <div>
            <strong>Processando pagamento…</strong>
            <p>A simulação está em andamento. Não feche esta página.</p>
          </div>
        </div>
      )}

      {metodo === 'pix' ? (
        <div className="pix-area">
          <div className="pix-qr" aria-hidden="true">
            {CELULAS_PIX.map((ativa, indice) => (
              <span key={indice} className={ativa ? 'qr-cell is-on' : 'qr-cell'} />
            ))}
            <span className="qr-finder qr-finder-a" />
            <span className="qr-finder qr-finder-b" />
            <span className="qr-finder qr-finder-c" />
          </div>
          <div className="pix-info">
            <h3>Pague com Pix</h3>
            <p>Escaneie o QR Code no app do seu banco ou use o código copia e cola.</p>
            <code className="pix-code">{CODIGO_PIX}</code>
            <div className="pix-actions">
              <button type="button" className="btn btn-secondary btn-small" onClick={copiarPix}>
                <Icon nome={copiado ? 'check' : 'copy'} tamanho={16} />
                {copiado ? 'Copiado' : 'Copiar código'}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={() => executar('APROVADO', 2400)}
                disabled={processando || desabilitado}
              >
                Já fiz o pagamento
              </button>
            </div>
            <small className="pix-note">O QR Code é ilustrativo. Nenhum valor é cobrado.</small>
          </div>
        </div>
      ) : (
        <form className="card-form" onSubmit={pagarCartao} noValidate>
          <div className="field">
            <label htmlFor="cartao-numero">Número do cartão</label>
            <input
              id="cartao-numero"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              value={numero}
              onChange={(evento) => setNumero(formatarNumeroCartao(evento.target.value))}
              disabled={processando}
            />
          </div>
          <div className="field">
            <label htmlFor="cartao-nome">Nome impresso no cartão</label>
            <input
              id="cartao-nome"
              autoComplete="cc-name"
              placeholder="Como está no cartão"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              disabled={processando}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="cartao-validade">Validade</label>
              <input
                id="cartao-validade"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                value={validade}
                onChange={(evento) => setValidade(formatarValidade(evento.target.value))}
                disabled={processando}
              />
            </div>
            <div className="field">
              <label htmlFor="cartao-cvv">CVV</label>
              <input
                id="cartao-cvv"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                value={cvv}
                onChange={(evento) => setCvv(evento.target.value.replace(/\D/g, '').slice(0, 4))}
                disabled={processando}
              />
            </div>
          </div>

          {erro && (
            <p className="form-error" role="alert">
              {erro}
            </p>
          )}

          <p className="card-note">
            <Icon nome="lock" tamanho={14} /> Dados de teste. Nada é armazenado. Use um número
            terminado em 0000 para simular recusa.
          </p>

          <button type="submit" className="btn btn-primary btn-block" disabled={processando || desabilitado}>
            Pagar {formatarBRL(valor)}
          </button>
        </form>
      )}

      <div className="test-panel">
        <p>
          <strong>Ambiente de teste</strong> — nenhum pagamento real é processado.
        </p>
        <div className="test-actions">
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => executar('APROVADO', 1200)}
            disabled={processando || desabilitado}
          >
            Forçar aprovação
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => executar('RECUSADO', 1200)}
            disabled={processando || desabilitado}
          >
            Forçar recusa
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => executar('EXPIRADO', 1200)}
            disabled={processando || desabilitado}
          >
            Simular timeout
          </button>
        </div>
      </div>
    </div>
  );
}
