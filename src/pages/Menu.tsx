import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { normalizarTexto } from '../lib/format';
import { CATEGORIAS, PRODUTOS } from '../mocks';

type Filtro = 'todos' | 'vegetariano' | 'picante' | 'promocao';

const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'vegetariano', rotulo: 'Vegetariano' },
  { id: 'picante', rotulo: 'Picante' },
  { id: 'promocao', rotulo: 'Promoções' },
];

export function Menu() {
  const { unidade, unidadeId } = useApp();
  const [params, setParams] = useSearchParams();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const categoria = params.get('categoria');
  const categoriaValida = CATEGORIAS.some((item) => item.id === categoria) ? categoria : null;

  const produtos = useMemo(() => {
    const termo = normalizarTexto(busca);
    return PRODUTOS.filter((produto) => {
      if (categoriaValida && produto.categoriaId !== categoriaValida) return false;
      if (filtro !== 'todos' && !produto.tags.includes(filtro)) return false;
      if (termo && !normalizarTexto(`${produto.nome} ${produto.descricao}`).includes(termo)) {
        return false;
      }
      return true;
    });
  }, [busca, categoriaValida, filtro]);

  function selecionarCategoria(id: string | null) {
    if (id) setParams({ categoria: id });
    else setParams({});
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Cardápio</span>
          <h1>O que vai hoje?</h1>
          <p>
            {unidade ? (
              <>
                Exibindo o cardápio de <strong>{unidade.nome}</strong>. Itens sem disponibilidade
                aparecem sinalizados.
              </>
            ) : (
              'Escolha uma unidade para ver a disponibilidade real de cada item.'
            )}
          </p>
        </div>
      </div>

      {!unidade && (
        <div className="alert alert-info">
          <Icon nome="pin" tamanho={18} />
          <p>
            Nenhuma unidade selecionada. Você pode navegar, mas precisa escolher uma unidade para
            adicionar itens ao carrinho.
          </p>
        </div>
      )}

      {unidade && !unidade.aberta && (
        <div className="alert alert-warning">
          <Icon nome="clock" tamanho={18} />
          <p>
            <strong>{unidade.nome}</strong> está fechada agora. Você pode montar o carrinho, mas o
            checkout ficará bloqueado até escolher uma unidade aberta.
          </p>
        </div>
      )}

      <div className="menu-toolbar">
        <div className="search-field">
          <Icon nome="search" tamanho={18} />
          <label className="sr-only" htmlFor="busca-cardapio">
            Buscar no cardápio
          </label>
          <input
            id="busca-cardapio"
            type="search"
            placeholder="Buscar tapioca, cuscuz, suco…"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
        <div className="filter-row" role="group" aria-label="Filtros do cardápio">
          {FILTROS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`filter-chip ${filtro === item.id ? 'is-active' : ''}`}
              aria-pressed={filtro === item.id}
              onClick={() => setFiltro(item.id)}
            >
              {item.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="category-tabs" role="tablist" aria-label="Categorias">
        <button
          type="button"
          role="tab"
          aria-selected={!categoriaValida}
          className={`category-tab ${!categoriaValida ? 'is-active' : ''}`}
          onClick={() => selecionarCategoria(null)}
        >
          Tudo
        </button>
        {CATEGORIAS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={categoriaValida === item.id}
            className={`category-tab ${categoriaValida === item.id ? 'is-active' : ''}`}
            onClick={() => selecionarCategoria(item.id)}
          >
            {item.nome}
          </button>
        ))}
      </div>

      <p className="menu-count" aria-live="polite">
        {produtos.length} {produtos.length === 1 ? 'item encontrado' : 'itens encontrados'}
      </p>

      {produtos.length === 0 ? (
        <EmptyState
          icone="search"
          titulo="Nada encontrado"
          descricao="Tente outro termo ou remova os filtros para ver o cardápio completo."
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setBusca('');
              setFiltro('todos');
              selecionarCategoria(null);
            }}
          >
            Limpar busca e filtros
          </button>
        </EmptyState>
      ) : (
        <>
          <h2 className="sr-only">Itens do cardápio</h2>
          <div className="product-grid">
            {produtos.map((produto) => (
              <ProductCard key={produto.id} produto={produto} unidadeId={unidadeId} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
