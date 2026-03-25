// src/app/api/evaluations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET — Single evaluation
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, nom: true, prenom: true, matricule: true } },
      service: { select: { id: true, nom: true } },
      zone: { select: { id: true, nom: true } },
      photos: true,
    },
  });

  if (!evaluation) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  return NextResponse.json(evaluation);
}

// PATCH — Update evaluation
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const evaluation = await prisma.evaluation.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(evaluation);
}

// DELETE — Delete evaluation (brouillon only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.evaluation.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  if (existing.statut !== 'brouillon') return NextResponse.json({ error: 'Seuls les brouillons peuvent être supprimés' }, { status: 400 });

  await prisma.evaluation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
