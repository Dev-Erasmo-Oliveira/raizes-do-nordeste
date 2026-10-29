import { Link } from 'react-router-dom';
import { formatarBRL } from '../lib/format';
import { disponivelNaUnidade } from '../mocks';
import type { Produto } from '../types';

const ROTULOS_TAGS: Record<string, string> = {
  vegetariano: 'Vegetariano',
  picante: 'Picante',
  promocao: 'Promoção',
};

interface ProductCardProps {
  produto: Produto;
  unidadeId: string | null;
}

export function ProductCard({ produto, unidadeId }: ProductCardProps) {
  const disponivel = disponivelNaUnidade(produto, unidadeId);
  const tags = produto.tags.filter((tag) => ROTULOS_TAGS[tag]);

  return (
    <Link
      to={`/produto/${produto.id}`}
      className={`product-card ${disponivel ? '' : 'is-unavailable'}`}
    >
      <div className="product-body">
        {produto.selo && <span className="product-selo">{produto.selo}</span>}
        <h3>{produto.nome}</h3>
        <p>{produto.descricao}</p>
        {tags.length > 0 && (
          <ul className="product-tags" aria-label="Características">
            {tags.map((tag) => (
              <li key={tag}>{ROTULOS_TAGS[tag]}</li>
            ))}
          </ul>
        )}
        <div className="product-price">
          {produto.precoAntigo && <s>{formatarBRL(produto.precoAntigo)}</s>}
          <strong>{formatarBRL(produto.preco)}</strong>
        </div>
        {!disponivel && <span className="product-off">Indisponível nesta unidade</span>}
      </div>
    </Link>
  );
}
