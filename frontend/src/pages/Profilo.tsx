import { BadgeCheck, MapPin, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export default function Profilo() {
  const user = useAuthStore(s => s.user);
  const p = user?.profile;

  if (!user || !p) return <div className="max-w-4xl mx-auto px-6 py-10 text-ink-500">Caricamento…</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="bg-white rounded-3xl border border-ink-200 overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-primary-200 via-primary-100 to-sage-100" />
        <div className="px-8 pb-8">
          <div className="flex items-end gap-4 -mt-12 mb-4 flex-wrap">
            <div className="w-28 h-28 rounded-3xl bg-sage-500 grid place-items-center text-white text-4xl font-semibold border-4 border-white shadow-soft">
              {p.firstName[0]}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-semibold">{p.firstName} {p.lastName}</h1>
                {p.verificationStatus === 'VERIFIED' && (
                  <span className="bg-sage-50 text-sage-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verificato
                  </span>
                )}
              </div>
              <p className="text-ink-500 mt-1 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {p.city}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {user.email}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <Stat label="★ rating" value={p.ratingAverage?.toFixed(1) ?? '—'} />
            <Stat label="aiuti dati" value={p.helpsCompleted} />
            <Stat label="valutazioni" value={p.ratingCount} />
            <Stat label="ruolo" value={user.role} />
          </div>

          {p.bio && (
            <div className="mt-8">
              <h2 className="font-semibold text-lg mb-2">Chi sono</h2>
              <p className="text-ink-600 leading-relaxed">{p.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-ink-50 rounded-2xl p-4 text-center">
      <div className="font-display text-2xl font-semibold">{value}</div>
      <div className="text-xs text-ink-500 mt-0.5">{label}</div>
    </div>
  );
}
