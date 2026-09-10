import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';
import type { Offer } from '../types';

export default function MieOfferte() {
  const { data: offers = [], isLoading } = useQuery<Offer[]>({
    queryKey: ['my-offers'],
    queryFn: async () => (await api.get<Offer[]>('/offers/mine/list')).data,
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Le mie offerte</h1>
          <p className="text-ink-500 mt-1">Gestisci ciò che offri alla comunità.</p>
        </div>
        <Link to="/crea" className="bg-primary-500 hover:bg-primary-600 transition text-white font-semibold px-5 py-3 rounded-xl shadow-soft flex items-center gap-2">
          <Plus className="w-4 h-4" /> Crea offerta
        </Link>
      </div>

      {isLoading && <div className="text-ink-500">Caricamento…</div>}

      {!isLoading && offers.length === 0 && (
        <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center">
          <p className="text-ink-500">Non hai ancora pubblicato un'offerta.</p>
          <Link to="/crea" className="inline-block mt-4 text-primary-600 font-semibold">Crea la prima →</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {offers.map(o => (
          <Link to={`/offerte/${o.id}`} key={o.id} className="bg-white rounded-2xl border border-ink-200 overflow-hidden hover:shadow-soft transition">
            <div className="h-24 bg-gradient-to-br from-primary-100 to-primary-50 relative grid place-items-center">
              <span className="text-4xl">{o.category.icon}</span>
              <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                o.status === 'APPROVED' ? 'bg-sage-50 text-sage-700' :
                o.status === 'PENDING_REVIEW' ? 'bg-primary-50 text-primary-700' :
                'bg-ink-100 text-ink-600'
              }`}>
                {o.status === 'APPROVED' ? 'Attiva' : o.status === 'PENDING_REVIEW' ? 'In revisione' : o.status}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-semibold line-clamp-1">{o.title}</h3>
              <p className="text-sm text-ink-500 mt-1 line-clamp-2">{o.description}</p>
              <div className="text-xs text-ink-500 mt-3">{o.zone} · {o.category.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
