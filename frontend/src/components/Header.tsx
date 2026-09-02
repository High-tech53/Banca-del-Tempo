import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, Menu, User as UserIcon, Gift, HandHelping, MessageCircle, UserPlus, LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `nav-link px-3 py-2 rounded-lg text-sm font-medium transition ${
          isActive ? 'bg-primary-50 text-primary-700' : 'hover:bg-ink-50 text-ink-700'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  async function handleLogout() {
    try { await api.post('/auth/logout'); } catch {}
    clear();
    setMenuOpen(false);
    navigate('/');
  }

  const initial = user?.profile?.firstName?.[0] ?? 'V';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-ink-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/Logo.png" alt="Banca del Tempo Logo" className='h-10 w-auto' />
          <span className="font-display text-2xl font-semibold tracking-tight">Banca del Tempo</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/esplora">Esplora</NavItem>
          {user && <NavItem to="/crea">Crea</NavItem>}
          {user && <NavItem to="/dashboard">Dashboard</NavItem>}
          {user && ['MODERATOR', 'ADMIN'].includes(user.role) && <NavItem to="/admin">Admin</NavItem>}
        </nav>

        <div className="flex items-center gap-2">
          {!user && (
            <>
              <Link to="/accedi" className="hidden sm:block text-sm font-medium text-ink-700 hover:text-primary-600 px-3 py-2">Accedi</Link>
              <Link to="/registrati" className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-soft-sm">
                Registrati
              </Link>
            </>
          )}

          {user && (
            <>
              <button className="relative w-10 h-10 grid place-items-center rounded-lg hover:bg-ink-50 transition text-ink-700">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500" />
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
                  className="flex items-center gap-1.5 hover:bg-ink-50 transition rounded-lg p-1.5"
                >
                  <div className="w-8 h-8 rounded-full bg-sage-500 grid place-items-center text-white text-sm font-semibold">{initial}</div>
                  <ChevronDown className="w-4 h-4 text-ink-500 hidden sm:block" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-soft-lg border border-ink-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-ink-100">
                      <div className="font-semibold">{user.profile?.firstName} {user.profile?.lastName}</div>
                      <div className="text-xs text-ink-500">{user.email}</div>
                    </div>
                    <Link to="/profilo"   className="px-4 py-2 hover:bg-ink-50 text-sm flex items-center gap-2"><UserIcon className="w-4 h-4 text-ink-500" /> Il mio profilo</Link>
                    <Link to="/mie-offerte"   className="px-4 py-2 hover:bg-ink-50 text-sm flex items-center gap-2"><Gift className="w-4 h-4 text-ink-500" /> Le mie offerte</Link>
                    <Link to="/mie-richieste" className="px-4 py-2 hover:bg-ink-50 text-sm flex items-center gap-2"><HandHelping className="w-4 h-4 text-ink-500" /> Le mie richieste</Link>
                    <Link to="/messaggi"  className="px-4 py-2 hover:bg-ink-50 text-sm flex items-center gap-2"><MessageCircle className="w-4 h-4 text-ink-500" /> Messaggi</Link>
                    <div className="border-t border-ink-100 my-2" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-ink-50 text-sm flex items-center gap-2 text-red-600">
                      <LogOut className="w-4 h-4" /> Esci
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <Link to="/accedi" className="sm:hidden p-2 text-ink-700"><LogIn className="w-5 h-5" /></Link>
          )}

          <button onClick={() => setMobileOpen(o => !o)} className="lg:hidden w-10 h-10 grid place-items-center rounded-lg hover:bg-ink-50">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-ink-200 bg-white">
          <nav className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-1">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/esplora">Esplora</NavItem>
            {user && <NavItem to="/crea">Crea</NavItem>}
            {user && <NavItem to="/dashboard">Dashboard</NavItem>}
            {!user && (
              <>
                <Link to="/accedi" className="px-3 py-2.5 rounded-lg hover:bg-ink-50 text-sm font-medium flex items-center gap-2"><LogIn className="w-4 h-4" /> Accedi</Link>
                <Link to="/registrati" className="px-3 py-2.5 rounded-lg hover:bg-ink-50 text-sm font-medium flex items-center gap-2"><UserPlus className="w-4 h-4" /> Registrati</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
