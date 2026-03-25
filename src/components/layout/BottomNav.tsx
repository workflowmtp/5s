// src/components/layout/BottomNav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '🏠', label: 'Accueil', key: 'dashboard' },
  { href: '/dashboard/eval5s', icon: '📋', label: '5S', key: 'eval5s' },
  { href: '/dashboard/suggestions', icon: '💡', label: 'Idées', key: 'suggestions' },
  { href: '/dashboard/classements', icon: '🏆', label: 'Top', key: 'classements' },
  { href: '/dashboard/profil', icon: '👤', label: 'Profil', key: 'profil' },
];

export function BottomNav({ role }: { role: string }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="h-[68px] min-h-[68px] flex items-center justify-around px-2 z-50"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link key={item.key} href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg min-w-[56px] transition-all
              ${active ? 'bg-blue-500/15' : ''}`}>
            <span className={`text-xl transition-all ${active ? '' : 'opacity-50'}`}>{item.icon}</span>
            <span className={`text-[10px] font-medium transition-all
              ${active ? 'text-blue-500' : ''}`}
              style={{ color: active ? undefined : 'var(--text-muted)' }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
