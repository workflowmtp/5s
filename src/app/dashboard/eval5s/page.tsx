// src/app/dashboard/eval5s/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardTitle, ScoreCircle } from '@/components/ui/Card';
import { PILIERS_5S, TOTAL_QUESTIONS_5S, calcTotalScore5S, getAppreciation5S, getScoreHex } from '@/lib/constants';

type Phase = 'setup' | 'questionnaire' | 'result';

export default function Eval5SPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [phase, setPhase] = useState<Phase>('setup');
  const [services, setServices] = useState<any[]>([]);
  const [ateliers, setAteliers] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceId, setServiceId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [commentGen, setCommentGen] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [openPillars, setOpenPillars] = useState<Record<string, boolean>>({ seiri: true });
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/services').then(r => r.json()).then(setServices);
    fetch('/api/admin/ateliers').then(r => r.json()).then(setAteliers);
  }, []);

  useEffect(() => {
    if (user?.serviceId) setServiceId(user.serviceId);
    if (user?.atelierId) setZoneId(user.atelierId);
  }, [user]);

  const answered = Object.keys(answers).filter(k => answers[k] > 0).length;
  const progress = Math.round((answered / TOTAL_QUESTIONS_5S) * 100);
  const scores = calcTotalScore5S(answers);

  const rate = (qId: string, value: number) => {
    const next = { ...answers, [qId]: value };
    setAnswers(next);
    const pKey = qId.split('_')[0];
    const pillar = PILIERS_5S.find(p => p.key === pKey);
    if (pillar && pillar.questions.every(q => next[q.id] > 0)) {
      const idx = PILIERS_5S.findIndex(p => p.key === pKey);
      if (idx < PILIERS_5S.length - 1) setOpenPillars(p => ({ ...p, [PILIERS_5S[idx + 1].key]: true }));
    }
  };

  const submit = async () => {
    if (answered < TOTAL_QUESTIONS_5S) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, serviceId, zoneId, commentaireGeneral: commentGen, reponses: answers, statut: 'soumise' }),
      });
      const evalData = await res.json();
      try {
        const iaRes = await fetch('/api/ai/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: '5s', prompt: 'Analyse 5S. Score: ' + scores.total + '/100. Piliers: ' + JSON.stringify(scores.pillarScores) }),
        });
        const iaData = await iaRes.json();
        if (iaData.result) {
          await fetch('/api/evaluations/' + evalData.id, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentaireIA: iaData.result.commentaire, forces: iaData.result.forces || [], faiblesses: iaData.result.faiblesses || [], actionsRecommandees: iaData.result.actions || [], syntheseManageriale: iaData.result.synthese_manageriale, iaSource: 'api', statut: 'analysee' }),
          });
          evalData.commentaireIA = iaData.result.commentaire;
          evalData.forces = iaData.result.forces || [];
          evalData.faiblesses = iaData.result.faiblesses || [];
          evalData.actionsRecommandees = iaData.result.actions || [];
          evalData.iaSource = 'api';
        }
      } catch {}
      setResult({ ...evalData, ...scores, appreciation: getAppreciation5S(scores.total) });
      setPhase('result');
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const newEval = () => { setAnswers({}); setOpenPillars({ seiri: true }); setResult(null); setPhase('setup'); };
  const rColors = ['', 'bg-red-500/15 text-red-400 border-red-500', 'bg-amber-500/15 text-amber-400 border-amber-500', 'bg-yellow-500/15 text-yellow-400 border-yellow-500', 'bg-cyan-500/15 text-cyan-400 border-cyan-500', 'bg-emerald-500/15 text-emerald-400 border-emerald-500'];

  // ===== SETUP =====
  if (phase === 'setup') return (
    <div className="animate-fade-in">
      <div className="mb-5"><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>📋 Évaluation 5S</h1><p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Évaluez votre poste de travail</p></div>
      <div className="space-y-4 mb-6">
        <div><label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3.5 py-3 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
        <div><label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Service</label><select value={serviceId} onChange={e => setServiceId(e.target.value)} className="w-full px-3.5 py-3 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}><option value="">— Sélectionner —</option>{services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}</select></div>
        <div><label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Zone / Atelier</label><select value={zoneId} onChange={e => setZoneId(e.target.value)} className="w-full px-3.5 py-3 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}><option value="">— Sélectionner —</option>{ateliers.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}</select></div>
        <div><label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Commentaire (facultatif)</label><textarea value={commentGen} onChange={e => setCommentGen(e.target.value)} rows={2} className="w-full px-3.5 py-3 rounded-lg text-sm outline-none resize-y" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
      </div>
      <button onClick={() => { if (date && serviceId && zoneId) setPhase('questionnaire'); }} disabled={!date || !serviceId || !zoneId} className="w-full px-5 py-3.5 rounded-lg font-semibold text-sm text-white bg-blue-500 disabled:opacity-40">Commencer l&apos;évaluation →</button>
    </div>
  );

  // ===== QUESTIONNAIRE =====
  if (phase === 'questionnaire') {
    let qIdx = 0;
    return (
      <div className="animate-fade-in">
        <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'var(--bg-input)' }}><div className="h-full rounded-full transition-all duration-500" style={{ width: progress + '%', background: 'linear-gradient(90deg, #3B82F6, #10B981)' }} /></div>
        <div className="text-right text-[11px] font-mono mb-4" style={{ color: 'var(--text-muted)' }}>{answered}/{TOTAL_QUESTIONS_5S} — {progress}%</div>
        {PILIERS_5S.map(pillar => {
          const isOpen = openPillars[pillar.key] || false;
          const ps = scores.pillarScores[pillar.key] || 0;
          const pa = pillar.questions.filter(q => answers[q.id] > 0).length;
          return (
            <div key={pillar.key} className="rounded-[14px] mb-3 overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <button onClick={() => setOpenPillars(p => ({ ...p, [pillar.key]: !p[pillar.key] }))} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                <span className="text-lg">{pillar.icon}</span>
                <div className="flex-1"><div className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{pillar.label}</div><div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{pa === 0 ? 'Non évalué' : pa < pillar.questions.length ? pa + '/' + pillar.questions.length : '✓ Complété'}</div></div>
                <span className="font-mono font-bold" style={{ color: pa > 0 ? getScoreHex(ps * 5) : 'var(--text-muted)' }}>{pa > 0 ? ps : '--'}</span>
                <span className={'text-xs transition-transform ' + (isOpen ? 'rotate-180' : '')} style={{ color: 'var(--text-muted)' }}>▼</span>
              </button>
              {isOpen && <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--border)' }}>
                {pillar.questions.map(q => { qIdx++; const v = answers[q.id] || 0; return (
                  <div key={q.id} className="py-3" style={{ borderBottom: '1px solid rgba(30,45,64,0.2)' }}>
                    <div className="text-[10px] font-mono mb-1" style={{ color: 'var(--text-muted)' }}>Q{qIdx}/{TOTAL_QUESTIONS_5S}</div>
                    <div className="text-[13px] font-medium mb-3 leading-relaxed" style={{ color: 'var(--text-primary)' }}>{q.text}</div>
                    <div className="flex gap-1.5">{[1,2,3,4,5].map(r => <button key={r} onClick={() => rate(q.id, r)} className={'flex-1 py-2.5 rounded-md font-mono text-[13px] font-semibold border transition-all active:scale-95 ' + (v === r ? rColors[r] : '')} style={v !== r ? { background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' } : undefined}>{r}</button>)}</div>
                    <div className="flex justify-between text-[9px] mt-1 px-0.5" style={{ color: 'var(--text-muted)' }}><span>Insuffisant</span><span>Excellent</span></div>
                  </div>);
                })}
              </div>}
            </div>
          );
        })}
        <Card>
          <CardTitle>Résumé</CardTitle>
          <div className="grid grid-cols-2 gap-2 mb-4">{PILIERS_5S.map(p => { const s = scores.pillarScores[p.key] || 0; return <div key={p.key} className="rounded-md p-2.5 text-center" style={{ background: 'var(--bg-input)' }}><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.icon} {p.label.split(' — ')[1] || p.label}</div><div className="font-mono font-bold text-lg" style={{ color: s > 0 ? getScoreHex(s*5) : 'var(--text-muted)' }}>{s > 0 ? s + '/20' : '--'}</div></div>; })}
            <div className="col-span-2 rounded-md p-3 text-center" style={{ background: 'var(--bg-card)' }}><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total</div><div className="font-mono font-bold text-2xl" style={{ color: answered >= TOTAL_QUESTIONS_5S ? getScoreHex(scores.total) : 'var(--text-muted)' }}>{answered >= TOTAL_QUESTIONS_5S ? scores.total + '/100' : '--'}</div></div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setPhase('setup')} className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>← Retour</button>
            <button onClick={submit} disabled={answered < TOTAL_QUESTIONS_5S || submitting} className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm text-white bg-emerald-500 disabled:opacity-40">{submitting ? 'Analyse en cours...' : '✅ Soumettre'}</button>
          </div>
        </Card>
      </div>
    );
  }

  // ===== RESULT =====
  if (phase === 'result' && result) return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Résultat 5S</h1>
      <div className="text-center rounded-[14px] p-6 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="font-mono text-5xl font-bold mb-1" style={{ color: getScoreHex(result.total) }}>{result.total}</div>
        <div className="text-[11px] font-mono mb-2" style={{ color: 'var(--text-muted)' }}>/ 100</div>
        <div className="text-base font-semibold" style={{ color: getScoreHex(result.total) }}>{result.appreciation}</div>
        <div className="mt-2 inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>{result.iaSource === 'api' ? '🤖 Claude' : '📊 Analyse locale'}</div>
      </div>
      <Card>{PILIERS_5S.map(p => { const s = result.pillarScores?.[p.key] || 0; return <div key={p.key} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}><span className="text-lg">{p.icon}</span><span className="flex-1 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{p.label}</span><div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}><div className="h-full rounded-full" style={{ width: (s/20*100)+'%', background: getScoreHex(s*5) }} /></div><span className="font-mono font-bold text-sm w-10 text-right" style={{ color: getScoreHex(s*5) }}>{s}/20</span></div>; })}</Card>
      {result.commentaireIA && <Card><CardTitle>🤖 Analyse IA</CardTitle><p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.commentaireIA}</p></Card>}
      {result.forces?.length > 0 && <Card><CardTitle>💪 Points forts</CardTitle>{result.forces.map((f: string, i: number) => <p key={i} className="text-[13px] py-1 pl-4" style={{ color: 'var(--text-secondary)' }}>• {f}</p>)}</Card>}
      {result.faiblesses?.length > 0 && <Card><CardTitle>⚠️ À améliorer</CardTitle>{result.faiblesses.map((f: string, i: number) => <p key={i} className="text-[13px] py-1 pl-4" style={{ color: 'var(--text-secondary)' }}>• {f}</p>)}</Card>}
      {result.actionsRecommandees?.length > 0 && <Card><CardTitle>📋 Actions recommandées</CardTitle>{result.actionsRecommandees.map((a: string, i: number) => <p key={i} className="text-[13px] py-1 pl-4" style={{ color: 'var(--text-secondary)' }}>• {a}</p>)}</Card>}
      <div className="flex gap-2.5 mt-4"><button onClick={newEval} className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm text-white bg-blue-500">📋 Nouvelle évaluation</button><button onClick={() => window.location.href = '/dashboard'} className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>🏠 Accueil</button></div>
    </div>
  );
  return null;
}
