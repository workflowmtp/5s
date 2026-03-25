// src/app/auth/login/SearchParamsWrapper.tsx
'use client';

import { Suspense } from 'react';
import LoginPage from './page';

export default function SearchParamsWrapper() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LoginPage />
    </Suspense>
  );
}
