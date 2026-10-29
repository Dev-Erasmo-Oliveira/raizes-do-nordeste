import type { Recompensa } from '../types';

export const RECOMPENSAS: Recompensa[] = [
  {
    id: 'rec-5',
    nome: 'R$ 5 de desconto',
    descricao: 'Cupom de R$ 5 para usar em pedidos acima de R$ 20.',
    custoPontos: 50,
    tipo: 'fixo',
    valor: 5,
    minimo: 20,
  },
  {
    id: 'rec-10',
    nome: 'R$ 10 de desconto',
    descricao: 'Cupom de R$ 10 para usar em pedidos acima de R$ 30.',
    custoPontos: 100,
    tipo: 'fixo',
    valor: 10,
    minimo: 30,
  },
  {
    id: 'rec-rolo',
    nome: 'Bolo de rolo por nossa conta',
    descricao: 'Cupom equivalente a uma fatia de bolo de rolo em pedidos acima de R$ 25.',
    custoPontos: 150,
    tipo: 'fixo',
    valor: 9.9,
    minimo: 25,
  },
  {
    id: 'rec-30',
    nome: 'R$ 30 de desconto',
    descricao: 'Cupom de R$ 30 para usar em pedidos acima de R$ 80.',
    custoPontos: 250,
    tipo: 'fixo',
    valor: 30,
    minimo: 80,
  },
];
