import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { formatarBRL, formatarData } from '../lib/format';
import { copiarTexto } from '../lib/clipboard';
import { CUPONS, RECOMPENSAS } from '../mocks';

export function Promotions() {
  const { cuponsUsados, notificar } = useApp();

  async function copiar(codigo: string) {
    const ok = await copiarTexto(codigo);
    notificar(
      ok ? `Cupom ${codigo} copiado.` : 'Não foi possível copiar. Selecione o código manualmente.',
      ok ? 'sucesso' : 'erro',
    );
  }

  function situacaoDoCupom(codigo: string, validade: string) {
    if (cuponsUsados.includes(codigo)) return 'utilizado';
    if (new Date(`${validade}T23:59:59`).getTime() < Date.now()) return 'expirado';
    return 'disponivel';
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Promoções</span>
          <h1>Campanhas e cupons</h1>
          <p>Ofertas ativas na rede. Aplique o cupom no checkout do seu pedido.</p>
        </div>
        <Link to="/cardapio" className="btn btn-primary btn-small">
          Pedir agora
        </Link>
      </div>

      <div className="campaign-grid">
        <article className="campaign-card campaign-1">
          <span className="campaign-tag">Combo</span>
          <h2>Combo Nordeste</h2>
          <p>Cuscuz nordestino, café coado e bolo de rolo por R$ 29,90.</p>
          <Link to="/produto/combo-nordeste">Pedir combo</Link>
        </article>
        <article className="campaign-card campaign-2">
          <span className="campaign-tag">Clube</span>
          <h2>100 pontos = R$ 10</h2>
          <p>Junte pontos em cada pedido e troque por descontos.</p>
          <Link to="/fidelidade">Ver fidelidade</Link>
        </article>
        <article className="campaign-card campaign-3">
          <span className="campaign-tag">Primeira compra</span>
          <h2>15% com BEMVINDO15</h2>
          <p>Válido em pedidos acima de R$ 40. Um uso por cliente.</p>
          <Link to="/cardapio">Começar pedido</Link>
        </article>
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Cupons</span>
            <h2>Códigos disponíveis</h2>
          </div>
        </div>
        <div className="coupon-grid">
          {CUPONS.map((cupom) => {
            const situacao = situacaoDoCupom(cupom.codigo, cupom.validade);
            return (
              <article
                key={cupom.codigo}
                className={`coupon-card ${situacao !== 'disponivel' ? 'is-inactive' : ''}`}
              >
                <div className="coupon-card-top">
                  <span className="coupon-code">
                    <Icon nome="ticket" tamanho={16} /> {cupom.codigo}
                  </span>
                  <span
                    className={`badge ${
                      situacao === 'disponivel'
                        ? 'badge-concluido'
                        : situacao === 'utilizado'
                          ? 'badge-neutro'
                          : 'badge-erro'
                    }`}
                  >
                    {situacao === 'disponivel'
                      ? 'Disponível'
                      : situacao === 'utilizado'
                        ? 'Utilizado'
                        : 'Expirado'}
                  </span>
                </div>
                <p>{cupom.descricao}</p>
                <ul className="coupon-meta">
                  <li>
                    Desconto:{' '}
                    {cupom.tipo === 'percentual'
                      ? `${cupom.valor}%`
                      : formatarBRL(cupom.valor)}
                  </li>
                  <li>Mínimo: {formatarBRL(cupom.minimo)}</li>
                  <li>Validade: {formatarData(`${cupom.validade}T12:00:00`)}</li>
                </ul>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => copiar(cupom.codigo)}
                  disabled={situacao !== 'disponivel'}
                >
                  <Icon nome="copy" tamanho={16} /> Copiar código
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Recompensas</span>
            <h2>Troque pontos por cupons</h2>
          </div>
          <Link to="/fidelidade" className="link-arrow">
            Meu clube <Icon nome="arrow-right" tamanho={16} />
          </Link>
        </div>
        <div className="reward-grid">
          {RECOMPENSAS.map((recompensa) => (
            <div key={recompensa.id} className="reward-card">
              <span className="reward-cost">{recompensa.custoPontos} pts</span>
              <h3>{recompensa.nome}</h3>
              <p>{recompensa.descricao}</p>
              <Link to="/fidelidade" className="link-arrow">
                Resgatar no clube
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="page-note">
        <Icon nome="info" tamanho={16} />
        <p>
          Um cupom por pedido. Cupons não são cumulativos entre si, mas podem ser combinados com
          pontos de fidelidade.
        </p>
      </div>
    </div>
  );
}
