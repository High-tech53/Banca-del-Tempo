import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';
import type { User, AccountKind } from '../types';

interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  city: string;
  zipCode: string;
  accountKind: AccountKind;
  acceptedCodeOfCare: boolean;
}

export default function Registrati() {
  const navigate = useNavigate();
  const setSession = useAuthStore(s => s.setSession);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<RegisterForm>({
    defaultValues: { accountKind: 'OFFERER', city: 'Roma', zipCode: '00153' },
  });
  const accountKind = watch('accountKind');

  async function onSubmit(data: RegisterForm) {
    setError(null);
    if (!data.acceptedCodeOfCare) { setError('Devi accettare il Codice di Cura'); return; }
    try {
      const res = await api.post<{ accessToken: string; user: User }>('/auth/register', data);
      setSession(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Errore durante la registrazione');
    }
  }

  const roles: { value: AccountKind; label: string }[] = [
    { value: 'OFFERER',   label: 'Offrire'  },
    { value: 'REQUESTER', label: 'Chiedere' },
    { value: 'BOTH',      label: 'Entrambi' },
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="font-display text-4xl font-semibold mb-2">Crea il tuo account</h1>
      <p className="text-ink-500 mb-8">Bastano 2 minuti. Niente carta di credito, mai.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Nome</label>
            <input {...register('firstName', { required: true })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition" placeholder="Marco" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Cognome</label>
            <input {...register('lastName', { required: true })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition" placeholder="Rossi" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
          <input type="email" {...register('email', { required: true })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition" placeholder="tu@email.it" />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Password</label>
          <input type="password" {...register('password', { required: true, minLength: 8 })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition" placeholder="Almeno 8 caratteri" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Città</label>
            <input {...register('city', { required: true })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">CAP</label>
            <input {...register('zipCode', { required: true })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Voglio...</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map(r => (
              <button
                type="button"
                key={r.value}
                onClick={() => setValue('accountKind', r.value)}
                className={`rounded-xl py-3 text-sm font-semibold transition ${
                  accountKind === r.value
                    ? 'border-2 border-primary-500 bg-primary-50 text-primary-700'
                    : 'border border-ink-200 text-ink-700 hover:bg-ink-50'
                }`}
              >{r.label}</button>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm text-ink-600 cursor-pointer">
          <input type="checkbox" {...register('acceptedCodeOfCare')} className="mt-0.5" />
          <span>Accetto il <a href="#" className="text-primary-600 font-medium">Codice di Cura</a> e i <a href="#" className="text-primary-600 font-medium">Termini di servizio</a>.</span>
        </label>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

        <button type="submit" disabled={isSubmitting} className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 transition text-white font-semibold py-3.5 rounded-xl shadow-soft">
          {isSubmitting ? 'Creazione…' : 'Crea account'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-500 mt-6">
        Hai già un account? <Link to="/accedi" className="text-primary-600 font-semibold">Accedi</Link>
      </p>
    </div>
  );
}
