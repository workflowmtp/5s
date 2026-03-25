// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const users = await prisma.user.findMany({
    select: {
      id: true, matricule: true, nom: true, prenom: true,
      role: true, fonction: true, telephone: true, statut: true,
      createdAt: true,
      service: { select: { id: true, nom: true } },
      atelier: { select: { id: true, nom: true } },
    },
    orderBy: { nom: 'asc' },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }

  const body = await req.json();
  const hashed = await bcrypt.hash(body.password || 'demo', 10);

  const existing = await prisma.user.findUnique({ where: { matricule: body.matricule } });
  if (existing) return NextResponse.json({ error: 'Ce matricule existe déjà' }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      matricule: body.matricule.toUpperCase(),
      nom: body.nom,
      prenom: body.prenom,
      password: hashed,
      role: body.role || 'employe',
      serviceId: body.serviceId,
      atelierId: body.atelierId || null,
      fonction: body.fonction || 'Agent',
      telephone: body.telephone || null,
    },
  });

  return NextResponse.json({ id: user.id, matricule: user.matricule }, { status: 201 });
}
