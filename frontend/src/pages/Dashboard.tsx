import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';
import type { Offer } from '../types';
import { Flame, Award, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore(s => s.user);

  const { data: myOffers = [] } = useQuery<Offer[]>({
    queryKey: ['my-offers'],
    queryFn: async () => (await api.get<Offer[]>('/offers/mine/list')).data,
  });

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Buongiorno' : greetingHour < 18 ? 'Buon pomeriggio' : 'Buonasera';

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
          {greeting}, {user?.profile?.firstName} <span className="text-3xl">🌱</span>
        </h1>
        <p className="text-ink-600 mt-2">
          {user?.profile?.helpsCompleted ?? 0} aiuti completati · {myOffers.length} offerte attive
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-primary-50 via-white to-sage-50 rounded-3xl p-8 border border-primary-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-100 rounded-full -mr-24 -mt-24 opacity-50" />
          <div className="relative">
            <div className="text-xs font-semibold text-primary-700 tracking-wider uppercase mb-3">Inizia ora</div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-2">Crea la tua prima offerta</h2>
            <p className="text-ink-600 mb-6">Condividi un talento o un'ora del tuo tempo con un vicino.</p>
            <Link to="/crea" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 transition text-white font-semibold px-5 py-3 rounded-xl shadow-soft">
              Crea offerta <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-ink-900 text-white rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative">
            <div className="text-xs font-semibold text-ink-400 tracking-wider uppercase mb-3">Il tuo impatto</div>
            <div className="font-display text-5xl font-semibold">{user?.profile?.helpsCompleted ?? 0}</div>
            <div className="text-ink-300 text-sm mt-1">aiuti totali</div>
            <div className="mt-6 pt-6 border-t border-ink-700 space-y-2 text-sm">
              <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-primary-400" /> Continua a costruire la community</div>
              <div className="flex items-center gap-2"><Award className="w-4 h-4 text-primary-400" /> {user?.profile?.ratingCount ?? 0} valutazioni</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-display text-2xl font-semibold">Le tue offerte recenti</h2>
          <Link to="/mie-offerte" className="text-sm font-medium text-primary-600 hover:gap-2 inline-flex items-center gap-1 transition-all">
            Vedi tutte <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {myOffers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center">
            <p className="text-ink-500">Non hai ancora creato un'offerta.</p>
            <Link to="/crea" className="inline-block mt-4 text-primary-600 font-semibold">Crea la prima →</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {myOffers.slice(0, 4).map(o => (
              <Link key={o.id} to={`/offerte/${o.id}`} className="bg-white rounded-2xl border border-ink-200 p-5 hover:shadow-soft transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 grid place-items-center text-2xl flex-shrink-0">{o.category.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold line-clamp-1">{o.title}</div>
                    <div className="text-sm text-ink-500 mt-0.5">{o.category.name} · {o.zone}</div>
                    <div className="mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-ink-100 text-ink-600">
                      {o.status}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
