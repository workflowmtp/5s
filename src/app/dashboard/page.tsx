// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Card';
import { RadarChart5S } from '@/components/charts/RadarChart5S';
import { LineChart5S } from '@/components/charts/LineChart5S';
import { getAppreciation5S, getAppreciationSugg, getScoreHex } from '@/lib/constants';
import { hasAnyPermission } from '@/lib/constants';

interface DashData {
  avg5S: number;
  avgSugg: number;
  nbEvals: number;
  nbSuggs: number;
  nbRetenues: number;
  lastEval: any;
  evolution: { date: string; score5S: number }[];
  recent: any[];
  globalStats: any;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashData | null>(null);

  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then(setStats).catch(console.error);
  }, []);

  if (!session?.user) return null;
  const user = session.user as any;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{greeting}, {user.name?.split(' ')[0]} 👋</h1>
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Votre tableau de bord personnel</p>
      </div>

      {/* Score Hero */}
      <div className="flex gap-2.5 mb-3.5">
        {[
          { label: 'Score 5S moyen', value: stats?.avg5S, apprec: stats?.avg5S ? getAppreciation5S(stats.avg5S) : '', gradient: 'from-emerald-500 to-cyan-500' },
          { label: 'Score suggestions', value: stats?.avgSugg, apprec: stats?.avgSugg ? getAppreciationSugg(stats.avgSugg) : '', gradient: 'from-purple-500 to-blue-500' },
        ].map((card, i) => (
          <div key={i} className="flex-1 rounded-[14px] p-4 text-center relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.gradient}`} />
            <div className="font-mono text-[32px] font-bold leading-none mb-0.5"
              style={{ color: card.value ? getScoreHex(card.value) : 'var(--text-muted)' }}>
              {card.value || '--'}
            </div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
            {card.apprec && <div className="text-[11px] font-semibold mt-1" style={{ color: card.value ? getScoreHex(card.value) : '' }}>{card.apprec}</div>}
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 mb-3.5">
        {[
          { label: 'Évaluations', value: stats?.nbEvals ?? 0, color: '#3B82F6' },
          { label: 'Suggestions', value: stats?.nbSuggs ?? 0, color: '#EAB308' },
          { label: 'Retenues', value: stats?.nbRetenues ?? 0, color: '#10B981' },
        ].map((kpi, i) => (
          <div key={i} className="rounded-lg p-2.5 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="font-mono text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Radar */}
      {stats?.lastEval && (
        <Card><RadarChart5S data={stats.lastEval} /></Card>
      )}

      {/* Evolution */}
      {stats?.evolution && stats.evolution.length >= 2 && (
        <Card><LineChart5S data={stats.evolution} /></Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {[
          { href: '/dashboard/eval5s', icon: '📋', label: 'Évaluation 5S' },
          { href: '/dashboard/suggestions', icon: '💡', label: 'Suggestion' },
          { href: '/dashboard/historique', icon: '📊', label: 'Historique' },
          { href: '/dashboard/classements', icon: '🏆', label: 'Classements' },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="rounded-[14px] p-4 flex flex-col items-center gap-2 text-center transition-all active:scale-[0.97]"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="text-[28px]">{a.icon}</span>
            <span className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Supervisor/Direction quick links */}
      {hasAnyPermission(user.role, ['superviseur_dashboard', 'direction_dashboard']) && (
        <>
          <div className="text-[13px] font-semibold uppercase tracking-wide mb-2.5 mt-5" style={{ color: 'var(--text-muted)' }}>Gestion d'équipe</div>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <Link href="/dashboard/superviseur" className="rounded-[14px] p-4 flex flex-col items-center gap-2 text-center transition-all active:scale-[0.97]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <span className="text-[28px]">👥</span>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Vue Superviseur</span>
            </Link>
            {hasAnyPermission(user.role, ['direction_dashboard']) && (
              <Link href="/dashboard/direction" className="rounded-[14px] p-4 flex flex-col items-center gap-2 text-center transition-all active:scale-[0.97]"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <span className="text-[28px]">📈</span>
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Vue Direction</span>
              </Link>
            )}
          </div>
        </>
      )}

      {/* Admin links */}
      {hasAnyPermission(user.role, ['admin_users']) && (
        <>
          <div className="text-[13px] font-semibold uppercase tracking-wide mb-2.5 mt-5" style={{ color: 'var(--text-muted)' }}>Administration</div>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <Link href="/dashboard/admin" className="rounded-[14px] p-4 flex flex-col items-center gap-2 text-center transition-all active:scale-[0.97]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <span className="text-[28px]">⚙️</span>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Administration</span>
            </Link>
            <Link href="/dashboard/actions" className="rounded-[14px] p-4 flex flex-col items-center gap-2 text-center transition-all active:scale-[0.97]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <span className="text-[28px]">🔧</span>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions correctives</span>
            </Link>
          </div>
        </>
      )}

      {/* Recent Activity */}
      <div className="text-[13px] font-semibold uppercase tracking-wide mb-2.5 mt-5" style={{ color: 'var(--text-muted)' }}>Activité récente</div>
      {stats?.recent && stats.recent.length > 0 ? (
        stats.recent.map((r: any, i: number) => (
          <div key={i} className="flex items-center gap-3 px-3.5 py-3 rounded-lg mb-2 transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="text-xl">{r.type === '5S' ? '📋' : '💡'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {r.type === '5S' ? `5S — ${r.score || '--'}/100` : r.label || 'Suggestion'}
              </div>
              <div className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                {r.date} <StatusBadge status={r.statut} />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <div className="text-5xl mb-3 opacity-50">📭</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucune activité récente</div>
        </div>
      )}
    </div>
  );
}
