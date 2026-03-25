// src/app/api/suggestions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const suggestion = await prisma.suggestion.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, nom: true, prenom: true, matricule: true } },
      categorie: true,
      serviceConcerne: { select: { id: true, nom: true } },
      photos: true,
    },
  });

  if (!suggestion) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  return NextResponse.json(suggestion);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const suggestion = await prisma.suggestion.update({
    where: { id },
    data: { ...body, updatedAt: new Date() },
  });

  return NextResponse.json(suggestion);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.suggestion.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  if (existing.statut !== 'brouillon') return NextResponse.json({ error: 'Seuls les brouillons peuvent être supprimés' }, { status: 400 });

  await prisma.suggestion.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
