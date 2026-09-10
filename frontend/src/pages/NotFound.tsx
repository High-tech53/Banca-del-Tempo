import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="font-display text-8xl font-semibold text-primary-500 mb-2">404</div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 mb-3">
          Pagina non trovata
        </h1>
        <p className="text-ink-600 mb-8">
          La pagina che cerchi non esiste o è stata spostata. Controlla l'indirizzo o torna alla home.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 transition text-white font-semibold px-6 py-3 rounded-xl shadow-soft"
          >
            <Home className="w-4 h-4" /> Torna alla home
          </Link>
          <Link
            to="/esplora"
            className="inline-flex items-center gap-2 bg-white hover:bg-ink-50 transition text-ink-700 font-medium px-6 py-3 rounded-xl border border-ink-200"
          >
            <Search className="w-4 h-4" /> Esplora offerte
          </Link>
        </div>
      </div>
    </div>
  );
}