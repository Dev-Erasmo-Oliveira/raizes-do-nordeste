import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';

export function Register() {
  const { cadastrar, usuario } = useApp();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aceite, setAceite] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  if (usuario) return <Navigate to="/" replace />;

  function submeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const novosErros: Record<string, string> = {};
    if (nome.trim().length < 2) novosErros.nome = 'Informe seu nome completo.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) novosErros.email = 'Informe um e-mail válido.';
    if (telefone.replace(/\D/g, '').length < 10) {
      novosErros.telefone = 'Informe um telefone com DDD.';
    }
    if (senha.length < 8) novosErros.senha = 'A senha deve ter pelo menos 8 caracteres.';
    if (senha !== confirmacao) novosErros.confirmacao = 'As senhas não conferem.';
    if (!aceite) novosErros.aceite = 'É necessário aceitar os termos e a política de privacidade.';

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const resultado = cadastrar({ nome, email, telefone, senha, marketing });
    if (!resultado.ok) {
      setErros({ [resultado.campo ?? 'geral']: resultado.erro ?? 'Não foi possível cadastrar.' });
      return;
    }
    navigate('/', { replace: true });
  }

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <span className="eyebrow">Clube Raízes</span>
        <h1>Criar sua conta</h1>
        <p className="auth-sub">
          Leva menos de um minuto. Você acompanha pedidos, acumula pontos e recebe cupons.
        </p>

        <form onSubmit={submeter} noValidate>
          <div className="field">
            <label htmlFor="cadastro-nome">Nome completo *</label>
            <input
              id="cadastro-nome"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              autoComplete="name"
              aria-invalid={Boolean(erros.nome)}
            />
            {erros.nome && <span className="field-error">{erros.nome}</span>}
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="cadastro-email">E-mail *</label>
              <input
                id="cadastro-email"
                type="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                autoComplete="email"
                aria-invalid={Boolean(erros.email)}
              />
              {erros.email && <span className="field-error">{erros.email}</span>}
            </div>
            <div className="field">
              <label htmlFor="cadastro-telefone">Telefone *</label>
              <input
                id="cadastro-telefone"
                value={telefone}
                onChange={(evento) => setTelefone(evento.target.value)}
                autoComplete="tel"
                inputMode="tel"
                placeholder="(81) 99999-0000"
                aria-invalid={Boolean(erros.telefone)}
              />
              {erros.telefone && <span className="field-error">{erros.telefone}</span>}
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="cadastro-senha">Senha *</label>
              <input
                id="cadastro-senha"
                type="password"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                autoComplete="new-password"
                aria-invalid={Boolean(erros.senha)}
              />
              {erros.senha && <span className="field-error">{erros.senha}</span>}
            </div>
            <div className="field">
              <label htmlFor="cadastro-confirmacao">Confirme a senha *</label>
              <input
                id="cadastro-confirmacao"
                type="password"
                value={confirmacao}
                onChange={(evento) => setConfirmacao(evento.target.value)}
                autoComplete="new-password"
                aria-invalid={Boolean(erros.confirmacao)}
              />
              {erros.confirmacao && <span className="field-error">{erros.confirmacao}</span>}
            </div>
          </div>

          <label className="consent-check">
            <input
              type="checkbox"
              checked={aceite}
              onChange={(evento) => setAceite(evento.target.checked)}
              aria-invalid={Boolean(erros.aceite)}
            />
            <span>
              Li e aceito os termos de uso e a{' '}
              <a href="/privacidade" target="_blank" rel="noreferrer">
                Política de Privacidade
              </a>
              . *
            </span>
          </label>
          {erros.aceite && <span className="field-error">{erros.aceite}</span>}

          <label className="consent-check">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(evento) => setMarketing(evento.target.checked)}
            />
            <span>
              Quero deixar salva a preferência por novidades e promoções por e-mail. É opcional;
              nenhum envio é feito nesta demonstração.
            </span>
          </label>

          {erros.geral && (
            <p className="form-error" role="alert">
              {erros.geral}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block">
            Criar conta
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </p>
        <p className="auth-lgpd">
          <Icon nome="lock" tamanho={14} /> Nenhuma opção de marketing vem pré-marcada.
        </p>
      </div>
    </div>
  );
}
