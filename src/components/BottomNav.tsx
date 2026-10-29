import { NavLink } from 'react-router-dom';
import { Icon, type NomeIcone } from './Icon';

const ITENS: { para: string; rotulo: string; icone: NomeIcone; fim?: boolean }[] = [
  { para: '/', rotulo: 'Início', icone: 'home', fim: true },
  { para: '/cardapio', rotulo: 'Cardápio', icone: 'menu' },
  { para: '/pedidos', rotulo: 'Pedidos', icone: 'bag' },
  { para: '/fidelidade', rotulo: 'Fidelidade', icone: 'star' },
  { para: '/perfil', rotulo: 'Perfil', icone: 'user' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação rápida">
      {ITENS.map((item) => (
        <NavLink
          key={item.para}
          to={item.para}
          end={item.fim}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'is-active' : ''}`}
        >
          <Icon nome={item.icone} tamanho={22} />
          <span>{item.rotulo}</span>
        </NavLink>
      ))}
    </nav>
  );
}
