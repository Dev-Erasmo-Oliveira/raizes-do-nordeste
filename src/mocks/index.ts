import type { Categoria, Produto, Unidade } from '../types';
import { CATEGORIAS } from './categorias';
import { CUPONS } from './cupons';
import { PRODUTOS } from './produtos';
import { RECOMPENSAS } from './recompensas';
import { UNIDADES } from './unidades';

export { CATEGORIAS, CUPONS, PRODUTOS, RECOMPENSAS, UNIDADES };

export function getUnidade(id?: string | null): Unidade | null {
  if (!id) return null;
  return UNIDADES.find((unidade) => unidade.id === id) ?? null;
}

export function getProduto(id: string): Produto | null {
  return PRODUTOS.find((produto) => produto.id === id) ?? null;
}

export function getCategoria(id: string): Categoria | null {
  return CATEGORIAS.find((categoria) => categoria.id === id) ?? null;
}

export function disponivelNaUnidade(produto: Produto, unidadeId: string | null): boolean {
  if (!unidadeId) return true;
  return produto.disponivelPorUnidade[unidadeId] !== false;
}

export function produtosDaCategoria(categoriaId: string): Produto[] {
  return PRODUTOS.filter((produto) => produto.categoriaId === categoriaId);
}

export function maisPedidos(): Produto[] {
  return PRODUTOS.filter((produto) => produto.destaque).slice(0, 4);
}
