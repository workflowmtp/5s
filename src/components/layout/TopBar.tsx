// src/components/layout/TopBar.tsx
'use client';

import Link from 'next/link';
import { useThemeStore } from '@/lib/store';

const ROLE_STYLES: Record<string, string> = {
  employe: 'bg-blue-500 text-white',
  superviseur: 'bg-amber-500 text-black',
  direction: 'bg-purple-500 text-white',
  admin: 'bg-red-500 text-white',
};

const ROLE_LABELS: Record<string, string> = {
  employe: 'Employé',
  superviseur: 'Superviseur',
  direction: 'Direction',
  admin: 'Admin',
};

export function TopBar({ user }: { user: any }) {
  const { theme, toggleTheme } = useThemeStore();
  const initials = (user.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="h-16 min-h-[64px] flex items-center px-4 gap-3 z-50"
      style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
      <div className="w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
        5S
      </div>
      <div className="flex-1 text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
        5S Excellence
      </div>
      <button onClick={toggleTheme}
        className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 transition-all"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {theme === 'light' ? '☀️' : '🌙'}
      </button>
      <Link href="/dashboard/profil" className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all"
        style={{ color: 'var(--text-secondary)' }}>
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-semibold text-xs text-white flex-shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{user.name?.split(' ')[0]}</div>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${ROLE_STYLES[user.role] || ''}`}>
            {ROLE_LABELS[user.role] || user.role}
          </span>
        </div>
      </Link>
    </div>
  );
}
