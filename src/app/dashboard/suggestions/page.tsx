// src/app/dashboard/suggestions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardTitle, StatusBadge, ScoreCircle } from '@/components/ui/Card';
import { getScoreHex, getAppreciationSugg } from '@/lib/constants';

type Phase = 'list' | 'form' | 'detail';
const URGENCY = [{ k: 'faible', l: 'Faible', c: 'bg-emerald-500/10 text-emerald-500 border-emerald-500' }, { k: 'moyenne', l: 'Moyenne', c: 'bg-amber-500/10 text-amber-500 border-amber-500' }, { k: 'haute', l: 'Haute', c: 'bg-red-500/10 text-red-400 border-red-500' }, { k: 'critique', l: 'Critique', c: 'bg-red-500/20 text-red-400 border-red-500' }];
const IMPACT = [{ k: 'faible', l: 'Faible' }, { k: 'moyen', l: 'Moyen' }, { k: 'fort', l: 'Fort' }, { k: 'tres_fort', l: 'Très fort' }];
const FAISAB = [{ k: 'facile', l: 'Facile' }, { k: 'moderee', l: 'Modérée' }, { k: 'complexe', l: 'Complexe' }, { k: 'difficile', l: 'Difficile' }];

export default function SuggestionsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [phase, setPhase] = useState<Phase>('list');
  const [suggs, setSuggs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState<any>(null);
  const [form, setForm] = useState<any>({ titre: '', categorieId: '', serviceConcerneId: '', lieu: '', probleme: '', suggestion: '', benefices: '', urgence: '', impactEstime: '', faisabiliteEstimee: '', coutEstime: '', delaiEstime: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => { fetch('/api/suggestions').then(r => r.json()).then(setSuggs); };
  useEffect(() => { load(); fetch('/api/admin/categories').then(r => r.json()).then(setCategories); fetch('/api/admin/services').then(r => r.json()).then(setServices); }, []);

  const filtered = filter === 'all' ? suggs : suggs.filter(s => s.statut === filter);
  const tabs = [{ k: 'all', l: 'Toutes' }, { k: 'brouillon', l: 'Brouillons' }, { k: 'soumise', l: 'Soumises' }, { k: 'retenue', l: 'Retenues' }, { k: 'rejetee', l: 'Rejetées' }];

  const submitSugg = async (statut: string) => {
    if (!form.titre || !form.categorieId || !form.probleme || !form.suggestion || !form.benefices) return;
    setSubmitting(true);
    try {
      await fetch('/api/suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, statut, date: new Date().toISOString() }) });
      load(); setPhase('list'); setForm({ titre: '', categorieId: '', serviceConcerneId: '', lieu: '', probleme: '', suggestion: '', benefices: '', urgence: '', impactEstime: '', faisabiliteEstimee: '', coutEstime: '', delaiEstime: '' });
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const openDetail = async (id: string) => { const r = await fetch('/api/suggestions/' + id); setDetail(await r.json()); setPhase('detail'); };

  // ===== LIST =====
  if (phase === 'list') return (
    <div className="animate-fade-in">
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>💡 Suggestions</h1><p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Proposez vos idées d&apos;amélioration</p></div>
      <button onClick={() => setPhase('form')} className="w-full px-5 py-3 rounded-lg font-semibold text-sm text-white bg-blue-500 mb-4">+ Nouvelle suggestion</button>
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">{tabs.map(t => <button key={t.k} onClick={() => setFilter(t.k)} className={'px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all border ' + (filter === t.k ? 'bg-blue-500/15 text-blue-500 border-blue-500' : '')} style={filter !== t.k ? { background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' } : undefined}>{t.l} ({t.k === 'all' ? suggs.length : suggs.filter(s => s.statut === t.k).length})</button>)}</div>
      {filtered.length === 0 ? <div className="text-center py-10"><div className="text-5xl mb-3 opacity-50">📭</div><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucune suggestion</p></div> : filtered.map(s => (
        <button key={s.id} onClick={() => openDetail(s.id)} className="w-full text-left rounded-[14px] p-4 mb-2.5 transition-all active:scale-[0.98]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">{s.categorie?.icone || '📌'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{s.titre}</div>
              <div className="text-[12px] flex items-center gap-2 mt-1" style={{ color: 'var(--text-muted)' }}>{s.date?.split('T')[0]} · {s.categorie?.nom || ''}<StatusBadge status={s.statut} /></div>
            </div>
            {s.scoreTotal != null && <ScoreCircle score={s.scoreTotal} size="sm" />}
          </div>
        </button>
      ))}
    </div>
  );

  // ===== FORM =====
  if (phase === 'form') return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5"><button onClick={() => setPhase('list')} className="text-xl" style={{ color: 'var(--text-muted)' }}>←</button><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Nouvelle suggestion</h1></div>
      <div className="text-[12px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Catégorie *</div>
      <div className="grid grid-cols-3 gap-2 mb-4">{categories.map(c => <button key={c.id} onClick={() => setForm({ ...form, categorieId: c.id })} className={'rounded-lg p-2.5 text-center text-[11px] font-medium transition-all border ' + (form.categorieId === c.id ? 'bg-blue-500/15 text-blue-500 border-blue-500' : '')} style={form.categorieId !== c.id ? { background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' } : undefined}><div className="text-lg mb-0.5">{c.icone}</div>{c.nom}</button>)}</div>
      {[{ k: 'titre', l: 'Titre *', ph: 'Titre de votre suggestion', type: 'text' }, { k: 'serviceConcerneId', l: 'Service concerné', type: 'select', opts: services }, { k: 'lieu', l: 'Lieu / Zone', ph: 'Localisation précise', type: 'text' }].map(f => (
        <div key={f.k} className="mb-3"><label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.l}</label>
          {f.type === 'select' ? <select value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} className="w-full px-3.5 py-3 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}><option value="">—</option>{f.opts?.map((o: any) => <option key={o.id} value={o.id}>{o.nom}</option>)}</select>
          : <input value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} className="w-full px-3.5 py-3 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />}
        </div>
      ))}
      {[{ k: 'probleme', l: 'Problème constaté *' }, { k: 'suggestion', l: 'Solution proposée *' }, { k: 'benefices', l: 'Bénéfices attendus *' }].map(f => (
        <div key={f.k} className="mb-3"><label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.l}</label><textarea value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} rows={3} className="w-full px-3.5 py-3 rounded-lg text-sm outline-none resize-y" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
      ))}
      <div className="text-[12px] font-semibold uppercase tracking-wide mb-2 mt-4" style={{ color: 'var(--text-muted)' }}>Urgence</div>
      <div className="flex gap-1.5 mb-4">{URGENCY.map(u => <button key={u.k} onClick={() => setForm({ ...form, urgence: u.k })} className={'flex-1 py-2.5 rounded-md text-[12px] font-semibold border transition-all ' + (form.urgence === u.k ? u.c : '')} style={form.urgence !== u.k ? { background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' } : undefined}>{u.l}</button>)}</div>
      <div className="text-[12px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Impact estimé</div>
      <div className="flex gap-1.5 mb-4">{IMPACT.map(u => <button key={u.k} onClick={() => setForm({ ...form, impactEstime: u.k })} className={'flex-1 py-2.5 rounded-md text-[12px] font-semibold border transition-all ' + (form.impactEstime === u.k ? 'bg-blue-500/15 text-blue-400 border-blue-500' : '')} style={form.impactEstime !== u.k ? { background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' } : undefined}>{u.l}</button>)}</div>
      <div className="text-[12px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Faisabilité</div>
      <div className="flex gap-1.5 mb-6">{FAISAB.map(u => <button key={u.k} onClick={() => setForm({ ...form, faisabiliteEstimee: u.k })} className={'flex-1 py-2.5 rounded-md text-[12px] font-semibold border transition-all ' + (form.faisabiliteEstimee === u.k ? 'bg-purple-500/15 text-purple-400 border-purple-500' : '')} style={form.faisabiliteEstimee !== u.k ? { background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' } : undefined}>{u.l}</button>)}</div>
      <div className="flex gap-2.5">
        <button onClick={() => submitSugg('brouillon')} disabled={submitting} className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>💾 Brouillon</button>
        <button onClick={() => submitSugg('soumise')} disabled={submitting || !form.titre || !form.categorieId || !form.probleme || !form.suggestion || !form.benefices} className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm text-white bg-emerald-500 disabled:opacity-40">{submitting ? 'Envoi...' : '📤 Soumettre'}</button>
      </div>
    </div>
  );

  // ===== DETAIL =====
  if (phase === 'detail' && detail) return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5"><button onClick={() => { setPhase('list'); load(); }} className="text-xl" style={{ color: 'var(--text-muted)' }}>←</button><h1 className="text-lg font-bold flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{detail.titre}</h1></div>
      <div className="flex items-center gap-3 mb-4"><span className="text-2xl">{detail.categorie?.icone || '📌'}</span><div><div className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>{detail.categorie?.nom}</div><StatusBadge status={detail.statut} /></div>{detail.scoreTotal != null && <div className="ml-auto"><ScoreCircle score={detail.scoreTotal} size="md" /></div>}</div>
      {detail.scoreTotal != null && <div className="text-center mb-3 text-sm font-semibold" style={{ color: getScoreHex(detail.scoreTotal) }}>{getAppreciationSugg(detail.scoreTotal)}</div>}
      {[{ l: '❓ Problème', v: detail.probleme }, { l: '💡 Solution proposée', v: detail.suggestion }, { l: '✅ Bénéfices', v: detail.benefices }].map(r => r.v && <Card key={r.l}><CardTitle>{r.l}</CardTitle><p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.v}</p></Card>)}
      {(detail.urgence || detail.impactEstime || detail.faisabiliteEstimee) && <Card><div className="flex flex-wrap gap-2 text-[11px]">{detail.urgence && <span className="px-2 py-1 rounded" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>Urgence: {detail.urgence}</span>}{detail.impactEstime && <span className="px-2 py-1 rounded" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>Impact: {detail.impactEstime}</span>}{detail.faisabiliteEstimee && <span className="px-2 py-1 rounded" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>Faisabilité: {detail.faisabiliteEstimee}</span>}</div></Card>}
      {detail.commentaireIA && <Card><CardTitle>🤖 Analyse IA</CardTitle><p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{detail.commentaireIA}</p></Card>}
      {detail.commentaireSuperviseur && <Card><CardTitle>👥 Avis Superviseur</CardTitle><p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{detail.commentaireSuperviseur}</p></Card>}
      {detail.commentaireDirection && <Card><CardTitle>🏛️ Décision Direction</CardTitle><p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{detail.commentaireDirection}</p></Card>}
    </div>
  );
  return null;
}
