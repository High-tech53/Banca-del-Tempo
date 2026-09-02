import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';
import type { User } from '../types';

interface LoginForm { email: string; password: string; }

export default function Accedi() {
  const navigate = useNavigate();
  const setSession = useAuthStore(s => s.setSession);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>({
    defaultValues: { email: 'marco@vicini.it', password: 'demo1234' },
  });

  async function onSubmit(data: LoginForm) {
    setError(null);
    try {
      const res = await api.post<{ accessToken: string; user: User }>('/auth/login', data);
      setSession(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Errore durante l\'accesso');
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-semibold mb-2">Bentornato</h1>
      <p className="text-ink-500 mb-8">Accedi per continuare ad aiutare i tuoi vicini.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
          <input
            type="email"
            {...register('email', { required: true })}
            className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
            placeholder="tu@email.it"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Password</label>
          <input
            type="password"
            {...register('password', { required: true })}
            className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
            placeholder="La tua password"
          />
        </div>
        {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 transition text-white font-semibold py-3.5 rounded-xl shadow-soft"
        >
          {isSubmitting ? 'Accesso in corso…' : 'Accedi'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-500 mt-6">
        Non hai un account? <Link to="/registrati" className="text-primary-600 font-semibold">Registrati</Link>
      </p>

      <div className="mt-8 bg-ink-50 rounded-xl p-4 text-xs text-ink-600">
        <strong>Demo:</strong> marco@vicini.it / demo1234 · sofia@vicini.it / demo1234 · giulia@vicini.it / demo1234 (moderatrice)
      </div>
    </div>
  );
}
