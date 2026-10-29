import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { UNIDADES } from '../mocks';

export function Units() {
  const { unidadeId, carrinho, selecionarUnidade } = useApp();
  const navigate = useNavigate();

  function escolher(id: string) {
    selecionarUnidade(id);
    navigate('/cardapio');
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Unidades</span>
          <h1>Onde você quer retirar?</h1>
          <p>Cada unidade tem cardápio, disponibilidade e horário próprios.</p>
        </div>
        <Link to="/cardapio" className="btn btn-ghost">
          <Icon nome="arrow-left" tamanho={18} /> Voltar ao cardápio
        </Link>
      </div>

      {carrinho.itens.length > 0 && (
        <div className="alert alert-info">
          <Icon nome="info" tamanho={18} />
          <p>
            Você tem itens no carrinho. Ao trocar de unidade, o carrinho será esvaziado para não
            misturar cardápios.
          </p>
        </div>
      )}

      <div className="unit-grid">
        {UNIDADES.map((loja) => {
          const selecionada = loja.id === unidadeId;
          return (
            <article key={loja.id} className={`unit-card ${selecionada ? 'is-selected' : ''}`}>
              <div className="unit-card-head">
                <span className="unit-city">{loja.cidade}</span>
                <span className={`badge ${loja.aberta ? 'badge-concluido' : 'badge-erro'}`}>
                  {loja.aberta ? 'Aberto agora' : 'Fechado'}
                </span>
              </div>
              <h2>{loja.nome}</h2>
              <p className="unit-address">
                <Icon nome="pin" tamanho={16} /> {loja.endereco}
              </p>
              <p className="unit-hours">
                <Icon nome="clock" tamanho={16} /> {loja.horario}
              </p>
              {!loja.aberta && (
                <p className="unit-closed-note">
                  Esta unidade está fechada. Você pode navegar, mas não finalizar pedidos.
                </p>
              )}
              <div className="unit-card-actions">
                {selecionada ? (
                  <>
                    <span className="unit-selected">
                      <Icon nome="check" tamanho={16} /> Unidade selecionada
                    </span>
                    <Link to="/cardapio" className="btn btn-primary btn-small">
                      Ver cardápio
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-small"
                    onClick={() => escolher(loja.id)}
                  >
                    Selecionar unidade
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="page-note">
        <Icon nome="info" tamanho={16} />
        <p>
          A unidade de Natal está fechada de propósito no mock, para demonstrar o bloqueio de
          checkout. Selecione Recife ou Fortaleza para concluir um pedido.
        </p>
      </div>
    </div>
  );
}
