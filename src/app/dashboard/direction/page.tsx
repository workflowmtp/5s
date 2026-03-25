// src/app/dashboard/direction/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardTitle, ScoreCircle } from '@/components/ui/Card';
import { getScoreHex } from '@/lib/constants';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useThemeStore } from '@/lib/store';

export default function DirectionPage() {
  const theme = useThemeStore(s => s.theme);
  const [dash, setDash] = useState<any>(null);
  const [evals, setEvals] = useState<any[]>([]);
  const [suggs, setSuggs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setDash);
    fetch('/api/evaluations').then(r => r.json()).then(setEvals);
    fetch('/api/suggestions').then(r => r.json()).then(setSuggs);
  }, []);

  // Service comparison
  const svcScores: Record<string, { name: string; total: number; count: number }> = {};
  evals.forEach(e => { if (!e.scoreTotal || !e.service) return; const n = e.service.nom; if (!svcScores[n]) svcScores[n] = { name: n, total: 0, count: 0 }; svcScores[n].total += e.scoreTotal; svcScores[n].count++; });
  const barData = Object.values(svcScores).map(s => ({ name: s.name.length > 14 ? s.name.slice(0, 12) + '...' : s.name, avg: Math.round(s.total / s.count) })).sort((a, b) => b.avg - a.avg);

  // Category distribution
  const catCounts: Record<string, number> = {};
  suggs.forEach(s => { const n = s.categorie?.nom || 'Autre'; catCounts[n] = (catCounts[n] || 0) + 1; });
  const pieData = Object.entries(catCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  const palette = theme === 'light' ? ['#5B21B6','#1D4ED8','#047857','#92400E','#991B1B','#0E7490','#BE185D','#C2410C'] : ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899','#F97316'];

  // Top 5 contributors
  const userAvg: Record<string, { name: string; total: number; count: number }> = {};
  evals.forEach(e => { if (!e.scoreTotal || !e.user) return; const uid = e.user.id; if (!userAvg[uid]) userAvg[uid] = { name: e.user.prenom + ' ' + e.user.nom, total: 0, count: 0 }; userAvg[uid].total += e.scoreTotal; userAvg[uid].count++; });
  const top5 = Object.values(userAvg).map(u => ({ ...u, avg: Math.round(u.total / u.count) })).sort((a, b) => b.avg - a.avg).slice(0, 5);

  // Top suggestions
  const topSuggs = [...suggs].filter(s => s.scoreTotal && s.scoreTotal >= 80).sort((a, b) => b.scoreTotal - a.scoreTotal).slice(0, 5);

  const g = dash?.globalStats;
  const gridColor = theme === 'light' ? '#E5E7EB' : 'rgba(30,45,64,0.4)';
  const tickColor = theme === 'light' ? '#374151' : '#556677';

  return (
    <div className="animate-fade-in">
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>📈 Vue Direction</h1></div>

      {/* Global KPIs */}
      {g && <div className="grid grid-cols-4 gap-2 mb-4">
        {[{ l: 'Score 5S', v: dash.avg5S, c: getScoreHex(dash.avg5S) }, { l: 'Suggestions', v: g.totalSuggs, c: '#EAB308' }, { l: 'Particip.', v: g.participation + '%', c: '#3B82F6' }, { l: 'Transform.', v: Math.round((suggs.filter((s: any) => ['retenue','planifiee','en_cours','mise_en_oeuvre','cloturee'].includes(s.statut)).length / Math.max(suggs.length,1)) * 100) + '%', c: '#10B981' }].map((k, i) =>
          <div key={i} className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="font-mono text-lg font-bold" style={{ color: k.c }}>{k.v}</div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{k.l}</div>
          </div>
        )}
      </div>}

      {/* Bar chart services */}
      {barData.length > 0 && <Card><CardTitle>📊 Score 5S par service</CardTitle>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} layout="vertical"><CartesianGrid stroke={gridColor} strokeDasharray="3 3" /><XAxis type="number" domain={[0, 100]} tick={{ fill: tickColor, fontSize: 10 }} /><YAxis type="category" dataKey="name" tick={{ fill: tickColor, fontSize: 10 }} width={120} /><Tooltip /><Bar dataKey="avg" radius={[0, 6, 6, 0]} maxBarSize={20}>{barData.map((d, i) => <Cell key={i} fill={getScoreHex(d.avg, theme === 'light') + 'B0'} />)}</Bar></BarChart>
        </ResponsiveContainer>
      </Card>}

      {/* Pie chart categories */}
      {pieData.length > 0 && <Card><CardTitle>📦 Répartition par catégorie</CardTitle>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={({ name, value }) => name.slice(0, 8) + ' (' + value + ')'}>{pieData.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}</Pie><Tooltip /></PieChart>
        </ResponsiveContainer>
      </Card>}

      {/* Top 5 contributors */}
      {top5.length > 0 && <Card><CardTitle>🏅 Top 5 contributeurs 5S</CardTitle>
        {top5.map((u, i) => <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
          <span className="text-base">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
          <span className="flex-1 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
          <span className="font-mono font-bold" style={{ color: getScoreHex(u.avg) }}>{u.avg}/100</span>
        </div>)}
      </Card>}

      {/* Top suggestions */}
      {topSuggs.length > 0 && <Card><CardTitle>⭐ Suggestions à fort impact</CardTitle>
        {topSuggs.map((s, i) => <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: i < topSuggs.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <span>{s.categorie?.icone || '📌'}</span>
          <div className="flex-1 min-w-0"><div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.titre}</div><div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.user?.prenom} {s.user?.nom}</div></div>
          <ScoreCircle score={s.scoreTotal} size="sm" />
        </div>)}
      </Card>}
    </div>
  );
}
