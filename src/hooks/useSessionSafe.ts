// src/hooks/useSessionSafe.ts
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function useSessionSafe() {
  const session = useSession();
  const [isNetworkError, setIsNetworkError] = useState(false);

  useEffect(() => {
    if (session.status === 'loading') return;
    
    // Check for network errors
    const checkNetwork = () => {
      if (!navigator.onLine) {
        setIsNetworkError(true);
      } else {
        setIsNetworkError(false);
      }
    };

    window.addEventListener('online', checkNetwork);
    window.addEventListener('offline', checkNetwork);
    
    return () => {
      window.removeEventListener('online', checkNetwork);
      window.removeEventListener('offline', checkNetwork);
    };
  }, [session.status]);

  return {
    ...session,
    isNetworkError,
    isLoading: session.status === 'loading',
    isAuthenticated: session.status === 'authenticated',
    isUnauthenticated: session.status === 'unauthenticated',
  };
}
