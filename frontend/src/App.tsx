import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { api } from './lib/api';
import { useAuthStore } from './store/auth';
import Header from './components/Header';
import Home from './pages/Home';
import Esplora from './pages/Esplora';
import OfferDetail from './pages/OfferDetail';
import Registrati from './pages/Registrati';
import Accedi from './pages/Accedi';
import Dashboard from './pages/Dashboard';
import Crea from './pages/Crea';
import MieOfferte from './pages/MieOfferte';
import Profilo from './pages/Profilo';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOfferte from './pages/admin/AdminOfferte';
import AdminRichieste from './pages/admin/AdminRichieste';
import AdminMatch from './pages/admin/AdminMatch';
import AdminUtenti from './pages/admin/AdminUtenti';
import AdminModerazione from './pages/admin/AdminModerazione';
import AdminSegnalazioni from './pages/admin/AdminSegnalazioni';
import AdminCategorie from './pages/admin/AdminCategorie';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLog from './pages/admin/AdminLog';



function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/accedi" replace />;
  return <>{children}</>;
}

function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/accedi" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const user = useAuthStore(s => s.user);
  const setSession = useAuthStore(s => s.setSession);
  const clear = useAuthStore(s => s.clear);

  // On mount, if we have a persisted user, try to refresh the access token
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const refreshRes = await api.post('/auth/refresh');
        const accessToken = (refreshRes.data as { accessToken: string }).accessToken;
        useAuthStore.getState().setAccessToken(accessToken);
        const me = await api.get('/me');
        setSession(me.data, accessToken);
      } catch {
        clear();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/esplora"     element={<Esplora />} />
          <Route path="/offerte/:id" element={<OfferDetail />} />
          <Route path="/accedi"      element={<Accedi />} />
          <Route path="/registrati"  element={<Registrati />} />

          <Route path="/dashboard"     element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/crea"          element={<RequireAuth><Crea /></RequireAuth>} />
          <Route path="/mie-offerte"   element={<RequireAuth><MieOfferte /></RequireAuth>} />
          <Route path="/profilo"       element={<RequireAuth><Profilo /></RequireAuth>} />

          <Route path="/admin" element={<RequireRole roles={['MODERATOR', 'ADMIN']}><AdminLayout /></RequireRole>}>
            <Route index                element={<AdminDashboard />} />
            <Route path="offerte"       element={<AdminOfferte />} />
            <Route path="richieste"     element={<AdminRichieste />} />
            <Route path="match"         element={<AdminMatch />} />
            <Route path="utenti"        element={<AdminUtenti />} />
            <Route path="moderazione"   element={<AdminModerazione />} />
            <Route path="segnalazioni"  element={<AdminSegnalazioni />} />
            <Route path="categorie"     element={<AdminCategorie />} />
            <Route path="analytics"     element={<AdminAnalytics />} />
            <Route path="log"           element={<AdminLog />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
