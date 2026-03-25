// src/app/api/admin/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const service = await prisma.service.update({ where: { id }, data: body });
  return NextResponse.json(service);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }
  const { id } = await params;
  const usersCount = await prisma.user.count({ where: { serviceId: id } });
  if (usersCount > 0) return NextResponse.json({ error: 'Service utilisé par des employés' }, { status: 400 });

  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
