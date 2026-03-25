// src/components/charts/LineChart5S.tsx
'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useThemeStore } from '@/lib/store';

interface Props {
  data: { date: string; score5S: number; scoreSugg?: number }[];
  showSugg?: boolean;
}

export function LineChart5S({ data, showSugg = false }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const green = theme === 'light' ? '#047857' : '#10B981';
  const purple = theme === 'light' ? '#5B21B6' : '#8B5CF6';
  const gridColor = theme === 'light' ? '#E5E7EB' : 'rgba(30,45,64,0.4)';
  const tickColor = theme === 'light' ? '#374151' : '#556677';
  const labelColor = theme === 'light' ? '#111827' : '#8899AA';

  const formatDate = (d: string) => {
    const parts = d.split('-');
    return `${parts[2]}/${parts[1]}`;
  };

  return (
    <>
      <div className="text-[13px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
        📈 Évolution des scores
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: tickColor, fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fill: tickColor, fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: labelColor }} />
          <Line type="monotone" dataKey="score5S" name="Score 5S" stroke={green} strokeWidth={2} dot={{ r: 4, fill: green }} />
          {showSugg && <Line type="monotone" dataKey="scoreSugg" name="Score Suggestion" stroke={purple} strokeWidth={2} dot={{ r: 4, fill: purple }} />}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
