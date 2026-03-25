// src/app/auth/login/LoginPage.tsx
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await loginAction(email, password);

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Email ou mot de passe incorrect.');
        setLoading(false);
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <>
      <ThemeInit />
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-md p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Connexion</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Accédez à votre espace 5S</p>
          </div>

          {registered && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--bg-success)', color: 'var(--text-success)' }}>
              ✅ Compte créé avec succès ! Connectez-vous maintenant.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                disabled={loading}
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--bg-error)', color: 'var(--text-error)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white' }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="font-medium" style={{ color: '#3B82F6' }}>
                S'inscrire
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={toggleTheme}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {theme === 'dark' ? '☀️' : '🌙'} Thème
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
