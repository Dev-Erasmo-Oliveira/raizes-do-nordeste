import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { DEMO } from '../config/rules';

export function Login() {
  const { entrar, usuario } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { de?: string } | null)?.de ?? '/';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  if (usuario) return <Navigate to="/" replace />;

  function submeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    const resultado = entrar(email, senha);
    if (!resultado.ok) {
      setErro(resultado.erro ?? 'Não foi possível entrar.');
      return;
    }
    navigate(destino, { replace: true });
  }

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <span className="eyebrow">Bem-vindo de volta</span>
        <h1>Entrar na conta</h1>
        <p className="auth-sub">
          Acompanhe pedidos, acumule pontos e use cupons exclusivos do Clube Raízes.
        </p>

        <form onSubmit={submeter} noValidate>
          <div className="field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              aria-invalid={Boolean(erro)}
            />
          </div>
          <div className="field">
            <label htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              aria-invalid={Boolean(erro)}
            />
          </div>
          {erro && (
            <p className="form-error" role="alert">
              {erro}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-block">
            Entrar
          </button>
        </form>

        <div className="auth-demo">
          <strong>Conta de demonstração</strong>
          <p>
            E-mail: <code>{DEMO.email}</code> · Senha: <code>{DEMO.senha}</code>
          </p>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => {
              setEmail(DEMO.email);
              setSenha(DEMO.senha);
              setErro('');
            }}
          >
            Preencher dados de teste
          </button>
        </div>

        <p className="auth-footer">
          Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
        <p className="auth-lgpd">
          <Icon nome="lock" tamanho={14} /> Seus dados são tratados conforme a{' '}
          <Link to="/privacidade">Política de Privacidade</Link>.
        </p>
      </div>
    </div>
  );
}
