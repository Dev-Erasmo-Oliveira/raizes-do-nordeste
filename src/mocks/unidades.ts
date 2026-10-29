import type { Unidade } from '../types';

export const UNIDADES: Unidade[] = [
  {
    id: 'u-recife',
    nome: 'Raízes — Boa Viagem',
    endereco: 'Av. Conselheiro Aguiar, 1450 — Boa Viagem',
    cidade: 'Recife — PE',
    horario: 'Todos os dias, das 7h às 22h',
    aberta: true,
  },
  {
    id: 'u-fortaleza',
    nome: 'Raízes — Meireles',
    endereco: 'Rua Ana Bilhar, 820 — Meireles',
    cidade: 'Fortaleza — CE',
    horario: 'Todos os dias, das 8h às 21h',
    aberta: true,
  },
  {
    id: 'u-natal',
    nome: 'Raízes — Ponta Negra',
    endereco: 'Av. Engenheiro Roberto Freire, 1962 — Ponta Negra',
    cidade: 'Natal — RN',
    horario: 'Todos os dias, das 8h às 20h',
    aberta: false,
  },
];
