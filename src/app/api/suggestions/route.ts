// src/app/api/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import type { SuggestionStatus, IASource } from '@prisma/client';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const role = (session.user as any).role;
  const where: any = {};

  if (role === 'employe') {
    where.userId = session.user.id;
  } else if (role === 'superviseur') {
    where.serviceConcerne = { id: (session.user as any).serviceId };
  }

  if (status && status !== 'all') where.statut = status;

  const suggestions = await prisma.suggestion.findMany({
    where,
    include: {
      user: { select: { id: true, nom: true, prenom: true, matricule: true } },
      categorie: { select: { id: true, nom: true, icone: true } },
      serviceConcerne: { select: { id: true, nom: true } },
    },
    orderBy: { date: 'desc' },
    take: 100,
  });

  return NextResponse.json(suggestions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();

  const suggestion = await prisma.suggestion.create({
    data: {
      userId: session.user.id,
      date: new Date(body.date || new Date()),
      titre: body.titre,
      categorieId: body.categorieId,
      serviceConcerneId: body.serviceConcerneId || null,
      lieu: body.lieu || null,
      probleme: body.probleme,
      suggestion: body.suggestion,
      benefices: body.benefices,
      urgence: body.urgence || null,
      impactEstime: body.impactEstime || null,
      faisabiliteEstimee: body.faisabiliteEstimee || null,
      coutEstime: body.coutEstime || null,
      delaiEstime: body.delaiEstime || null,
      statut: (body.statut as SuggestionStatus) || 'brouillon',
      iaSource: 'local' as IASource,
    },
  });

  return NextResponse.json(suggestion, { status: 201 });
}
