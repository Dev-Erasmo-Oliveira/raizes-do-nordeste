import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { QuantityStepper } from '../components/QuantityStepper';
import { formatarBRL } from '../lib/format';
import { precoUnitario } from '../lib/pricing';
import { disponivelNaUnidade, getProduto } from '../mocks';
import { RULES } from '../config/rules';

const ROTULOS_TAGS: Record<string, string> = {
  vegetariano: 'Vegetariano',
  picante: 'Picante',
  promocao: 'Promoção',
};

export function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { unidade, unidadeId, adicionarAoCarrinho } = useApp();

  const produto = id ? getProduto(id) : null;
  const [adicionais, setAdicionais] = useState<string[]>([]);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');

  if (!produto) {
    return (
      <div className="container page">
        <EmptyState
          icone="search"
          titulo="Produto não encontrado"
          descricao="O item que você tentou abrir não existe ou saiu do cardápio."
        >
          <Link to="/cardapio" className="btn btn-primary">
            Voltar ao cardápio
          </Link>
        </EmptyState>
      </div>
    );
  }

  const disponivel = disponivelNaUnidade(produto, unidadeId);
  const unidadeAberta = unidade?.aberta ?? false;
  const preco = precoUnitario(produto, adicionais);
  const total = preco * quantidade;
  const tags = produto.tags.filter((tag) => ROTULOS_TAGS[tag]);

  function alternarAdicional(adicionalId: string) {
    setErro('');
    setAdicionais((atuais) => {
      if (atuais.includes(adicionalId)) {
        return atuais.filter((item) => item !== adicionalId);
      }
      if (atuais.length >= produto!.addonMax) {
        setErro(`Escolha no máximo ${produto!.addonMax} adicionais.`);
        return atuais;
      }
      return [...atuais, adicionalId];
    });
  }

  function adicionar() {
    if (!unidade) {
      setErro('Escolha uma unidade antes de adicionar o item.');
      return;
    }
    if (!unidadeAberta) {
      setErro('A unidade selecionada está fechada. Escolha outra unidade para pedir.');
      return;
    }
    if (!disponivel) {
      setErro('Este item não está disponível nesta unidade.');
      return;
    }
    if (adicionais.length < produto!.addonMin) {
      setErro(`Escolha pelo menos ${produto!.addonMin} adicional(is).`);
      return;
    }
    const ok = adicionarAoCarrinho(produto!.id, adicionais, quantidade, observacao);
    if (ok) navigate('/carrinho');
  }

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/cardapio">Cardápio</Link>
        <span aria-hidden="true">/</span>
        <span>{produto.nome}</span>
      </nav>

      <div className="product-detail">
        <div className="product-detail-info">
          <div className="product-detail-head">
            <div>
              {tags.length > 0 && (
                <ul className="product-tags">
                  {tags.map((tag) => (
                    <li key={tag}>{ROTULOS_TAGS[tag]}</li>
                  ))}
                </ul>
              )}
              <h1>{produto.nome}</h1>
              <p>{produto.descricao}</p>
            </div>
            <div className="product-detail-price">
              {produto.precoAntigo && <s>{formatarBRL(produto.precoAntigo)}</s>}
              <strong>{formatarBRL(produto.preco)}</strong>
            </div>
          </div>

          {!unidade && (
            <div className="alert alert-info">
              <Icon nome="pin" tamanho={18} />
              <p>
                Selecione uma unidade para confirmar a disponibilidade e liberar o pedido.{' '}
                <Link to="/unidades">Escolher unidade</Link>
              </p>
            </div>
          )}

          {unidade && !unidadeAberta && (
            <div className="alert alert-warning">
              <Icon nome="clock" tamanho={18} />
              <p>
                <strong>{unidade.nome}</strong> está fechada. Você pode montar o carrinho, mas não
                poderá finalizar o pedido.
              </p>
            </div>
          )}

          {unidade && unidadeAberta && !disponivel && (
            <div className="alert alert-error">
              <Icon nome="x" tamanho={18} />
              <p>Este item não está disponível em {unidade.nome}.</p>
            </div>
          )}

          {produto.addonMax > 0 && (
            <fieldset className="addon-group">
              <legend>
                Adicionais{' '}
                <small>
                  {produto.addonMin > 0 ? `Escolha de ${produto.addonMin}` : 'Até'}{' '}
                  {produto.addonMax > produto.addonMin ? `a ${produto.addonMax}` : ''} · opcional
                </small>
              </legend>
              {produto.adicionais.map((adicional) => {
                const marcado = adicionais.includes(adicional.id);
                return (
                  <label key={adicional.id} className={`addon-option ${marcado ? 'is-checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternarAdicional(adicional.id)}
                    />
                    <span>{adicional.nome}</span>
                    <strong>+ {formatarBRL(adicional.preco)}</strong>
                  </label>
                );
              })}
            </fieldset>
          )}

          <div className="field">
            <label htmlFor="observacao">Observação para a cozinha</label>
            <textarea
              id="observacao"
              rows={3}
              maxLength={140}
              placeholder="Ex.: sem cebola, ponto da carne, embalar separado…"
              value={observacao}
              onChange={(evento) => setObservacao(evento.target.value)}
            />
            <small className="field-hint">{observacao.length}/140</small>
          </div>

          {erro && (
            <p className="form-error" role="alert">
              {erro}
            </p>
          )}

          <div className="buy-bar">
            <QuantityStepper
              valor={quantidade}
              onMudar={setQuantidade}
              max={RULES.maxItensPorProduto}
              rotulo="Quantidade do item"
            />
            <div className="buy-total">
              <small>Total do item</small>
              <strong>{formatarBRL(total)}</strong>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={adicionar}
              disabled={!unidade || !unidadeAberta || !disponivel}
            >
              <Icon nome="cart" tamanho={18} /> Adicionar ao carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
