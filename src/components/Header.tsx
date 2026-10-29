import { Link, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from './Icon';

export function Header() {
  const { unidade, quantidadeCarrinho, usuario } = useApp();

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            R
          </span>
          <span className="brand-text">
            <strong>Raízes</strong>
            <small>do Nordeste</small>
          </span>
        </Link>

        <nav className="header-nav" aria-label="Navegação principal">
          <NavLink to="/cardapio">Cardápio</NavLink>
          <NavLink to="/promocoes">Promoções</NavLink>
          <NavLink to="/fidelidade">Fidelidade</NavLink>
          <NavLink to="/unidades">Unidades</NavLink>
        </nav>

        <div className="header-actions">
          <Link to="/unidades" className="unit-pill" title="Trocar unidade">
            <Icon nome="pin" tamanho={16} />
            <span>{unidade ? unidade.nome.replace('Raízes — ', '') : 'Escolher unidade'}</span>
          </Link>
          <Link
            to="/carrinho"
            className="icon-button"
            aria-label={`Carrinho com ${quantidadeCarrinho} ${quantidadeCarrinho === 1 ? 'item' : 'itens'}`}
          >
            <Icon nome="cart" />
            {quantidadeCarrinho > 0 && (
              <span className="badge-count" aria-hidden="true">
                {quantidadeCarrinho}
              </span>
            )}
          </Link>
          <Link
            to={usuario ? '/perfil' : '/entrar'}
            className="account-link"
            aria-label={usuario ? `${usuario.nome.split(' ')[0]} — minha conta` : 'Entrar'}
          >
            <Icon nome="user" />
            <span>{usuario ? usuario.nome.split(' ')[0] : 'Entrar'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
