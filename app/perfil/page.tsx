'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/firebase/auth';

export default function PerfilPage() {
  const { usuario } = useAuth();
  const router = useRouter();

  if (!usuario) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    
      
        
          🌵
        


        
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {usuario.nomeCompleto}
          </h1>
          {usuario.booktokHandle}


          
            {usuario.role}
          
        


      



      
        
          {usuario.cactoscoins}


          Cactoscoins


        


        
          {usuario.xp}


          XP


        


      



      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-medium"
      >
        Sair do App
      </button>
    


  );
}
