// src/app/api/admin/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET: List all permissions with their role assignments
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }

  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { code: 'asc' }],
    include: {
      roles: { select: { id: true, role: true } },
    },
  });

  return NextResponse.json(permissions);
}

// POST: Create a new permission
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }

  const { code, label, description, module } = await req.json();

  if (!code || !label || !module) {
    return NextResponse.json({ error: 'code, label et module sont requis.' }, { status: 400 });
  }

  const existing = await prisma.permission.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: 'Ce code de permission existe déjà.' }, { status: 409 });
  }

  const permission = await prisma.permission.create({
    data: { code, label, description: description || null, module },
  });

  return NextResponse.json(permission, { status: 201 });
}
