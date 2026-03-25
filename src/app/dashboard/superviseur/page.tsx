// src/app/dashboard/superviseur/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardTitle, StatusBadge, ScoreCircle } from '@/components/ui/Card';
import { getScoreHex } from '@/lib/constants';

export default function SuperviseurPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [evals, setEvals] = useState<any[]>([]);
  const [suggs, setSuggs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/evaluations').then(r => r.json()).then(setEvals);
    fetch('/api/suggestions').then(r => r.json()).then(setSuggs);
    fetch('/api/users').then(r => r.json()).then(setUsers);
  }, []);

  const teamUsers = users.filter(u => u.service?.id === user?.serviceId && u.statut === 'actif');

  // Member scores
  const memberStats = teamUsers.map(u => {
    const uEvals = evals.filter(e => e.user?.id === u.id && e.scoreTotal);
    const avg = uEvals.length > 0 ? Math.round(uEvals.reduce((a: number, e: any) => a + e.scoreTotal, 0) / uEvals.length) : 0;
    const last = uEvals.length > 0 ? uEvals[0] : null;
    return { ...u, evalCount: uEvals.length, avg5S: avg, lastEval: last };
  }).sort((a, b) => b.avg5S - a.avg5S);

  // Alerts
  const alerts: { type: string; msg: string; user: string }[] = [];
  memberStats.forEach(m => {
    if (m.avg5S > 0 && m.avg5S < 60) alerts.push({ type: 'danger', msg: 'Score critique : ' + m.avg5S + '/100', user: m.prenom + ' ' + m.nom });
    if (m.evalCount === 0) alerts.push({ type: 'warning', msg: 'Aucune évaluation', user: m.prenom + ' ' + m.nom });
  });

  // Suggestions to review
  const suggsToReview = suggs.filter(s => ['soumise', 'analysee'].includes(s.statut));

  const avgTeam = memberStats.filter(m => m.avg5S > 0).length > 0 ? Math.round(memberStats.filter(m => m.avg5S > 0).reduce((a, m) => a + m.avg5S, 0) / memberStats.filter(m => m.avg5S > 0).length) : 0;

  return (
    <div className="animate-fade-in">
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>👥 Vue Superviseur</h1><p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{user?.serviceName}</p></div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[{ l: 'Membres', v: teamUsers.length, c: '#3B82F6' }, { l: 'Évals', v: evals.length, c: '#10B981' }, { l: 'Moy. 5S', v: avgTeam, c: getScoreHex(avgTeam) }, { l: 'Suggestions', v: suggs.length, c: '#EAB308' }].map((k, i) =>
          <div key={i} className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="font-mono text-lg font-bold" style={{ color: k.c }}>{k.v}</div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{k.l}</div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && <Card>
        <CardTitle>⚠️ Alertes ({alerts.length})</CardTitle>
        {alerts.slice(0, 5).map((a, i) => (
          <div key={i} className="flex items-center gap-2 py-2 px-2 rounded-md mb-1.5" style={{ background: a.type === 'danger' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: '1px solid ' + (a.type === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)') }}>
            <span className="text-sm">{a.type === 'danger' ? '🔴' : '🟡'}</span>
            <div className="flex-1"><div className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{a.user}</div><div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{a.msg}</div></div>
          </div>
        ))}
      </Card>}

      {/* Members */}
      <CardTitle>👤 Équipe</CardTitle>
      {memberStats.map(m => (
        <div key={m.id} className="flex items-center gap-3 rounded-[14px] p-3.5 mb-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs text-white">{(m.prenom?.[0] || '') + (m.nom?.[0] || '')}</div>
          <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{m.prenom} {m.nom}</div><div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{m.fonction} · {m.evalCount} éval.</div></div>
          {m.avg5S > 0 && <div className="font-mono font-bold text-sm" style={{ color: getScoreHex(m.avg5S) }}>{m.avg5S}</div>}
        </div>
      ))}

      {/* Suggestions to review */}
      {suggsToReview.length > 0 && <><CardTitle>💡 Suggestions à traiter ({suggsToReview.length})</CardTitle>
        {suggsToReview.map(s => (
          <div key={s.id} className="flex items-center gap-3 rounded-[14px] p-3.5 mb-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="text-lg">{s.categorie?.icone || '📌'}</span>
            <div className="flex-1 min-w-0"><div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.titre}</div><div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.user?.prenom} {s.user?.nom} · <StatusBadge status={s.statut} /></div></div>
          </div>
        ))}
      </>}
    </div>
  );
}
