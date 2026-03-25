// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const data: any = { ...body };

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ id: user.id, matricule: user.matricule });
}
