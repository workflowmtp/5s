// src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeInit } from '@/components/layout/ThemeInit';
import { useThemeStore } from '@/lib/store';

export default function RegisterPage() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telephone, setTelephone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();

  const handleRegister = async () => {
    setError('');

    if (!nom || !prenom || !email || !password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, email: email.toLowerCase(), password, telephone: telephone || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création du compte.');
        setLoading(false);
        return;
      }

      router.push('/auth/login?registered=1');
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <>
      <ThemeInit />
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-10"
        style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <div className="w-[72px] h-[72px] rounded-[14px] flex items-center justify-center font-bold text-xl text-white mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 8px 32px rgba(59,130,246,0.25)' }}>
            5S
          </div>

          <h1 className="text-center text-[22px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Créer un compte</h1>
          <p className="text-center text-[13px] mb-6" style={{ color: 'var(--text-muted)' }}>Rejoignez 5S Excellence</p>

          {/* Theme toggle */}
          <div className="text-center mb-6">
            <button onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-base mx-auto transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {theme === 'light' ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3.5 py-2.5 rounded-lg text-[13px] mb-4 bg-red-500/10 text-red-500">{error}</div>
          )}

          {/* Form */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nom *</label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                placeholder="Nom" className="w-full px-3.5 py-3 rounded-lg text-[15px] outline-none transition-all" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Prénom *</label>
              <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                placeholder="Prénom" className="w-full px-3.5 py-3 rounded-lg text-[15px] outline-none transition-all" style={inputStyle} />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com" autoComplete="email"
              className="w-full px-3.5 py-3 rounded-lg text-[15px] outline-none transition-all" style={inputStyle} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mot de passe *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 caractères"
                className="w-full px-3.5 py-3 rounded-lg text-[15px] outline-none transition-all" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirmer *</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer"
                className="w-full px-3.5 py-3 rounded-lg text-[15px] outline-none transition-all" style={inputStyle} />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Téléphone</label>
            <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)}
              placeholder="690 000 000"
              className="w-full px-3.5 py-3 rounded-lg text-[15px] outline-none transition-all" style={inputStyle} />
          </div>

          <button onClick={handleRegister} disabled={loading}
            className="w-full px-5 py-3.5 rounded-lg font-semibold text-[15px] text-white bg-blue-500 hover:bg-blue-600 transition-all disabled:opacity-50">
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>

          {/* Link to login */}
          <p className="text-center text-[13px] mt-5" style={{ color: 'var(--text-muted)' }}>
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-blue-500 hover:text-blue-600 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
