import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { EMAIL_ENCARREGADO, RULES } from '../config/rules';
import { formatarDataHora } from '../lib/format';

export function Privacy() {
  const { consentimento, registrarConsentimento, usuario } = useApp();
  const [analytics, setAnalytics] = useState(consentimento?.analytics ?? false);
  const [marketing, setMarketing] = useState(consentimento?.marketing ?? false);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">LGPD</span>
          <h1>Política de Privacidade</h1>
          <p>
            Versão {RULES.versaoTermos} · Transparência sobre quais dados usamos, por quê e como
            você pode controlá-los.
          </p>
        </div>
        <Link to="/perfil" className="btn btn-ghost btn-small">
          Meus dados
        </Link>
      </div>

      <div className="privacy-layout">
        <div className="privacy-content">
          <section className="panel">
            <h2>1. Quem trata seus dados</h2>
            <p>
              A Rede Raízes do Nordeste é a controladora dos dados pessoais coletados neste
              protótipo acadêmico. O encarregado de proteção de dados (DPO) pode ser contatado em{' '}
              <strong>{EMAIL_ENCARREGADO}</strong>.
            </p>
            <p className="panel-footnote">
              Os dados de cadastro e pedidos ficam no armazenamento local deste navegador. O
              protótipo não tem API de pedidos nem integração com gateway de pagamento.
            </p>
          </section>

          <section className="panel">
            <h2>2. Quais dados coletamos</h2>
            <ul className="privacy-list">
              <li>
                <strong>Cadastro:</strong> nome, e-mail, telefone e senha.
              </li>
              <li>
                <strong>Pedidos:</strong> itens, unidade, horário de retirada, valores e forma de
                pagamento.
              </li>
              <li>
                <strong>Fidelidade:</strong> saldo de pontos, extrato e cupons gerados.
              </li>
              <li>
                <strong>Preferências:</strong> suas escolhas de analytics e marketing ficam salvas
                localmente; nenhum dado de navegação é coletado para análise e nenhum serviço de
                envio de ofertas está conectado.
              </li>
            </ul>
            <p>
              <strong>Não coletamos</strong> dados de cartão. Campos de cartão no simulador são
              fictícios e não são armazenados.
            </p>
          </section>

          <section className="panel">
            <h2>3. Para que usamos e com qual base legal</h2>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Finalidade</th>
                    <th>Dados</th>
                    <th>Base legal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Processar pedido e liberar retirada</td>
                    <td>Nome, telefone, e-mail, itens</td>
                    <td>Execução de contrato</td>
                  </tr>
                  <tr>
                    <td>Demonstrar o fluxo de pagamento</td>
                    <td>Método e estado da simulação</td>
                    <td>Não se aplica a transação real; não há gateway conectado</td>
                  </tr>
                  <tr>
                    <td>Programa de fidelidade</td>
                    <td>Histórico de pedidos e pontos</td>
                    <td>Execução de contrato (hipótese do protótipo)</td>
                  </tr>
                  <tr>
                    <td>Registrar preferência de marketing (sem envio de ofertas)</td>
                    <td>Escolha de marketing</td>
                    <td>Consentimento opcional; preferência local</td>
                  </tr>
                  <tr>
                    <td>Registrar preferência de análise (sem coleta configurada)</td>
                    <td>Escolha de analytics</td>
                    <td>Consentimento opcional; preferência local</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="panel-footnote">
              As bases legais são apresentadas como hipótese acadêmica do projeto e não constituem
              parecer jurídico.
            </p>
          </section>

          <section className="panel">
            <h2>4. Compartilhamento</h2>
            <p>
              O protótipo não envia dados de pedidos a gateway, API ou backend externo. O pagamento
              é uma simulação local, sem cobrança. As preferências de analytics e marketing também
              não ativam serviços externos nesta demonstração.
            </p>
          </section>

          <section className="panel">
            <h2>5. Retenção</h2>
            <p>
              Dados de pedidos ficam disponíveis no histórico enquanto a conta existir. Você pode
              excluir a conta e os dados a qualquer momento em “Meus dados”. Registros fiscais,
              quando aplicáveis, seguem os prazos legais.
            </p>
          </section>

          <section className="panel">
            <h2>6. Seus direitos</h2>
            <ul className="privacy-list">
              <li>Confirmação da existência de tratamento e acesso aos dados.</li>
              <li>Correção de dados incompletos ou desatualizados.</li>
              <li>Portabilidade: download em JSON na área “Meus dados”.</li>
              <li>Eliminação da conta e dos dados pessoais.</li>
              <li>Revogação do consentimento de marketing e análise.</li>
            </ul>
            <p>
              Para exercer qualquer direito, acesse{' '}
              <Link to={usuario ? '/perfil' : '/entrar'}>Meus dados</Link> ou escreva para{' '}
              {EMAIL_ENCARREGADO}.
            </p>
          </section>

          <section className="panel">
            <h2>7. Segurança</h2>
            <p>
              Os dados de cadastro e pedidos ficam no armazenamento local do navegador. A aplicação
              não envia esses dados a uma API ou gateway de pagamento; os campos do cartão são
              fictícios e não são transmitidos. A hospedagem entrega os arquivos do site, e esta
              descrição se refere aos dados preenchidos nos formulários.
            </p>
          </section>
        </div>

        <aside className="privacy-aside">
          <section className="panel">
            <h2>Suas preferências</h2>
            <p className="panel-sub">
              Você pode mudar de ideia a qualquer momento. Opções não essenciais começam
              desmarcadas.
            </p>
            <label className="consent-option">
              <input type="checkbox" checked disabled />
              <span>
                <strong>Essenciais</strong>
                <small>Necessários para conta, carrinho e pedido.</small>
              </span>
            </label>
            <label className="consent-option">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(evento) => setAnalytics(evento.target.checked)}
              />
              <span>
                <strong>Análise de uso</strong>
                <small>Métricas anônimas de navegação.</small>
              </span>
            </label>
            <label className="consent-option">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(evento) => setMarketing(evento.target.checked)}
              />
              <span>
                <strong>Marketing</strong>
                <small>Novidades e promoções por e-mail.</small>
              </span>
            </label>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => registrarConsentimento({ necessario: true, analytics, marketing })}
            >
              Salvar preferências
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => {
                setAnalytics(false);
                setMarketing(false);
                registrarConsentimento({ necessario: true, analytics: false, marketing: false });
              }}
            >
              Revogar opcionais
            </button>
            {consentimento && (
              <p className="panel-footnote">
                Última atualização: {formatarDataHora(consentimento.data)} · versão{' '}
                {consentimento.versao}.
              </p>
            )}
          </section>

          <section className="panel privacy-help">
            <h2>Precisa de ajuda?</h2>
            <p>
              Fale com o encarregado de dados para dúvidas sobre tratamento, acesso ou exclusão.
            </p>
            <p className="privacy-email">
              <Icon nome="lock" tamanho={16} /> {EMAIL_ENCARREGADO}
            </p>
            <Link to={usuario ? '/perfil' : '/entrar'} className="btn btn-secondary btn-block">
              {usuario ? 'Abrir Meus dados' : 'Entrar na conta'}
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
