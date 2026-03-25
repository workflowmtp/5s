// src/components/ui/ConfirmModal.tsx
'use client';

import { useConfirmStore } from '@/lib/store';

export function ConfirmModal() {
  const { isOpen, message, icon, okLabel, okClass, onConfirm, closeConfirm } = useConfirmStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-6"
      style={{ background: 'rgba(7,13,26,0.85)' }}>
      <div className="w-full max-w-[340px] rounded-xl p-6 text-center animate-fade-in"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <div className="text-4xl mb-3">{icon}</div>
        <div className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-primary)' }}>
          {message}
        </div>
        <div className="flex gap-3">
          <button onClick={closeConfirm}
            className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Annuler
          </button>
          <button onClick={() => { onConfirm?.(); closeConfirm(); }}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm text-white transition-all
              ${okClass === 'btn-primary' ? 'bg-blue-500' : okClass === 'btn-success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
