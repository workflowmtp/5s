// src/app/dashboard/historique/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, StatusBadge, ScoreCircle } from '@/components/ui/Card';
import { LineChart5S } from '@/components/charts/LineChart5S';

export default function HistoriquePage() {
  const [tab, setTab] = useState<'5s' | 'sugg'>('5s');
  const [evals, setEvals] = useState<any[]>([]);
  const [suggs, setSuggs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/evaluations').then(r => r.json()).then(setEvals);
    fetch('/api/suggestions').then(r => r.json()).then(setSuggs);
  }, []);

  const evoData = evals.filter(e => e.scoreTotal).map(e => ({ date: e.date?.split('T')[0], score5S: e.scoreTotal })).reverse();

  return (
    <div className="animate-fade-in">
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>📊 Mon Historique</h1></div>
      <div className="flex gap-1.5 mb-4">
        {[{ k: '5s' as const, l: '📋 5S (' + evals.length + ')' }, { k: 'sugg' as const, l: '💡 Suggestions (' + suggs.length + ')' }].map(t =>
          <button key={t.k} onClick={() => setTab(t.k)} className={'flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all border ' + (tab === t.k ? 'bg-blue-500/15 text-blue-500 border-blue-500' : '')} style={tab !== t.k ? { background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' } : undefined}>{t.l}</button>
        )}
      </div>
      {tab === '5s' && evoData.length >= 2 && <Card><LineChart5S data={evoData} /></Card>}
      {tab === '5s' && (evals.length === 0 ? <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Aucune évaluation</div> : evals.map(e =>
        <div key={e.id} className="flex items-center gap-3 rounded-[14px] p-4 mb-2.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <ScoreCircle score={e.scoreTotal} size="sm" />
          <div className="flex-1 min-w-0"><div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{e.zone?.nom || 'Zone'}</div><div className="text-[11px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>{e.date?.split('T')[0]} · {e.appreciation || ''} <StatusBadge status={e.statut} /></div></div>
        </div>
      ))}
      {tab === 'sugg' && (suggs.length === 0 ? <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Aucune suggestion</div> : suggs.map(s =>
        <div key={s.id} className="flex items-center gap-3 rounded-[14px] p-4 mb-2.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <span className="text-xl">{s.categorie?.icone || '📌'}</span>
          <div className="flex-1 min-w-0"><div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.titre}</div><div className="text-[11px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>{s.date?.split('T')[0]} <StatusBadge status={s.statut} /></div></div>
          {s.scoreTotal != null && <ScoreCircle score={s.scoreTotal} size="sm" />}
        </div>
      ))}
    </div>
  );
}
