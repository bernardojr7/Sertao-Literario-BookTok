'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootPage() {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.push(usuario ? '/home' : '/login');
  }, [usuario, loading, router]);

  return (
    
      🌵


    


  );
}
