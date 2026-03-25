// src/components/layout/ThemeInit.tsx
'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store';

export function ThemeInit() {
  const initTheme = useThemeStore((s) => s.initTheme);
  useEffect(() => { initTheme(); }, [initTheme]);
  return null;
}
