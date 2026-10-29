import { RULES } from '../config/rules';
import type { Carrinho, Cupom, ItemCarrinho, Produto } from '../types';

export interface ResultadoCupom {
  ok: boolean;
  cupom?: Cupom;
  desconto?: number;
  erro?: string;
}

export function precoAdicionais(produto: Produto, ids: string[]): number {
  return ids.reduce((total, id) => {
    const adicional = produto.adicionais.find((item) => item.id === id);
    return total + (adicional?.preco ?? 0);
  }, 0);
}

export function precoUnitario(produto: Produto, ids: string[]): number {
  return arredondar(produto.preco + precoAdicionais(produto, ids));
}

export function totalItem(item: ItemCarrinho, produtos: Produto[]): number {
  const produto = produtos.find((p) => p.id === item.produtoId);
  if (!produto) return 0;
  return arredondar(precoUnitario(produto, item.adicionais) * item.quantidade);
}

export function subtotalCarrinho(itens: ItemCarrinho[], produtos: Produto[]): number {
  return arredondar(itens.reduce((total, item) => total + totalItem(item, produtos), 0));
}

export function quantidadeNoCarrinho(carrinho: Carrinho): number {
  return carrinho.itens.reduce((total, item) => total + item.quantidade, 0);
}

export function descontoDoCupom(cupom: Cupom, subtotal: number): number {
  const bruto =
    cupom.tipo === 'percentual' ? (subtotal * cupom.valor) / 100 : Math.min(cupom.valor, subtotal);
  return arredondar(Math.max(0, bruto));
}

export function validarCupom(
  codigo: string,
  subtotal: number,
  cuponsUsados: string[],
  cuponsDisponiveis: Cupom[],
): ResultadoCupom {
  const normalizado = codigo.trim().toUpperCase();
  if (!normalizado) return { ok: false, erro: 'Informe um código de cupom.' };

  const cupom = cuponsDisponiveis.find((item) => item.codigo.toUpperCase() === normalizado);
  if (!cupom) return { ok: false, erro: 'Cupom não encontrado. Confira o código digitado.' };

  if (cuponsUsados.some((usado) => usado.toUpperCase() === normalizado)) {
    return { ok: false, erro: 'Este cupom já foi utilizado.' };
  }

  const fimDaValidade = new Date(`${cupom.validade}T23:59:59`);
  if (Number.isFinite(fimDaValidade.getTime()) && fimDaValidade.getTime() < Date.now()) {
    return { ok: false, erro: 'Este cupom está expirado.' };
  }

  if (subtotal < cupom.minimo) {
    return {
      ok: false,
      erro: `Este cupom exige um valor mínimo de ${formatarParaErro(cupom.minimo)}.`,
    };
  }

  return { ok: true, cupom, desconto: descontoDoCupom(cupom, subtotal) };
}

export function limiteDePontos(subtotal: number, saldo: number): number {
  const limitePorPercentual = Math.floor(
    (subtotal * RULES.limiteResgateSubtotal) / RULES.valorPonto,
  );
  return Math.max(0, Math.min(saldo, limitePorPercentual));
}

export function descontoDePontos(pontos: number): number {
  return arredondar(Math.max(0, pontos) * RULES.valorPonto);
}

export function chaveDoItem(produtoId: string, adicionais: string[], observacao: string): string {
  const ordenados = [...adicionais].sort().join('+');
  return `${produtoId}|${ordenados}|${observacao.trim().toLowerCase()}`;
}

export function gerarCodigoPedido(codigosExistentes: string[]): string {
  for (let tentativa = 0; tentativa < 50; tentativa += 1) {
    const codigo = `RZ-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!codigosExistentes.includes(codigo)) return codigo;
  }
  return `RZ-${Date.now().toString().slice(-5)}`;
}

export function arredondar(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function formatarParaErro(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
