// src/app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const categories = await prisma.categorie.findMany({ orderBy: { ordre: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }
  const body = await req.json();
  const existing = await prisma.categorie.findUnique({ where: { nom: body.nom } });
  if (existing) return NextResponse.json({ error: 'Existe déjà' }, { status: 409 });

  const count = await prisma.categorie.count();
  const cat = await prisma.categorie.create({
    data: { nom: body.nom, icone: body.icone || '📌', ordre: count },
  });
  return NextResponse.json(cat, { status: 201 });
}
