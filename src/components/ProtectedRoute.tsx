import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { usuario } = useApp();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/entrar" replace state={{ de: location.pathname }} />;
  }

  return <>{children}</>;
}
