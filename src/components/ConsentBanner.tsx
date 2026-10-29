import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from './Icon';

export function ConsentBanner() {
  const { consentimento, registrarConsentimento } = useApp();
  const [abrirPreferencias, setAbrirPreferencias] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  if (consentimento) return null;

  function aceitarTudo() {
    registrarConsentimento({ necessario: true, analytics: true, marketing: true });
  }

  function somenteEssenciais() {
    registrarConsentimento({ necessario: true, analytics: false, marketing: false });
  }

  function salvarPreferencias() {
    registrarConsentimento({ necessario: true, analytics, marketing });
  }

  return (
    <div className="consent-overlay" role="dialog" aria-modal="false" aria-labelledby="consent-title">
      <div className="consent-card">
        <div className="consent-heading">
          <span className="consent-icon" aria-hidden="true">
            <Icon nome="lock" tamanho={20} />
          </span>
          <div>
            <h2 id="consent-title">Sua privacidade importa</h2>
            <p>
              Os dados do pedido ficam neste navegador. Análise de uso e marketing são opcionais;
              nesta demonstração, essas preferências também ficam salvas apenas localmente. Leia a{' '}
              <Link to="/privacidade">Política de Privacidade</Link>.
            </p>
          </div>
        </div>

        {abrirPreferencias && (
          <div className="consent-prefs">
            <label className="consent-option">
              <input type="checkbox" checked disabled />
              <span>
                <strong>Essenciais</strong>
                <small>Sempre ativos. Necessários para login, carrinho e pedido.</small>
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
                <small>Preferência local; nenhum serviço de análise está conectado.</small>
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
                <small>Preferência local; nenhum envio de ofertas está configurado.</small>
              </span>
            </label>
          </div>
        )}

        <div className="consent-actions">
          {abrirPreferencias ? (
            <>
              <button type="button" className="btn btn-primary" onClick={salvarPreferencias}>
                Salvar preferências
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setAbrirPreferencias(false)}
              >
                Voltar
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-primary" onClick={aceitarTudo}>
                Aceitar todos
              </button>
              <button type="button" className="btn btn-secondary" onClick={somenteEssenciais}>
                Somente essenciais
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setAbrirPreferencias(true)}
              >
                Preferências
              </button>
            </>
          )}
        </div>
        <p className="consent-footnote">
          Nenhuma opção opcional vem pré-marcada. Versão da política: 2026-1.
        </p>
      </div>
    </div>
  );
}
