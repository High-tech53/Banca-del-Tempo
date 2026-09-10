import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { api } from '../lib/api';
import type { Category, Offer, Paginated } from '../types';
import { useState } from 'react';

export default function Esplora() {
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get('categoria') ?? '';
  const [search, setSearch] = useState('');

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const { data: offers, isLoading } = useQuery({
    queryKey: ['offers', activeCategory, search],
    queryFn: async () => {
      const res = await api.get<Paginated<Offer>>('/offers', {
        params: { category: activeCategory || undefined, q: search || undefined },
      });
      return res.data;
    },
  });

  function setCategory(slug: string) {
    if (slug) params.set('categoria', slug); else params.delete('categoria');
    setParams(params, { replace: true });
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <h1 className="font-display text-4xl md:text-5xl font-semibold">Esplora offerte</h1>
        <p className="text-ink-600 mt-2">Trova un vicino disposto a darti una mano.</p>
      </div>

      <div className="border-y border-ink-200 bg-white sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3 overflow-x-auto">
          <button
            onClick={() => setCategory('')}
            className={`text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap transition ${
              !activeCategory ? 'bg-primary-500 text-white' : 'bg-ink-50 text-ink-700 hover:bg-ink-100'
            }`}
          >Tutte</button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={`text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap transition ${
                activeCategory === c.slug ? 'bg-primary-500 text-white' : 'bg-ink-50 text-ink-700 hover:bg-ink-100'
              }`}
            >{c.icon} {c.name}</button>
          ))}
          <div className="ml-auto flex items-center gap-2 bg-ink-50 rounded-lg px-3 py-2 min-w-[220px]">
            <Search className="w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cerca offerte..."
              className="bg-transparent flex-1 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {isLoading && <SkeletonGrid />}
        {!isLoading && offers?.data.length === 0 && (
          <div className="text-center py-20 text-ink-500">Nessuna offerta trovata. Prova a cambiare filtro.</div>
        )}
        {!isLoading && offers?.data.length! > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers!.data.map(o => <OfferCard key={o.id} offer={o} />)}
          </div>
        )}
      </div>
    </>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  const profile = offer.offerer.profile;
  const displayName = profile?.firstName + (profile?.showLastName ? ` ${profile.lastName?.[0]}.` : '');
  return (
    <Link
      to={`/offerte/${offer.id}`}
      className="bg-white rounded-2xl border border-ink-200 hover:shadow-soft-lg hover:-translate-y-0.5 transition-all overflow-hidden group"
    >
      <div className="h-32 bg-gradient-to-br from-primary-100 to-primary-50 relative grid place-items-center">
        <span className="text-5xl">{offer.category.icon}</span>
        <span className="absolute top-3 right-3 bg-white/80 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-full text-ink-700">
          {offer.category.name}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg group-hover:text-primary-600 transition line-clamp-2">{offer.title}</h3>
        <p className="text-sm text-ink-600 mt-1 line-clamp-2">{offer.description}</p>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-ink-100">
          <div className="w-8 h-8 rounded-full bg-sage-500 grid place-items-center text-white text-xs font-semibold">
            {profile?.firstName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-xs text-ink-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {offer.zone}
            </div>
          </div>
          {profile?.ratingCount! > 0 && (
            <span className="bg-sage-50 text-sage-700 text-xs font-semibold px-2 py-1 rounded-full">
              ★ {profile!.ratingAverage?.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-ink-200 overflow-hidden animate-pulse">
          <div className="h-32 bg-ink-100" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-ink-100 rounded w-3/4" />
            <div className="h-3 bg-ink-100 rounded w-full" />
            <div className="h-3 bg-ink-100 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
