// src/app/api/evaluations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { calcTotalScore5S, getAppreciation5S } from '@/lib/constants';
import type { EvalStatus, Priority, IASource } from '@prisma/client';

// GET — List evaluations (filtered by role)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const serviceId = searchParams.get('serviceId');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');

  const role = (session.user as any).role;
  const where: any = {};

  // RBAC filtering
  if (role === 'employe') {
    where.userId = session.user.id;
  } else if (role === 'superviseur') {
    where.service = { id: (session.user as any).serviceId };
  }
  // direction & admin see all

  if (userId) where.userId = userId;
  if (serviceId) where.serviceId = serviceId;
  if (status) where.statut = status;

  const evaluations = await prisma.evaluation.findMany({
    where,
    include: {
      user: { select: { id: true, nom: true, prenom: true, matricule: true } },
      service: { select: { id: true, nom: true } },
      zone: { select: { id: true, nom: true } },
    },
    orderBy: { date: 'desc' },
    take: limit,
  });

  return NextResponse.json(evaluations);
}

// POST — Create evaluation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { date, serviceId, zoneId, commentaireGeneral, reponses, statut } = body;

  // Calculate scores
  const result = calcTotalScore5S(reponses || {});
  const appreciation = getAppreciation5S(result.total);

  const evaluation = await prisma.evaluation.create({
    data: {
      userId: session.user.id,
      date: new Date(date),
      serviceId,
      zoneId,
      commentaireGeneral: commentaireGeneral || null,
      scoreSeiri: result.pillarScores.seiri,
      scoreSeiton: result.pillarScores.seiton,
      scoreSeiso: result.pillarScores.seiso,
      scoreSeiketsu: result.pillarScores.seiketsu,
      scoreShitsuke: result.pillarScores.shitsuke,
      scoreTotal: result.total,
      appreciation,
      reponses: reponses || {},
      statut: (statut as EvalStatus) || 'brouillon',
      iaSource: 'local' as IASource,
    },
  });

  return NextResponse.json(evaluation, { status: 201 });
}
