import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function ChannelSwitcher() {
  const { canalSite, definirCanalSite } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  function escolher(canal: 'web' | 'app' | 'totem') {
    if (canal === 'totem') {
      navigate('/totem');
      return;
    }
    definirCanalSite(canal);
    if (location.pathname.startsWith('/totem')) navigate('/');
  }

  return (
    <div className="channel-switcher" role="group" aria-label="Modo de demonstração de canal">
      <span className="channel-label">Ver como</span>
      {(['web', 'app', 'totem'] as const).map((canal) => (
        <button
          key={canal}
          type="button"
          className={`channel-btn ${canalSite === canal ? 'is-active' : ''}`}
          aria-pressed={canalSite === canal}
          onClick={() => escolher(canal)}
        >
          {canal === 'web' ? 'Web' : canal === 'app' ? 'App' : 'Totem'}
        </button>
      ))}
    </div>
  );
}
