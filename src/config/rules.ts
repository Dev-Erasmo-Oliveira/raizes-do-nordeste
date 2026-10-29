export const RULES = {
  /** Pontos ganhos por real pago. */
  pontosPorReal: 1,
  /** Valor, em reais, de cada ponto no momento do resgate. */
  valorPonto: 0.1,
  /** Percentual maximo do subtotal que pode ser pago com pontos. */
  limiteResgateSubtotal: 0.5,
  /** Antecedencia minima para retirada, em minutos. */
  antecedenciaMinimaMin: 20,
  /** Intervalo entre horarios de retirada, em minutos. */
  slotMinutos: 15,
  /** Quantidade maxima do mesmo item no carrinho. */
  maxItensPorProduto: 20,
  /** Versao vigente do termo de privacidade. */
  versaoTermos: '2026-1',
  /** Validade padrao dos cupons gerados por resgate, em dias. */
  validadeResgateDias: 30,
} as const;

export const DEMO = {
  email: 'cliente@raizes.com',
  senha: 'raizes123',
} as const;

export const WHATSAPP_SUPORTE = '(81) 4000-2026';
export const EMAIL_ENCARREGADO = 'privacidade@raizesdonordeste.com.br';
