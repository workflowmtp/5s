// src/app/api/admin/permissions/roles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET: Get all role-permission assignments grouped by role
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }

  const rolePermissions = await prisma.rolePermission.findMany({
    include: { permission: true },
    orderBy: [{ role: 'asc' }, { permission: { module: 'asc' } }],
  });

  // Group by role
  const grouped: Record<string, any[]> = {};
  for (const rp of rolePermissions) {
    if (!grouped[rp.role]) grouped[rp.role] = [];
    grouped[rp.role].push({
      id: rp.id,
      permissionId: rp.permissionId,
      code: rp.permission.code,
      label: rp.permission.label,
      module: rp.permission.module,
    });
  }

  return NextResponse.json(grouped);
}

// POST: Assign/update permissions for a role (replaces all permissions for that role)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }

  const { role, permissionIds } = await req.json();

  if (!role || !Array.isArray(permissionIds)) {
    return NextResponse.json({ error: 'role et permissionIds[] sont requis.' }, { status: 400 });
  }

  const validRoles = ['employe', 'superviseur', 'direction', 'admin'];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Rôle invalide.' }, { status: 400 });
  }

  // Delete existing assignments for this role, then create new ones
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { role } }),
    ...permissionIds.map((permissionId: string) =>
      prisma.rolePermission.create({
        data: { role, permissionId },
      })
    ),
  ]);

  return NextResponse.json({ success: true, role, count: permissionIds.length });
}
