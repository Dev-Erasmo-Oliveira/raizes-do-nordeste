import { Link, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BottomNav } from './BottomNav';
import { ChannelSwitcher } from './ChannelSwitcher';
import { Header } from './Header';
import { Icon } from './Icon';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <span className="brand-mark brand-mark-small" aria-hidden="true">
            R
          </span>
          <p>
            Rede de lanchonetes nordestina em expansão. Cardápio por unidade, retirada no balcão,
            fidelidade e pagamento simulado.
          </p>
          <p className="footer-note">
            Projeto acadêmico com dados mockados. Nenhum pagamento real é processado.
          </p>
        </div>
        <div>
          <h2>Navegue</h2>
          <ul className="footer-links">
            <li>
              <Link to="/cardapio">Cardápio</Link>
            </li>
            <li>
              <Link to="/unidades">Unidades</Link>
            </li>
            <li>
              <Link to="/promocoes">Promoções</Link>
            </li>
            <li>
              <Link to="/fidelidade">Fidelidade</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2>Privacidade</h2>
          <ul className="footer-links">
            <li>
              <Link to="/privacidade">Política de Privacidade</Link>
            </li>
            <li>
              <Link to="/perfil">Meus dados</Link>
            </li>
            <li>
              <Link to="/operacao">Painel operacional</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Rede Raízes do Nordeste</span>
        <span className="footer-disclaimer">
          <Icon nome="lock" tamanho={14} /> Dados tratados conforme a LGPD
        </span>
      </div>
    </footer>
  );
}

export function SiteLayout() {
  const { canalSite } = useApp();

  return (
    <div className={`site canal-${canalSite}`}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="demo-bar">
        <div className="container demo-bar-inner">
          <span className="demo-bar-label">Demonstração</span>
          <ChannelSwitcher />
        </div>
      </div>
      <Header />
      <main id="conteudo" className="site-main">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
