import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { copiarTexto } from '../lib/clipboard';
import { formatarBRL, formatarData } from '../lib/format';
import { RECOMPENSAS } from '../mocks';

export function Loyalty() {
  const { usuario, resgatarRecompensa, cuponsUsados, notificar } = useApp();

  if (!usuario) return null;

  const proxima = RECOMPENSAS.filter((item) => item.custoPontos > usuario.pontos).sort(
    (a, b) => a.custoPontos - b.custoPontos,
  )[0];
  const progresso = proxima
    ? Math.min(100, Math.round((usuario.pontos / proxima.custoPontos) * 100))
    : 100;
  const cuponsAtivos = usuario.cupons.filter((cupom) => !cuponsUsados.includes(cupom.codigo));

  async function copiar(codigo: string) {
    const ok = await copiarTexto(codigo);
    notificar(
      ok ? `Cupom ${codigo} copiado.` : 'Não foi possível copiar. Selecione o código manualmente.',
      ok ? 'sucesso' : 'erro',
    );
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Clube Raízes</span>
          <h1>Seus pontos</h1>
          <p>Ganhe pontos a cada pedido pago e troque por descontos reais no checkout.</p>
        </div>
        <Link to="/cardapio" className="btn btn-primary btn-small">
          Fazer um pedido
        </Link>
      </div>

      <div className="loyalty-hero">
        <div className="loyalty-balance">
          <span className="loyalty-label">Saldo disponível</span>
          <strong>{usuario.pontos}</strong>
          <span className="loyalty-label">pontos</span>
          <p>Equivalem a {formatarBRL(usuario.pontos * 0.1)} em descontos.</p>
        </div>
        <div className="loyalty-progress">
          <div className="loyalty-progress-head">
            <strong>{proxima ? proxima.nome : 'Todas as recompensas liberadas'}</strong>
            <span>{proxima ? `${usuario.pontos}/${proxima.custoPontos} pts` : '100%'}</span>
          </div>
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={progresso}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso até a próxima recompensa"
          >
            <span style={{ width: `${progresso}%` }} />
          </div>
          <p>
            {proxima
              ? `Faltam ${proxima.custoPontos - usuario.pontos} pontos para resgatar esta recompensa.`
              : 'Você pode resgatar qualquer recompensa do catálogo.'}
          </p>
          <ul className="loyalty-rules">
            <li>
              <Icon nome="check" tamanho={16} /> 1 ponto por R$ 1 pago
            </li>
            <li>
              <Icon nome="check" tamanho={16} /> 100 pontos = R$ 10
            </li>
            <li>
              <Icon nome="check" tamanho={16} /> Resgate de até 50% do subtotal
            </li>
          </ul>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Recompensas</span>
            <h2>Troque seus pontos</h2>
          </div>
        </div>
        <div className="reward-grid">
          {RECOMPENSAS.map((recompensa) => {
            const podeResgatar = usuario.pontos >= recompensa.custoPontos;
            return (
              <article
                key={recompensa.id}
                className={`reward-card ${podeResgatar ? '' : 'is-locked'}`}
              >
                <span className="reward-cost">{recompensa.custoPontos} pts</span>
                <h3>{recompensa.nome}</h3>
                <p>{recompensa.descricao}</p>
                <button
                  type="button"
                  className={`btn ${podeResgatar ? 'btn-primary' : 'btn-ghost'} btn-small`}
                  onClick={() => resgatarRecompensa(recompensa.id)}
                  disabled={!podeResgatar}
                >
                  {podeResgatar
                    ? 'Resgatar'
                    : `Faltam ${recompensa.custoPontos - usuario.pontos} pts`}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <div className="loyalty-columns">
        <section className="panel" aria-labelledby="extrato-title">
          <div className="panel-head">
            <h2 id="extrato-title">Extrato de pontos</h2>
          </div>
          {usuario.extrato.length === 0 ? (
            <p className="panel-sub">Seu primeiro pedido pago vai gerar pontos aqui.</p>
          ) : (
            <ul className="statement-list">
              {usuario.extrato.map((lancamento) => {
                const valor =
                  lancamento.tipo === 'resgate' ? -lancamento.pontos : lancamento.pontos;
                return (
                  <li key={lancamento.id}>
                    <span
                      className={`statement-icon statement-${lancamento.tipo}`}
                      aria-hidden="true"
                    >
                      <Icon
                        nome={
                          lancamento.tipo === 'ganho'
                            ? 'plus'
                            : lancamento.tipo === 'resgate'
                              ? 'ticket'
                              : 'chart'
                        }
                        tamanho={16}
                      />
                    </span>
                    <div>
                      <strong>{lancamento.descricao}</strong>
                      <small>{formatarData(lancamento.data)}</small>
                    </div>
                    <span className={valor >= 0 ? 'statement-positive' : 'statement-negative'}>
                      {valor > 0 ? '+' : ''}
                      {valor} pts
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="panel" aria-labelledby="cupons-title">
          <div className="panel-head">
            <h2 id="cupons-title">Meus cupons</h2>
          </div>
          {cuponsAtivos.length === 0 ? (
            <p className="panel-sub">
              Nenhum cupom ativo. Resgate uma recompensa para gerar um cupom.
            </p>
          ) : (
            <ul className="my-coupons">
              {cuponsAtivos.map((cupom) => (
                <li key={cupom.codigo}>
                  <div>
                    <strong>{cupom.codigo}</strong>
                    <small>
                      {cupom.descricao} · válido até {formatarData(`${cupom.validade}T12:00:00`)}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Copiar cupom ${cupom.codigo}`}
                    onClick={() => copiar(cupom.codigo)}
                  >
                    <Icon nome="copy" tamanho={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="panel-footnote">
            Aplique o código no checkout em “Cupom e pontos”.
          </p>
        </section>
      </div>
    </div>
  );
}
