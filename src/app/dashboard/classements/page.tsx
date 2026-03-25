// src/app/dashboard/classements/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { getScoreHex } from '@/lib/constants';

export default function ClassementsPage() {
  const [tab, setTab] = useState('5s');
  const [evals, setEvals] = useState<any[]>([]);
  const [suggs, setSuggs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/evaluations').then(r => r.json()).then(setEvals);
    fetch('/api/suggestions').then(r => r.json()).then(setSuggs);
  }, []);

  // Calc top 5S users
  const userScores: Record<string, { name: string; total: number; count: number }> = {};
  evals.forEach(e => {
    if (!e.scoreTotal || !e.user) return;
    const uid = e.user.id;
    if (!userScores[uid]) userScores[uid] = { name: e.user.prenom + ' ' + e.user.nom, total: 0, count: 0 };
    userScores[uid].total += e.scoreTotal;
    userScores[uid].count++;
  });
  const top5S = Object.values(userScores).map(u => ({ ...u, avg: Math.round(u.total / u.count) })).sort((a, b) => b.avg - a.avg).slice(0, 10);

  // Top suggestions
  const userSuggs: Record<string, { name: string; total: number; count: number; retained: number }> = {};
  suggs.forEach(s => {
    if (!s.user) return;
    const uid = s.user.id;
    if (!userSuggs[uid]) userSuggs[uid] = { name: s.user.prenom + ' ' + s.user.nom, total: 0, count: 0, retained: 0 };
    userSuggs[uid].count++;
    if (s.scoreTotal) userSuggs[uid].total += s.scoreTotal;
    if (['retenue', 'planifiee', 'en_cours', 'mise_en_oeuvre', 'cloturee'].includes(s.statut)) userSuggs[uid].retained++;
  });
  const topSugg = Object.values(userSuggs).map(u => ({ ...u, quality: u.count > 0 ? Math.round((u.total / u.count) * Math.log2(u.count + 1)) : 0 })).sort((a, b) => b.quality - a.quality).slice(0, 10);

  const medals = ['🥇', '🥈', '🥉'];
  const tabs = [{ k: '5s', l: '🏅 Top 5S' }, { k: 'sugg', l: '💡 Top Idées' }, { k: 'badges', l: '🎖️ Badges' }];

  return (
    <div className="animate-fade-in">
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>🏆 Classements</h1></div>
      <div className="flex gap-1.5 mb-5">{tabs.map(t => <button key={t.k} onClick={() => setTab(t.k)} className={'flex-1 py-2.5 rounded-lg text-[12px] font-semibold border transition-all ' + (tab === t.k ? 'bg-blue-500/15 text-blue-500 border-blue-500' : '')} style={tab !== t.k ? { background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' } : undefined}>{t.l}</button>)}</div>

      {tab === '5s' && (<>
        {top5S.length > 0 && <div className="flex justify-center gap-4 mb-5">
          {top5S.slice(0, 3).map((u, i) => {
            const order = i === 0 ? 1 : i === 1 ? 0 : 2;
            return <div key={i} className="text-center" style={{ order }}><div className="text-3xl mb-1">{medals[i]}</div><div className={'rounded-full mx-auto mb-1 flex items-center justify-center font-bold text-white ' + (i === 0 ? 'w-16 h-16 text-lg bg-yellow-500' : 'w-12 h-12 text-sm bg-gray-400')}>{u.name.split(' ').map(n => n[0]).join('')}</div><div className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name.split(' ')[0]}</div><div className="font-mono font-bold text-sm" style={{ color: getScoreHex(u.avg) }}>{u.avg}/100</div></div>;
          })}
        </div>}
        {top5S.map((u, i) => <div key={i} className="flex items-center gap-3 rounded-lg p-3 mb-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: i < 3 ? 'rgba(234,179,8,0.15)' : 'var(--bg-input)', color: i < 3 ? '#EAB308' : 'var(--text-muted)' }}>{i + 1}</div>
          <div className="flex-1"><div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</div><div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{u.count} éval.</div></div>
          <div className="font-mono font-bold" style={{ color: getScoreHex(u.avg) }}>{u.avg}</div>
        </div>)}
      </>)}

      {tab === 'sugg' && topSugg.map((u, i) => <div key={i} className="flex items-center gap-3 rounded-lg p-3 mb-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: i < 3 ? 'rgba(139,92,246,0.15)' : 'var(--bg-input)', color: i < 3 ? '#8B5CF6' : 'var(--text-muted)' }}>{i < 3 ? medals[i] : i + 1}</div>
        <div className="flex-1"><div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</div><div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{u.count} sugg. · {u.retained} retenue(s)</div></div>
        <div className="font-mono font-bold text-purple-400">{u.quality}</div>
      </div>)}

      {tab === 'badges' && <Card><CardTitle>🎖️ Badges disponibles</CardTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {[{ icon: '🥇', name: 'Champion 5S', cond: 'Moy ≥ 90' }, { icon: '⭐', name: 'Discipline', cond: 'Shitsuke ≥ 90 ×3' }, { icon: '🏅', name: 'Poste modèle', cond: '100/100' }, { icon: '📈', name: 'Progression', cond: 'Gain ≥ 15 pts' }, { icon: '🔁', name: 'Régularité', cond: '4 évals ≥ 80' }, { icon: '💡', name: 'Idée utile', cond: '1 suggestion retenue' }, { icon: '🎯', name: 'Fort impact', cond: 'Score ≥ 90' }, { icon: '🚀', name: 'Innovateur', cond: '3 retenues' }, { icon: '🔄', name: 'Contributeur AC', cond: '5 sugg ≥ 70' }, { icon: '🌟', name: 'Meilleure du mois', cond: 'Top mensuel' }].map((b, i) => (
            <div key={i} className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{b.name}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{b.cond}</div>
            </div>
          ))}
        </div>
      </Card>}
    </div>
  );
}
