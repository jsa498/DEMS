'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading) {
      if (session.isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [loading, session.isAuthenticated, router]);
  
  return (
    <div className="h-screen w-full flex items-center justify-center">
      {loading ? 'Loading...' : null}
    </div>
  );
}
