// src/app/api/middleware/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;
  const role = user?.role;
  const pathname = req.nextUrl.searchParams.get('pathname') || '';

  // Admin-only routes
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.json({ redirect: '/dashboard' });
  }

  // Direction routes
  if (pathname.startsWith('/direction') && !['direction', 'admin'].includes(role)) {
    return NextResponse.json({ redirect: '/dashboard' });
  }

  // Supervisor routes
  if (pathname.startsWith('/superviseur') && !['superviseur', 'direction', 'admin'].includes(role)) {
    return NextResponse.json({ redirect: '/dashboard' });
  }

  return NextResponse.json({ allowed: true });
}
