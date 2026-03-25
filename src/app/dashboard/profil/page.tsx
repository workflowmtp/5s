// src/app/dashboard/profil/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { Card } from '@/components/ui/Card';

export default function ProfilPage() {
  const { data: session } = useSession();
  if (!session?.user) return null;
  const user = session.user as any;

  const initials = (user.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const ROLE_LABELS: Record<string, string> = { employe: 'Employé', superviseur: 'Superviseur', direction: 'Direction', admin: 'Administrateur' };

  const rows = [
    { label: 'Matricule', value: user.matricule },
    { label: 'Service', value: user.serviceName },
    { label: 'Atelier', value: user.atelierName || '--' },
    { label: 'Fonction', value: user.fonction },
    { label: 'Rôle', value: ROLE_LABELS[user.role] || user.role },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Mon Profil</h1>

      {/* Avatar */}
      <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-[28px] text-white mx-auto mb-4"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
        {initials}
      </div>

      <div className="text-center mb-6">
        <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
        <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{ROLE_LABELS[user.role]} • {user.serviceName}</div>
      </div>

      {/* Details */}
      <Card>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-3 px-1"
            style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : undefined }}>
            <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
            <span className="text-[13px] font-medium font-mono" style={{ color: 'var(--text-primary)' }}>{r.value}</span>
          </div>
        ))}
      </Card>

      <button onClick={() => signOut({ callbackUrl: '/auth/login' })}
        className="w-full px-5 py-3.5 rounded-lg font-semibold text-[14px] text-white bg-red-500 mt-5 transition-all active:scale-[0.97]">
        🚪 Déconnexion
      </button>
    </div>
  );
}
