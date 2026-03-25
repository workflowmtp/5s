// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const userId = session.user.id;
  const role = (session.user as any).role;

  // Personal stats
  const myEvals = await prisma.evaluation.findMany({
    where: { userId, statut: { not: 'brouillon' } },
    orderBy: { date: 'asc' },
  });

  const mySuggs = await prisma.suggestion.findMany({
    where: { userId, statut: { not: 'brouillon' } },
  });

  const avg5S = myEvals.length > 0
    ? Math.round(myEvals.reduce((acc, e) => acc + (e.scoreTotal || 0), 0) / myEvals.length)
    : 0;

  const scoredSuggs = mySuggs.filter((s) => s.scoreTotal != null);
  const avgSugg = scoredSuggs.length > 0
    ? Math.round(scoredSuggs.reduce((acc, s) => acc + (s.scoreTotal || 0), 0) / scoredSuggs.length)
    : 0;

  const nbRetenues = mySuggs.filter((s) =>
    ['retenue', 'planifiee', 'en_cours', 'mise_en_oeuvre', 'cloturee'].includes(s.statut)
  ).length;

  // Last eval for radar
  const lastEval = myEvals.length > 0 ? myEvals[myEvals.length - 1] : null;

  // Evolution data
  const evolution = myEvals.map((e) => ({
    date: e.date.toISOString().split('T')[0],
    score5S: e.scoreTotal || 0,
  }));

  // Recent activity
  const recentEvals = myEvals.slice(-5).reverse().map((e) => ({
    type: '5S' as const,
    id: e.id,
    date: e.date.toISOString().split('T')[0],
    score: e.scoreTotal,
    statut: e.statut,
    label: e.appreciation || '',
  }));

  const recentSuggs = mySuggs.slice(0, 5).map((s) => ({
    type: 'suggestion' as const,
    id: s.id,
    date: s.date.toISOString().split('T')[0],
    score: s.scoreTotal,
    statut: s.statut,
    label: s.titre,
  }));

  const recent = [...recentEvals, ...recentSuggs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Global stats for direction
  let globalStats = null;
  if (['direction', 'admin'].includes(role)) {
    const allEvals = await prisma.evaluation.count({ where: { statut: { not: 'brouillon' } } });
    const allSuggs = await prisma.suggestion.count({ where: { statut: { not: 'brouillon' } } });
    const allUsers = await prisma.user.count({ where: { statut: 'actif' } });
    const usersWithEval = await prisma.evaluation.findMany({
      where: { statut: { not: 'brouillon' } },
      distinct: ['userId'],
      select: { userId: true },
    });

    globalStats = {
      totalEvals: allEvals,
      totalSuggs: allSuggs,
      totalUsers: allUsers,
      participation: allUsers > 0 ? Math.round((usersWithEval.length / allUsers) * 100) : 0,
    };
  }

  return NextResponse.json({
    avg5S,
    avgSugg,
    nbEvals: myEvals.length,
    nbSuggs: mySuggs.length,
    nbRetenues,
    lastEval: lastEval ? {
      scoreSeiri: lastEval.scoreSeiri,
      scoreSeiton: lastEval.scoreSeiton,
      scoreSeiso: lastEval.scoreSeiso,
      scoreSeiketsu: lastEval.scoreSeiketsu,
      scoreShitsuke: lastEval.scoreShitsuke,
      scoreTotal: lastEval.scoreTotal,
    } : null,
    evolution,
    recent,
    globalStats,
  });
}
