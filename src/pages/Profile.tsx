import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { RULES } from '../config/rules';
import { formatarData } from '../lib/format';

export function Profile() {
  const {
    usuario,
    pedidos,
    consentimento,
    atualizarPerfil,
    atualizarMarketing,
    excluirConta,
    sair,
    notificar,
  } = useApp();
  const navigate = useNavigate();

  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [telefone, setTelefone] = useState(usuario?.telefone ?? '');
  const [modalExclusao, setModalExclusao] = useState(false);
  const [textoExclusao, setTextoExclusao] = useState('');

  if (!usuario) return null;

  const meusPedidos = pedidos.filter(
    (pedido) =>
      pedido.clienteId === usuario.id ||
      pedido.clienteEmail?.toLowerCase() === usuario.email.toLowerCase(),
  );

  function salvarDados(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (nome.trim().length < 2) {
      notificar('Informe seu nome completo.', 'erro');
      return;
    }
    if (telefone.replace(/\D/g, '').length < 10) {
      notificar('Informe um telefone com DDD.', 'erro');
      return;
    }
    atualizarPerfil({ nome, telefone });
  }

  function exportarDados() {
    const dados = {
      geradoEm: new Date().toISOString(),
      versaoTermo: RULES.versaoTermos,
      usuario: {
        id: usuario!.id,
        nome: usuario!.nome,
        email: usuario!.email,
        telefone: usuario!.telefone,
        pontos: usuario!.pontos,
        consentimentos: usuario!.consentimentos,
        criadoEm: usuario!.criadoEm,
      },
      consentimento,
      pedidos: meusPedidos,
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meus-dados-raizes-${usuario!.id}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notificar('Arquivo com seus dados foi gerado.', 'sucesso');
  }

  function sairDaConta() {
    sair();
    navigate('/');
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Minha conta</span>
          <h1>Olá, {usuario.nome.split(' ')[0]}</h1>
          <p>
            Membro desde {formatarData(usuario.criadoEm)} · {meusPedidos.length}{' '}
            {meusPedidos.length === 1 ? 'pedido' : 'pedidos'} · {usuario.pontos} pontos
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-small" onClick={sairDaConta}>
          <Icon nome="logout" tamanho={16} /> Sair da conta
        </button>
      </div>

      <div className="profile-grid">
        <section className="panel" aria-labelledby="dados-pessoais">
          <h2 id="dados-pessoais">Dados pessoais</h2>
          <p className="panel-sub">
            Mantenha seus dados atualizados para agilizar a retirada no balcão.
          </p>
          <form onSubmit={salvarDados}>
            <div className="field">
              <label htmlFor="perfil-nome">Nome completo</label>
              <input
                id="perfil-nome"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label htmlFor="perfil-telefone">Telefone</label>
              <input
                id="perfil-telefone"
                value={telefone}
                onChange={(evento) => setTelefone(evento.target.value)}
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
            <div className="field">
              <label htmlFor="perfil-email">E-mail</label>
              <input id="perfil-email" value={usuario.email} readOnly disabled />
              <small className="field-hint">
                O e-mail é o identificador da conta e não pode ser alterado neste protótipo.
              </small>
            </div>
            <button type="submit" className="btn btn-primary">
              Salvar alterações
            </button>
          </form>
        </section>

        <section className="panel" aria-labelledby="consentimentos">
          <h2 id="consentimentos">Privacidade e consentimentos</h2>
          <p className="panel-sub">
            Você controla o que pode ser feito com seus dados. Essenciais permanecem ativos para o
            funcionamento da conta e dos pedidos.
          </p>

          <div className="consent-status">
            <div>
              <strong>Dados essenciais</strong>
              <small>Obrigatórios para login, carrinho, pedidos e suporte.</small>
            </div>
            <span className="badge badge-concluido">Ativos</span>
          </div>

          <div className="consent-status">
            <div>
              <strong>Análise de uso</strong>
              <small>
                {consentimento?.analytics
                  ? 'Autorizada. Ajuda a melhorar a experiência.'
                  : 'Não autorizada.'}
              </small>
            </div>
            <Link to="/privacidade" className="btn btn-ghost btn-small">
              Alterar
            </Link>
          </div>

          <label className="consent-status consent-status-toggle">
            <div>
              <strong>Preferência de marketing</strong>
              <small>
                Novidades e promoções por e-mail. A escolha fica local; não há envio no protótipo.
              </small>
            </div>
            <input
              type="checkbox"
              checked={usuario.consentimentos.marketing}
              onChange={(evento) => atualizarMarketing(evento.target.checked)}
            />
          </label>

          <p className="panel-footnote">
            Termo aceito em {formatarData(usuario.consentimentos.termosEm)} · versão{' '}
            {consentimento?.versao ?? RULES.versaoTermos}.
          </p>
          <Link to="/privacidade" className="link-arrow">
            Ler a Política de Privacidade <Icon nome="arrow-right" tamanho={16} />
          </Link>
        </section>

        <section className="panel" aria-labelledby="meus-dados">
          <h2 id="meus-dados">Meus dados</h2>
          <p className="panel-sub">
            Direitos previstos na LGPD: confirmação, acesso, correção, portabilidade e eliminação.
          </p>
          <div className="data-actions">
            <button type="button" className="btn btn-secondary" onClick={exportarDados}>
              <Icon nome="chart" tamanho={18} /> Baixar meus dados (JSON)
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setModalExclusao(true)}
            >
              <Icon nome="trash" tamanho={18} /> Excluir minha conta
            </button>
          </div>
          <p className="panel-footnote">
            A exclusão remove conta, pedidos e pontos deste dispositivo. Não é possível desfazer.
          </p>
        </section>

        <section className="panel" aria-labelledby="resumo-conta">
          <h2 id="resumo-conta">Resumo</h2>
          <dl className="summary-list">
            <div>
              <dt>Pontos disponíveis</dt>
              <dd>{usuario.pontos} pts</dd>
            </div>
            <div>
              <dt>Cupons ativos</dt>
              <dd>{usuario.cupons.length}</dd>
            </div>
            <div>
              <dt>Pedidos</dt>
              <dd>{meusPedidos.length}</dd>
            </div>
          </dl>
          <Link to="/fidelidade" className="btn btn-secondary btn-block">
            Ver clube de fidelidade
          </Link>
          <Link to="/pedidos" className="btn btn-ghost btn-block">
            Ver meus pedidos
          </Link>
        </section>
      </div>

      {modalExclusao && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="exclusao-titulo">
          <div className="modal">
            <h2 id="exclusao-titulo">Excluir conta e dados</h2>
            <p>
              Esta ação remove permanentemente sua conta, seus pedidos e seus pontos deste
              dispositivo. Digite <strong>EXCLUIR</strong> para confirmar.
            </p>
            <div className="field">
              <label htmlFor="confirmar-exclusao">Confirmação</label>
              <input
                id="confirmar-exclusao"
                value={textoExclusao}
                onChange={(evento) => setTextoExclusao(evento.target.value.toUpperCase())}
                placeholder="EXCLUIR"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setModalExclusao(false);
                  setTextoExclusao('');
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={textoExclusao !== 'EXCLUIR'}
                onClick={() => {
                  excluirConta();
                  setModalExclusao(false);
                  navigate('/');
                }}
              >
                Excluir definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
