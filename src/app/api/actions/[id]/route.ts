// src/app/api/actions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.echeance) body.echeance = new Date(body.echeance);
  if (body.avancement !== undefined) {
    if (body.avancement > 0 && !body.statut) body.statut = 'en_cours';
    if (body.avancement >= 100 && !body.statut) body.statut = 'terminee';
  }

  const action = await prisma.action.update({ where: { id }, data: body });
  return NextResponse.json(action);
}
