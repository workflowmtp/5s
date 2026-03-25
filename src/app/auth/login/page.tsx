// src/app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeInit } from '@/components/layout/ThemeInit';
import { useThemeStore } from '@/lib/store';
import { loginAction } from './actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === '1';
  const { theme, toggleTheme } = useThemeStore();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const e = email.trim().toLowerCase();
    const p = password;

    if (!e || !p) { setError('Veuillez remplir tous les champs.'); setLoading(false); return; }

    const result = await loginAction(e, p);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Email ou mot de passe incorrect.');
      setLoading(false);
    }
  };

  return (
    <>
      <ThemeInit />
      <div className="min-h-dvh flex flex-col items-center justify-center px-6"
        style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-[380px]">
          {/* Logo */}
          <div className="w-[72px] h-[72px] rounded-[14px] flex items-center justify-center font-bold text-xl text-white mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 8px 32px rgba(59,130,246,0.25)' }}>
            5S
          </div>

          <h1 className="text-center text-[22px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>5S Excellence</h1>
          <p className="text-center text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>Suggestions & Amélioration Continue</p>

          {/* Theme toggle */}
          <div className="text-center mb-6">
            <button onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-base mx-auto transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {theme === 'light' ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Success after registration */}
          {registered && (
            <div className="px-3.5 py-2.5 rounded-lg text-[13px] mb-4 bg-green-500/10 text-green-500">
              Compte créé avec succès ! Connectez-vous.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-3.5 py-2.5 rounded-lg text-[13px] mb-4 bg-red-500/10 text-red-500">{error}</div>
          )}

          {/* Form */}
          <div className="mb-4">
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="votre@email.com" autoComplete="email"
              className="w-full px-3.5 py-3 rounded-lg text-[15px] outline-none transition-all"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>

          <div className="mb-6">
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Mot de passe"
              className="w-full px-3.5 py-3 rounded-lg text-[15px] outline-none transition-all"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>

          <button onClick={() => handleLogin()} disabled={loading}
            className="w-full px-5 py-3.5 rounded-lg font-semibold text-[15px] text-white bg-blue-500 hover:bg-blue-600 transition-all disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          {/* Link to register */}
          <p className="text-center text-[13px] mt-5" style={{ color: 'var(--text-muted)' }}>
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-blue-500 hover:text-blue-600 font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
