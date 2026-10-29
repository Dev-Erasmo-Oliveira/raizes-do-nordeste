import type { Cupom } from '../types';

export const CUPONS: Cupom[] = [
  {
    codigo: 'RAIZES10',
    tipo: 'percentual',
    valor: 10,
    minimo: 30,
    validade: '2026-12-31',
    usoUnico: true,
    descricao: '10% de desconto em pedidos acima de R$ 30.',
  },
  {
    codigo: 'NORDESTE5',
    tipo: 'fixo',
    valor: 5,
    minimo: 25,
    validade: '2026-12-31',
    usoUnico: true,
    descricao: 'R$ 5 de desconto em pedidos acima de R$ 25.',
  },
  {
    codigo: 'BEMVINDO15',
    tipo: 'percentual',
    valor: 15,
    minimo: 40,
    validade: '2026-12-31',
    usoUnico: true,
    descricao: '15% de desconto no primeiro pedido acima de R$ 40.',
  },
  {
    codigo: 'EXPIRADO2024',
    tipo: 'percentual',
    valor: 10,
    minimo: 0,
    validade: '2024-12-31',
    usoUnico: true,
    descricao: 'Cupom de teste: expirado de propósito.',
  },
];
