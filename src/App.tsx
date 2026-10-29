import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { SiteLayout } from './components/SiteLayout';
import { ConsentBanner } from './components/ConsentBanner';
import { ToastStack } from './components/ToastStack';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Units } from './pages/Units';
import { Menu } from './pages/Menu';
import { Product } from './pages/Product';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Payment } from './pages/Payment';
import { OrderTracking } from './pages/OrderTracking';
import { Orders } from './pages/Orders';
import { Promotions } from './pages/Promotions';
import { Loyalty } from './pages/Loyalty';
import { Profile } from './pages/Profile';
import { Privacy } from './pages/Privacy';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Operations } from './pages/Operations';
import { Totem } from './pages/Totem';
import { NotFound } from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function RootExtras() {
  const { pathname } = useLocation();
  const esconderConsentimento = pathname.startsWith('/totem');

  return (
    <>
      {!esconderConsentimento && <ConsentBanner />}
      <ToastStack />
    </>
  );
}

export function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/totem" element={<Totem />} />

        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="unidades" element={<Units />} />
          <Route path="cardapio" element={<Menu />} />
          <Route path="produto/:id" element={<Product />} />
          <Route path="carrinho" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="pagamento/:codigo" element={<Payment />} />
          <Route path="pedido/:codigo" element={<OrderTracking />} />
          <Route path="promocoes" element={<Promotions />} />
          <Route path="privacidade" element={<Privacy />} />
          <Route path="entrar" element={<Login />} />
          <Route path="cadastro" element={<Register />} />
          <Route path="operacao" element={<Operations />} />
          <Route
            path="pedidos"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="fidelidade"
            element={
              <ProtectedRoute>
                <Loyalty />
              </ProtectedRoute>
            }
          />
          <Route
            path="perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <RootExtras />
    </AppProvider>
  );
}
