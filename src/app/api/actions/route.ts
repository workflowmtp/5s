// src/app/api/actions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const statut = searchParams.get('statut');
  const priorite = searchParams.get('priorite');
  const where: any = {};
  if (statut) where.statut = statut;
  if (priorite) where.priorite = priorite;

  const actions = await prisma.action.findMany({
    where,
    include: {
      responsable: { select: { id: true, nom: true, prenom: true } },
    },
    orderBy: [{ priorite: 'asc' }, { echeance: 'asc' }],
  });

  return NextResponse.json(actions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const action = await prisma.action.create({
    data: {
      description: body.description,
      responsableId: body.responsableId || null,
      echeance: body.echeance ? new Date(body.echeance) : null,
      statut: body.statut || 'ouverte',
      priorite: body.priorite || 'moyenne',
      avancement: body.avancement || 0,
      origineType: body.origineType || 'autre',
      evaluationId: body.evaluationId || null,
      suggestionId: body.suggestionId || null,
    },
  });

  return NextResponse.json(action, { status: 201 });
}
