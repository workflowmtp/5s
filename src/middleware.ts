// src/middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes
  const publicRoutes = ['/auth/login', '/auth/register', '/api/auth'];
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublic) return NextResponse.next();

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  const user = req.auth?.user as any;
  const role = user?.role;

  // Admin-only routes
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Direction routes
  if (pathname.startsWith('/direction') && !['direction', 'admin'].includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Supervisor routes
  if (pathname.startsWith('/superviseur') && !['superviseur', 'direction', 'admin'].includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
