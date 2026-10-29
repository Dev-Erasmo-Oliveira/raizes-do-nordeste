import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

export function NotFound() {
  return (
    <div className="container page">
      <div className="empty-state not-found">
        <span className="empty-icon" aria-hidden="true">
          <Icon nome="search" tamanho={30} />
        </span>
        <span className="eyebrow">Erro 404</span>
        <h1>Página não encontrada</h1>
        <p>
          O endereço acessado não existe ou foi movido. Volte ao início para continuar navegando.
        </p>
        <div className="empty-actions">
          <Link to="/" className="btn btn-primary">
            Ir para o início
          </Link>
          <Link to="/cardapio" className="btn btn-secondary">
            Ver cardápio
          </Link>
        </div>
      </div>
    </div>
  );
}
