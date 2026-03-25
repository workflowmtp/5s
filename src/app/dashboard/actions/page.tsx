// src/app/dashboard/actions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardTitle, StatusBadge } from '@/components/ui/Card';
import { useConfirmStore } from '@/lib/store';

const PRIO_C: Record<string, string> = { critique: '#EF4444', haute: '#F59E0B', moyenne: '#3B82F6', basse: '#10B981' };

export default function ActionsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterPrio, setFilterPrio] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [progressId, setProgressId] = useState<string | null>(null);
  const [progressVal, setProgressVal] = useState(50);
  const [form, setForm] = useState({ description: '', responsableId: '', echeance: '', priorite: 'moyenne', origineType: 'autre' });
  const showConfirm = useConfirmStore(s => s.showConfirm);

  const load = () => { fetch('/api/actions').then(r => r.json()).then(setActions); };
  useEffect(() => { load(); fetch('/api/users').then(r => r.json()).then(setUsers); }, []);

  const filtered = actions.filter(a => (!filterStatut || a.statut === filterStatut) && (!filterPrio || a.priorite === filterPrio));
  const kpis = [
    { l: 'Ouvertes', v: actions.filter(a => a.statut === 'ouverte').length, c: '#F59E0B' },
    { l: 'En cours', v: actions.filter(a => a.statut === 'en_cours').length, c: '#3B82F6' },
    { l: 'Terminées', v: actions.filter(a => a.statut === 'terminee').length, c: '#10B981' },
    { l: 'En retard', v: actions.filter(a => a.echeance && new Date(a.echeance) < new Date() && !['terminee', 'annulee'].includes(a.statut)).length, c: '#EF4444' },
  ];

  const submitAction = async () => {
    if (!form.description) return;
    await fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false); setForm({ description: '', responsableId: '', echeance: '', priorite: 'moyenne', origineType: 'autre' }); load();
  };

  const updateProgress = async (id: string) => {
    await fetch('/api/actions/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avancement: progressVal }) });
    setProgressId(null); load();
  };

  const changeStatus = (id: string, statut: string) => {
    const labels: Record<string, string> = { terminee: 'Marquer comme terminée ?', annulee: 'Annuler cette action ?' };
    showConfirm({ message: labels[statut] || 'Changer le statut ?', icon: statut === 'terminee' ? '✅' : '🚫', onConfirm: async () => {
      await fetch('/api/actions/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statut, ...(statut === 'terminee' ? { avancement: 100 } : {}) }) });
      load();
    }});
  };

  const formatDate = (d: string) => { if (!d) return '--'; const p = d.split('T')[0].split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };

  return (
    <div className="animate-fade-in">
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>🔧 Actions Correctives</h1></div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2 mb-4">{kpis.map((k, i) => <div key={i} className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}><div className="font-mono text-lg font-bold" style={{ color: k.c }}>{k.v}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{k.l}</div></div>)}</div>

      {/* Create button */}
      <button onClick={() => setShowForm(!showForm)} className="w-full px-4 py-3 rounded-lg font-semibold text-sm text-white bg-blue-500 mb-3">+ Nouvelle action corrective</button>

      {/* Create form */}
      {showForm && <Card style={{ borderColor: '#3B82F6' }}>
        <CardTitle>➕ Nouvelle action</CardTitle>
        <div className="mb-2"><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Description de l'action..." className="w-full px-3 py-2 rounded-md text-sm outline-none resize-y" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
        <div className="flex gap-2 mb-2">
          <div className="flex-1"><label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Responsable</label><select value={form.responsableId} onChange={e => setForm({ ...form, responsableId: e.target.value })} className="w-full px-2 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}><option value="">—</option>{users.map(u => <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>)}</select></div>
          <div className="flex-1"><label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Échéance</label><input type="date" value={form.echeance} onChange={e => setForm({ ...form, echeance: e.target.value })} className="w-full px-2 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
        </div>
        <div className="flex gap-2 mb-3">
          <div className="flex-1"><label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Priorité</label><select value={form.priorite} onChange={e => setForm({ ...form, priorite: e.target.value })} className="w-full px-2 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}><option value="basse">Basse</option><option value="moyenne">Moyenne</option><option value="haute">Haute</option><option value="critique">Critique</option></select></div>
          <div className="flex-1"><label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Origine</label><select value={form.origineType} onChange={e => setForm({ ...form, origineType: e.target.value })} className="w-full px-2 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}><option value="5S">5S</option><option value="suggestion">Suggestion</option><option value="autre">Autre</option></select></div>
        </div>
        <div className="flex gap-2"><button onClick={submitAction} className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm text-white bg-emerald-500">✅ Créer</button><button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Annuler</button></div>
      </Card>}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="flex-1 px-2 py-2 rounded-md text-[12px] outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}><option value="">Tous statuts</option><option value="ouverte">Ouverte</option><option value="en_cours">En cours</option><option value="terminee">Terminée</option><option value="annulee">Annulée</option></select>
        <select value={filterPrio} onChange={e => setFilterPrio(e.target.value)} className="flex-1 px-2 py-2 rounded-md text-[12px] outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}><option value="">Toutes priorités</option><option value="critique">Critique</option><option value="haute">Haute</option><option value="moyenne">Moyenne</option><option value="basse">Basse</option></select>
      </div>

      {/* Action cards */}
      {filtered.length === 0 ? <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Aucune action</div> : filtered.map(a => {
        const isLate = a.echeance && new Date(a.echeance) < new Date() && !['terminee', 'annulee'].includes(a.statut);
        const barColor = a.avancement >= 100 ? '#10B981' : a.avancement >= 50 ? '#3B82F6' : '#F59E0B';
        return (
          <div key={a.id} className="rounded-[14px] p-4 mb-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-2"><div className="flex-1 text-[14px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{a.description}</div><StatusBadge status={a.statut} /></div>
            <div className="flex flex-wrap gap-2 text-[11px] mb-2">
              <span style={{ color: PRIO_C[a.priorite] || 'var(--text-muted)', fontWeight: 600 }}>● {a.priorite}</span>
              {a.responsable && <span style={{ color: 'var(--text-secondary)' }}>👤 {a.responsable.prenom} {a.responsable.nom}</span>}
              {a.echeance && <span style={{ color: isLate ? '#EF4444' : 'var(--text-muted)', fontWeight: isLate ? 600 : 400 }}>📅 {formatDate(a.echeance)}{isLate ? ' ⚠️' : ''}</span>}
              {a.origineType && <span style={{ color: 'var(--text-muted)' }}>📌 {a.origineType}</span>}
            </div>
            {/* Progress */}
            <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'var(--bg-input)' }}><div className="h-full rounded-full transition-all" style={{ width: a.avancement + '%', background: barColor }} /></div>
            <div className="flex justify-between text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}><span>Avancement</span><span className="font-mono">{a.avancement}%</span></div>

            {/* Progress slider */}
            {progressId === a.id && <div className="rounded-lg p-3 mb-2" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
              <div className="text-[12px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Avancement : {progressVal}%</div>
              <input type="range" min="0" max="100" step="5" value={progressVal} onChange={e => setProgressVal(parseInt(e.target.value))} className="w-full mb-2" style={{ accentColor: '#3B82F6' }} />
              <div className="flex gap-2"><button onClick={() => updateProgress(a.id)} className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-500">✅ Valider</button><button onClick={() => setProgressId(null)} className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Annuler</button></div>
            </div>}

            {/* Action buttons */}
            {!['terminee', 'annulee'].includes(a.statut) && progressId !== a.id && <div className="flex gap-1.5 mt-1">
              <button onClick={() => { setProgressId(a.id); setProgressVal(a.avancement || 0); }} className="flex-1 px-2.5 py-2 rounded-md text-[11px] font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>📊 Avancement</button>
              <button onClick={() => changeStatus(a.id, 'terminee')} className="flex-1 px-2.5 py-2 rounded-md text-[11px] font-semibold text-emerald-500" style={{ border: '1px solid rgba(16,185,129,0.3)' }}>✅ Terminer</button>
              <button onClick={() => changeStatus(a.id, 'annulee')} className="px-2.5 py-2 rounded-md text-[11px] font-semibold text-red-400" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>✕</button>
            </div>}
          </div>
        );
      })}
    </div>
  );
}
