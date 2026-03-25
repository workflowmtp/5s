// src/app/dashboard/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { useConfirmStore } from '@/lib/store';

type Section = 'menu' | 'users' | 'services' | 'ateliers' | 'categories' | 'export';

export default function AdminPage() {
  const [section, setSection] = useState<Section>('menu');
  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [ateliers, setAteliers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [newVal, setNewVal] = useState('');
  const [userForm, setUserForm] = useState<any>(null);
  const showConfirm = useConfirmStore(s => s.showConfirm);

  const loadAll = () => {
    fetch('/api/users').then(r => r.json()).then(setUsers);
    fetch('/api/admin/services').then(r => r.json()).then(setServices);
    fetch('/api/admin/ateliers').then(r => r.json()).then(setAteliers);
    fetch('/api/admin/categories').then(r => r.json()).then(setCategories);
  };
  useEffect(loadAll, []);

  const ROLE_L: Record<string, string> = { employe: 'Employé', superviseur: 'Superviseur', direction: 'Direction', admin: 'Admin' };
  const ROLE_C: Record<string, string> = { employe: 'bg-blue-500', superviseur: 'bg-amber-500', direction: 'bg-purple-500', admin: 'bg-red-500' };

  const back = () => { setSection('menu'); setEditingId(null); setUserForm(null); };

  // CRUD helpers
  const addItem = async (url: string, body: any, cb: () => void) => { await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); setNewVal(''); cb(); };
  const renameItem = async (url: string, body: any, cb: () => void) => { await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); setEditingId(null); cb(); };
  const deleteItem = (url: string, label: string, cb: () => void) => { showConfirm({ message: 'Supprimer « ' + label + ' » ?', icon: '🗑️', onConfirm: async () => { await fetch(url, { method: 'DELETE' }); cb(); } }); };

  // ===== MENU =====
  if (section === 'menu') return (
    <div className="animate-fade-in">
      <div className="mb-5"><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>⚙️ Administration</h1></div>
      {[{ k: 'users' as Section, icon: '👥', label: 'Utilisateurs', desc: users.length + ' comptes' },
        { k: 'services' as Section, icon: '🏭', label: 'Services', desc: services.length + ' services' },
        { k: 'ateliers' as Section, icon: '📍', label: 'Zones / Ateliers', desc: ateliers.length + ' zones' },
        { k: 'categories' as Section, icon: '🏷️', label: 'Catégories suggestions', desc: categories.length + ' catégories' },
        { k: 'export' as Section, icon: '📥', label: 'Export données', desc: 'CSV / JSON' },
      ].map(m => <button key={m.k} onClick={() => setSection(m.k)} className="w-full text-left flex items-center gap-4 rounded-[14px] p-4 mb-2.5 transition-all active:scale-[0.98]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <span className="text-2xl">{m.icon}</span><div className="flex-1"><div className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{m.label}</div><div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{m.desc}</div></div><span style={{ color: 'var(--text-muted)' }}>›</span>
      </button>)}
    </div>
  );

  // ===== USERS =====
  if (section === 'users') return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-4"><button onClick={back} className="text-xl" style={{ color: 'var(--text-muted)' }}>←</button><h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>👥 Utilisateurs ({users.length})</h1></div>
      {userForm && <Card style={{ borderColor: '#3B82F6' }}>
        <CardTitle>{userForm.id ? '✏️ Modifier' : '➕ Créer'}</CardTitle>
        {[{ k: 'matricule', l: 'Matricule', dis: !!userForm.id }, { k: 'prenom', l: 'Prénom' }, { k: 'nom', l: 'Nom' }, { k: 'fonction', l: 'Fonction' }].map(f => <div key={f.k} className="mb-2"><label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>{f.l}</label><input value={userForm[f.k] || ''} onChange={e => setUserForm({ ...userForm, [f.k]: e.target.value })} disabled={f.dis} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>)}
        <div className="mb-2"><label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Rôle</label><select value={userForm.role || 'employe'} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>{Object.entries(ROLE_L).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div className="mb-2"><label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Service</label><select value={userForm.serviceId || ''} onChange={e => setUserForm({ ...userForm, serviceId: e.target.value })} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}><option value="">—</option>{services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}</select></div>
        {userForm.id && <div className="mb-2"><label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Nouveau mdp (vide = inchangé)</label><input value={userForm.password || ''} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>}
        <div className="flex gap-2 mt-3"><button onClick={async () => { const url = userForm.id ? '/api/users/' + userForm.id : '/api/users'; const method = userForm.id ? 'PATCH' : 'POST'; const body = { ...userForm }; if (!body.password) delete body.password; await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); setUserForm(null); loadAll(); }} className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm text-white bg-emerald-500">✅ Sauver</button><button onClick={() => setUserForm(null)} className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Annuler</button></div>
      </Card>}
      <button onClick={() => setUserForm({ matricule: '', prenom: '', nom: '', role: 'employe', serviceId: services[0]?.id, fonction: 'Agent' })} className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-500 mb-3">+ Nouvel utilisateur</button>
      {users.map(u => <div key={u.id} className="flex items-center gap-3 rounded-[14px] p-3.5 mb-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${ROLE_C[u.role] || 'bg-blue-500'}`}>{(u.prenom?.[0] || '') + (u.nom?.[0] || '')}</div>
        <div className="flex-1 min-w-0"><div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{u.prenom} {u.nom} <span className="text-[10px] font-mono px-1 py-0.5 rounded" style={{ background: 'var(--bg-input)' }}>{ROLE_L[u.role]}</span></div><div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{u.matricule} · {u.service?.nom} · {u.statut === 'actif' ? '🟢' : '🔴'}</div></div>
        <button onClick={() => setUserForm({ id: u.id, matricule: u.matricule, prenom: u.prenom, nom: u.nom, role: u.role, serviceId: u.service?.id, fonction: u.fonction, password: '' })} className="text-sm" style={{ color: 'var(--text-muted)' }}>✏️</button>
        <button onClick={async () => { await fetch('/api/users/' + u.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statut: u.statut === 'actif' ? 'inactif' : 'actif' }) }); loadAll(); }} className="text-sm">{u.statut === 'actif' ? '🔒' : '🔓'}</button>
      </div>)}
    </div>
  );

  // ===== GENERIC LIST (services, ateliers, categories) =====
  const listConfig: Record<string, { title: string; icon: string; data: any[]; url: string; load: () => void; nameField: string }> = {
    services: { title: 'Services', icon: '🏭', data: services, url: '/api/admin/services', load: () => fetch('/api/admin/services').then(r => r.json()).then(setServices), nameField: 'nom' },
    ateliers: { title: 'Zones / Ateliers', icon: '📍', data: ateliers, url: '/api/admin/ateliers', load: () => fetch('/api/admin/ateliers').then(r => r.json()).then(setAteliers), nameField: 'nom' },
    categories: { title: 'Catégories', icon: '🏷️', data: categories, url: '/api/admin/categories', load: () => fetch('/api/admin/categories').then(r => r.json()).then(setCategories), nameField: 'nom' },
  };

  if (['services', 'ateliers', 'categories'].includes(section)) {
    const cfg = listConfig[section];
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-4"><button onClick={back} className="text-xl" style={{ color: 'var(--text-muted)' }}>←</button><h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{cfg.icon} {cfg.title} ({cfg.data.length})</h1></div>
        <div className="flex gap-2 mb-4"><input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder={'Nouveau ' + cfg.title.toLowerCase() + '...'} className="flex-1 px-3.5 py-3 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /><button onClick={() => { if (newVal.trim()) addItem(cfg.url, { nom: newVal.trim() }, cfg.load); }} className="px-4 py-3 rounded-lg font-semibold text-sm text-white bg-blue-500">+</button></div>
        {cfg.data.map(item => (
          <div key={item.id}>
            {editingId === item.id ? (
              <div className="flex gap-2 mb-2"><input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /><button onClick={() => renameItem(cfg.url + '/' + item.id, { nom: editVal }, cfg.load)} className="px-3 py-2 rounded-lg text-white bg-emerald-500 text-sm">✓</button><button onClick={() => setEditingId(null)} className="px-3 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>✕</button></div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg p-3 mb-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {section === 'categories' && <span className="text-lg">{item.icone}</span>}
                <span className="flex-1 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{item.nom}</span>
                <button onClick={() => { setEditingId(item.id); setEditVal(item.nom); }} className="text-sm px-2 py-1 rounded" style={{ color: 'var(--text-muted)' }}>✏️</button>
                <button onClick={() => deleteItem(cfg.url + '/' + item.id, item.nom, cfg.load)} className="text-sm px-2 py-1 rounded text-red-400">✕</button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ===== EXPORT =====
  if (section === 'export') return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5"><button onClick={back} className="text-xl" style={{ color: 'var(--text-muted)' }}>←</button><h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>📥 Export</h1></div>
      {[{ type: 'users', label: '👥 Utilisateurs', desc: 'Export CSV des comptes' }, { type: 'evals', label: '📋 Évaluations 5S', desc: 'Toutes les évaluations' }, { type: 'suggestions', label: '💡 Suggestions', desc: 'Toutes les suggestions' }, { type: 'actions', label: '🔧 Actions correctives', desc: 'Toutes les actions' }, { type: 'all', label: '📦 Export complet', desc: 'Toutes les données' }].map(e => (
        <a key={e.type} href={'/api/admin/export?type=' + e.type} download className="flex items-center gap-4 rounded-[14px] p-4 mb-2.5 transition-all active:scale-[0.98]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <span className="text-2xl">📄</span><div className="flex-1"><div className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{e.label}</div><div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{e.desc}</div></div><span className="text-blue-500 font-mono text-sm">CSV ↓</span>
        </a>
      ))}
    </div>
  );

  return null;
}
