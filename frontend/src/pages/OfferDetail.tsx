import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Repeat, BadgeCheck, MessageCircle, HandHelping } from 'lucide-react';
import { api } from '../lib/api';
import type { Offer } from '../types';
import { useAuthStore } from '../store/auth';

const DAY_LABELS: Record<string, string> = { MON:'LUN', TUE:'MAR', WED:'MER', THU:'GIO', FRI:'VEN', SAT:'SAB', SUN:'DOM' };
const ALL_DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

export default function OfferDetail() {
  const { id } = useParams();
  const user = useAuthStore(s => s.user);

  const { data: offer, isLoading } = useQuery<Offer>({
    queryKey: ['offer', id],
    queryFn: async () => (await api.get<Offer>(`/offers/${id}`)).data,
    enabled: !!id,
  });

  if (isLoading) return <div className="max-w-4xl mx-auto px-6 py-10 text-ink-500">Caricamento…</div>;
  if (!offer) return <div className="max-w-4xl mx-auto px-6 py-10 text-ink-500">Offerta non trovata.</div>;

  const profile = offer.offerer.profile;
  const displayName = `${profile?.firstName} ${profile?.showLastName ? profile.lastName : profile?.lastName?.[0] + '.'}`;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link to="/esplora" className="inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Torna alle offerte
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-ink-200 overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-primary-100 via-primary-50 to-sage-50 relative grid place-items-center">
              <span className="text-7xl">{offer.category.icon}</span>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-white/90 backdrop-blur text-xs font-semibold px-3 py-1.5 rounded-full text-ink-700">{offer.category.name}</span>
                {profile?.verificationStatus === 'VERIFIED' && (
                  <span className="bg-sage-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Verificato
                  </span>
                )}
              </div>
            </div>
            <div className="p-8">
              <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">{offer.title}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-ink-600">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {offer.zone}, {offer.city}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(offer.createdAt).toLocaleDateString('it-IT')}</span>
                <span className="flex items-center gap-1.5"><Repeat className="w-4 h-4" />
                  {offer.frequency === 'WEEKLY' ? 'Settimanale' : offer.frequency === 'ONE_TIME' ? 'Una volta' : 'Flessibile'}
                </span>
              </div>

              <div className="mt-8">
                <h2 className="font-semibold text-lg mb-3">Descrizione</h2>
                <p className="text-ink-700 leading-relaxed whitespace-pre-wrap">{offer.description}</p>
              </div>

              {offer.availableDays.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-semibold text-lg mb-3">Disponibilità</h2>
                  <div className="grid grid-cols-7 gap-2">
                    {ALL_DAYS.map(d => (
                      <div key={d} className={`text-center p-2 rounded-xl ${offer.availableDays.includes(d) ? 'bg-primary-50 text-primary-700' : 'bg-ink-100 text-ink-400'}`}>
                        <div className="text-xs font-semibold">{DAY_LABELS[d]}</div>
                        <div className="text-xs mt-1">{offer.availableDays.includes(d) ? `${offer.timeFrom ?? ''}-${offer.timeTo ?? ''}` : '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside>
          <div className="bg-white rounded-3xl border border-ink-200 p-6 sticky top-24">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-sage-500 grid place-items-center text-white text-xl font-semibold">
                {profile?.firstName?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-lg flex items-center gap-1.5">
                  {displayName}
                  {profile?.verificationStatus === 'VERIFIED' && <BadgeCheck className="w-4 h-4 text-sage-600" />}
                </div>
                <div className="text-sm text-ink-500">{profile?.city}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-5 text-center">
              <div className="p-3 bg-ink-50 rounded-xl">
                <div className="font-display text-xl font-semibold">{profile?.ratingAverage?.toFixed(1) ?? '—'}</div>
                <div className="text-xs text-ink-500 mt-0.5">★ rating</div>
              </div>
              <div className="p-3 bg-ink-50 rounded-xl">
                <div className="font-display text-xl font-semibold">{profile?.helpsCompleted ?? 0}</div>
                <div className="text-xs text-ink-500 mt-0.5">aiuti</div>
              </div>
              <div className="p-3 bg-ink-50 rounded-xl">
                <div className="font-display text-xl font-semibold">{offer.viewCount}</div>
                <div className="text-xs text-ink-500 mt-0.5">visite</div>
              </div>
            </div>

            {user ? (
              <>
                <button className="w-full bg-primary-500 hover:bg-primary-600 transition text-white font-semibold py-4 rounded-xl mt-6 shadow-soft flex items-center justify-center gap-2">
                  <HandHelping className="w-5 h-5" /> Chiedi aiuto
                </button>
                <button className="w-full bg-white hover:bg-ink-50 transition text-ink-700 font-medium py-3 rounded-xl mt-2 border border-ink-200 flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Invia un messaggio
                </button>
              </>
            ) : (
              <Link to="/accedi" className="block text-center w-full bg-primary-500 hover:bg-primary-600 transition text-white font-semibold py-4 rounded-xl mt-6 shadow-soft">
                Accedi per contattare
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
