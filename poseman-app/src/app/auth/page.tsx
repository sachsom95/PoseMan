'use client';

import { Suspense } from 'react';
import { AuthForm } from './auth-form';

// Loading component
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse">
        <span className="text-white font-bold text-2xl">P</span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthForm />
    </Suspense>
  );
}
