'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Coins, Zap, Target, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const { usuario } = useAuth();
  if (!usuario) return null;
  const isAluno = usuario.role === 'ALUNO';

  return (
    
      
        
          Bem-vindo,


          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {usuario.nomeCompleto.split(' ')[0]} 🌵
          </h1>
        


        
          {isAluno ? `NÍVEL ${usuario.nivel}` : usuario.role}
        


      



      {isAluno ? (
        <>
          
            
              <Coins size={24} className="mb-2" />
              {usuario.cactoscoins}


              Cactoscoins


            


            
              <Zap size={24} className="mb-2" />
              {usuario.xp}


              XP Total


            


          



          
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Target size={16} /> Metas de Leitura
            </h2>
            {[
              { label: 'Bimestral', current: 2, total: 5, color: 'bg-amber-500' },
              { label: 'Semestral', current: 5, total: 15, color: 'bg-emerald-500' },
              { label: 'Anual', current: 5, total: 30, color: 'bg-cyan-500' },
            ].map((m) => (
              
                
                  
                    {m.label}
                  
                  
                    {m.current} / {m.total} livros
                  
                


                
                  
                


              


            ))}
          


        </>
      ) : (
        
          Painel de


          
            {usuario.role === 'PROFESSOR' ? 'Professor' : 'Coordenador'}
          


          
            Gerencie turmas, biblioteca e desafios
          


        


      )}

      
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <TrendingUp size={16} /> Desafios Ativos
        </h2>
        
          
            
              
                🎬 Maratona de Cordéis
              


              
                Poste uma resenha em vídeo e ganhe recompensas
              


            


            
              +50 🌵
            
          


        


      


    


  );
}
