// src/components/charts/RadarChart5S.tsx
'use client';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useThemeStore } from '@/lib/store';

interface Props {
  data: {
    scoreSeiri: number | null;
    scoreSeiton: number | null;
    scoreSeiso: number | null;
    scoreSeiketsu: number | null;
    scoreShitsuke: number | null;
  };
}

export function RadarChart5S({ data }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const green = theme === 'light' ? '#047857' : '#10B981';
  const gridColor = theme === 'light' ? '#D1D5DB' : 'rgba(30,45,64,0.5)';
  const textColor = theme === 'light' ? '#111827' : '#8899AA';

  const chartData = [
    { pilier: 'Trier', score: data.scoreSeiri ?? 0, max: 20 },
    { pilier: 'Ranger', score: data.scoreSeiton ?? 0, max: 20 },
    { pilier: 'Nettoyer', score: data.scoreSeiso ?? 0, max: 20 },
    { pilier: 'Standard.', score: data.scoreSeiketsu ?? 0, max: 20 },
    { pilier: 'Discipline', score: data.scoreShitsuke ?? 0, max: 20 },
  ];

  return (
    <>
      <div className="text-[13px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
        🎯 Radar 5S — Dernière évaluation
      </div>
      <div className="mx-auto" style={{ maxWidth: 320 }}>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis dataKey="pilier" tick={{ fill: textColor, fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis domain={[0, 20]} tick={{ fill: textColor, fontSize: 9 }} axisLine={false} />
            <Radar name="Score" dataKey="score" stroke={green} fill={green} fillOpacity={0.15} strokeWidth={2} dot={{ r: 4, fill: green }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
