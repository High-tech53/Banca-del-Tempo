import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Heart, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Category } from '../types';

export default function Home() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50 via-ink-50 to-sage-50" />
        <div className="absolute top-20 -right-32 w-[500px] h-[500px] rounded-full bg-primary-100/60 blur-3xl -z-10" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full bg-sage-100/50 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-primary-200 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary-500" />
              <span className="text-xs font-semibold text-primary-700 tracking-wide">COMUNITÀ ATTIVA · SEMPRE GRATUITO</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-ink-900">
              L'aiuto è più <em className="italic text-primary-600">vicino</em> di quanto pensi.
            </h1>
            <p className="mt-6 text-lg text-ink-600 leading-relaxed max-w-xl">
              Offri il tuo tempo. Chiedi una mano. Costruisci un quartiere più gentile — senza soldi, senza algoritmi, solo persone vere intorno a te.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/crea" className="bg-primary-500 hover:bg-primary-600 transition text-white font-semibold px-7 py-4 rounded-xl shadow-soft text-base inline-flex items-center gap-2 group">
                Offri il tuo tempo <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link to="/esplora" className="bg-white hover:bg-ink-50 transition text-primary-600 font-semibold px-7 py-4 rounded-xl border-2 border-primary-500 text-base">
                Chiedi aiuto
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-ink-600">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-sage-600" /> Vicini verificati</div>
              <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-sage-600" /> Sempre gratuito</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sage-600" /> Match locali</div>
            </div>
          </div>

          {/* Illustration card */}
          <div className="relative h-[500px] hidden lg:block">
            <div className="absolute inset-0 bg-primary-100 rounded-[80px] rotate-3" />
            <div className="absolute inset-2 bg-white rounded-[80px] -rotate-2 shadow-soft-lg overflow-hidden">
              <svg viewBox="0 0 500 500" className="w-full h-full">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FBF1EE"/>
                    <stop offset="100%" stopColor="#EEF4EE"/>
                  </linearGradient>
                </defs>
                <rect width="500" height="500" fill="url(#g1)"/>
                <ellipse cx="100" cy="380" rx="120" ry="40" fill="#D9E6D8" opacity="0.6"/>
                <circle cx="180" cy="200" r="42" fill="#D96E54"/>
                <rect x="148" y="232" width="64" height="100" rx="32" fill="#D96E54"/>
                <circle cx="280" cy="170" r="46" fill="#5B8C5A"/>
                <rect x="244" y="206" width="72" height="108" rx="36" fill="#5B8C5A"/>
                <circle cx="370" cy="240" r="40" fill="#2B2925"/>
                <rect x="338" y="272" width="64" height="92" rx="32" fill="#2B2925"/>
                <g transform="translate(240,80)">
                  <path d="M 0 18 Q -18 -2 -22 18 Q -22 38 0 50 Q 22 38 22 18 Q 18 -2 0 18 Z" fill="white" stroke="#D96E54" strokeWidth="2.5"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-primary-600 tracking-wider uppercase mb-3">Come funziona</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">Tre passi, nessuna sorpresa.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: 1, title: 'Pubblica o esplora', body: 'Condividi ciò che puoi offrire, o descrivi l\'aiuto di cui hai bisogno. Bastano 2 minuti.', tint: 'primary' },
              { n: 2, title: 'Trova un match',     body: 'Ti suggeriamo vicini verificati compatibili con la tua richiesta o il tuo talento.', tint: 'sage' },
              { n: 3, title: 'L\'aiuto accade',    body: 'Coordinate in sicurezza nell\'app, incontratevi, e lasciate gentilezza dietro di voi.', tint: 'primary' },
            ].map(s => (
              <div key={s.n} className="bg-white rounded-3xl p-8 border border-ink-200 hover:shadow-soft-lg transition-all hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl bg-${s.tint}-50 grid place-items-center font-display text-2xl font-semibold text-${s.tint}-700 mb-6`}>{s.n}</div>
                <h3 className="font-display text-2xl font-semibold mb-3">{s.title}</h3>
                <p className="text-ink-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories from DB */}
      <section className="py-24 bg-ink-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-primary-600 tracking-wider uppercase mb-3">Categorie</p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold">Esplora per categoria</h2>
            </div>
            <Link to="/esplora" className="text-primary-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              Vedi tutte <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c, i) => (
              <Link key={c.id} to={`/esplora?categoria=${c.slug}`} className="bg-white rounded-2xl p-6 border border-ink-200 hover:border-primary-300 hover:shadow-soft transition group">
                <div className={`w-12 h-12 rounded-xl ${i % 2 === 0 ? 'bg-primary-50' : 'bg-sage-50'} grid place-items-center text-2xl mb-4`}>{c.icon}</div>
                <h3 className="font-semibold">{c.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">Pronto a iniziare?</h2>
          <p className="text-lg text-ink-600 mt-4">Bastano 2 minuti per registrarti. Niente carta di credito. Mai.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/registrati" className="bg-primary-500 hover:bg-primary-600 transition text-white font-semibold px-7 py-4 rounded-xl shadow-soft">Crea un account</Link>
            <Link to="/esplora" className="bg-white hover:bg-ink-50 transition text-primary-600 font-semibold px-7 py-4 rounded-xl border-2 border-primary-500">Esplora le offerte</Link>
          </div>
        </div>
      </section>
    </>
  );
}
