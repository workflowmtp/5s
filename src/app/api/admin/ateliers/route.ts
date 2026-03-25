// src/app/api/admin/ateliers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const ateliers = await prisma.atelier.findMany({ orderBy: { ordre: 'asc' } });
  return NextResponse.json(ateliers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }
  const { nom } = await req.json();
  const existing = await prisma.atelier.findUnique({ where: { nom } });
  if (existing) return NextResponse.json({ error: 'Cet atelier existe déjà' }, { status: 409 });

  const count = await prisma.atelier.count();
  const atelier = await prisma.atelier.create({ data: { nom, ordre: count } });
  return NextResponse.json(atelier, { status: 201 });
}
