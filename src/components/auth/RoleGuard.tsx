// src/components/auth/RoleGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = '/dashboard' }: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    const user = session.user as any;
    const userRole = user?.role;

    if (!allowedRoles.includes(userRole)) {
      router.push(redirectTo);
    }
  }, [session, status, router, allowedRoles, redirectTo]);

  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  if (!session) {
    return null;
  }

  const user = session.user as any;
  const userRole = user?.role;

  if (!allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
