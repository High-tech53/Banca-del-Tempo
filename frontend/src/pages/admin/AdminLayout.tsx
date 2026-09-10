import { NavLink, Outlet, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Gift, HandHelping, Link2, Users, Shield, Flag,
  Folder, BarChart3, FileText,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth';

interface Stats {
  pendingOffers: number;
  pendingRequests: number;
  openFlags: number;
}

const NAV = [
  { to: '/admin',               icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/admin/offerte',       icon: Gift,            label: 'Offerte',      badge: 'pendingOffers' as const },
  { to: '/admin/richieste',     icon: HandHelping,     label: 'Richieste',    badge: 'pendingRequests' as const },
  { to: '/admin/match',         icon: Link2,           label: 'Match' },
  { to: '/admin/utenti',        icon: Users,           label: 'Utenti' },
  { to: '/admin/moderazione',   icon: Shield,          label: 'Moderazione',  badge: 'openFlags' as const, badgeColor: 'bg-red-500' },
  { to: '/admin/segnalazioni',  icon: Flag,            label: 'Segnalazioni' },
  { to: '/admin/categorie',     icon: Folder,          label: 'Categorie' },
  { to: '/admin/analytics',     icon: BarChart3,       label: 'Analytics' },
  { to: '/admin/log',           icon: FileText,        label: 'Log attività' },
];

export default function AdminLayout() {
  const user = useAuthStore(s => s.user);
  const { data: stats } = useQuery<Stats>({
    queryKey: ['admin-stats-badges'],
    queryFn: async () => (await api.get('/admin/stats')).data,
    refetchInterval: 60_000,
  });

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Dark sidebar */}
      <aside className="w-60 bg-ink-900 text-ink-300 flex-shrink-0 hidden md:flex flex-col">
        <Link to="/" className="p-5 flex items-center gap-2 hover:opacity-90 transition">
            <img src="/Logo.png" alt="Vicini Logo" className='h-10 w-auto' />
          <div>
            <div className="font-display text-base font-semibold text-white leading-none">Banca del Tempo</div>
            <div className="text-[10px] text-ink-500 leading-none mt-1">ADMIN</div>
          </div>
        </Link>
        <div className="border-t border-ink-700 my-2" />
        <nav className="flex-1 p-3 space-y-1 text-sm">
          {NAV.map(item => {
            const badgeCount = item.badge && stats ? stats[item.badge] : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg transition ${
                    isActive ? 'bg-ink-700 text-white' : 'hover:bg-ink-800 text-ink-300'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" /> {item.label}
                </span>
                {badgeCount > 0 && (
                  <span className={`${item.badgeColor ?? 'bg-primary-500'} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
                    {badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t border-ink-700">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-sage-500 grid place-items-center text-white text-xs font-semibold">
              {user?.profile?.firstName?.[0] ?? 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </div>
              <div className="text-xs text-ink-500 truncate">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-ink-50 min-w-0 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
