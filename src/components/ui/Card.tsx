// src/components/ui/Card.tsx
'use client';

export function Card({ children, className = '', style = {} }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`rounded-[14px] p-4 mb-3 transition-all ${className}`}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', ...style }}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-semibold text-[15px] mb-3 ${className}`} style={{ color: 'var(--text-primary)' }}>{children}</div>;
}

// src/components/ui/Badge.tsx
const STATUS_COLORS: Record<string, string> = {
  brouillon: 'bg-blue-500/10 text-blue-500',
  soumise: 'bg-amber-500/10 text-amber-500',
  analysee: 'bg-purple-500/10 text-purple-500',
  revue_superviseur: 'bg-yellow-500/10 text-yellow-500',
  cloturee: 'bg-emerald-500/10 text-emerald-500',
  en_revue: 'bg-amber-500/10 text-amber-500',
  a_preciser: 'bg-yellow-500/10 text-yellow-500',
  retenue: 'bg-emerald-500/10 text-emerald-500',
  rejetee: 'bg-red-500/10 text-red-500',
  planifiee: 'bg-blue-500/10 text-blue-500',
  en_cours: 'bg-amber-500/10 text-amber-500',
  mise_en_oeuvre: 'bg-emerald-500/10 text-emerald-500',
  ouverte: 'bg-amber-500/10 text-amber-500',
  terminee: 'bg-emerald-500/10 text-emerald-500',
  annulee: 'bg-red-500/10 text-red-500',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || 'bg-blue-500/10 text-blue-500';
  const label = status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono ${cls}`}>
      {label}
    </span>
  );
}

// src/components/ui/ScoreCircle.tsx
export function ScoreCircle({ score, size = 'md' }: { score: number | null; size?: 'sm' | 'md' | 'lg' }) {
  const value = score ?? 0;
  const display = score != null ? String(score) : '--';

  const colorClass = value >= 90 ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
    : value >= 80 ? 'border-cyan-500 text-cyan-500 bg-cyan-500/10'
    : value >= 70 ? 'border-blue-500 text-blue-500 bg-blue-500/10'
    : value >= 60 ? 'border-amber-500 text-amber-500 bg-amber-500/10'
    : 'border-red-500 text-red-500 bg-red-500/10';

  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-[52px] h-[52px] text-lg',
    lg: 'w-[72px] h-[72px] text-2xl',
  };

  return (
    <div className={`rounded-full flex flex-col items-center justify-center font-mono font-bold border-2 flex-shrink-0 ${colorClass} ${sizes[size]}`}>
      {display}
      {size !== 'sm' && <span className="text-[8px] font-medium opacity-80">/100</span>}
    </div>
  );
}
