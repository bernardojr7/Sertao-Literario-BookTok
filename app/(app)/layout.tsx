'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !usuario) router.push('/login');
  }, [usuario, loading, router]);

  if (loading) {
    return (
      
        🌵


      


    );
  }
  if (!usuario) return null;

  return (
    
      
        <main className="pb-24">{children}</main>
        <BottomNav pathname={pathname} />
      


    


  );
}
