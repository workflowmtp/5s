// src/app/api/admin/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { ordre: 'asc' } });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }
  const { nom } = await req.json();
  const existing = await prisma.service.findUnique({ where: { nom } });
  if (existing) return NextResponse.json({ error: 'Ce service existe déjà' }, { status: 409 });

  const count = await prisma.service.count();
  const service = await prisma.service.create({ data: { nom, ordre: count } });
  return NextResponse.json(service, { status: 201 });
}
