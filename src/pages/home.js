import { getRanking } from '../services/users.js';
import { isStudent, initials, roleLabel } from '../utils/permissions.js';

export async function renderHome(profile) {
  const isStd = isStudent(profile);
  const ranking = isStd ? await getRanking(profile.className) : [];

  document.getElementById('pageContent').innerHTML = `
    
      
        <h1>Olá, ${profile.name?.split(' ')[0] || 'Leitor'}!</h1>
        ${isStd ? `Turma ${profile.className}` : `Painel • ${roleLabel(profile.role)}`}


      


    



    
      
        🌵


        Cactoscoins


        ${profile.cactoscoins || 0}


      


      
        ⭐


        Experiência XP


        ${profile.xp || 0}


      


      
        🏅


        Nível


        ${profile.level || 1}


      


      
        📚


        Livros lidos


        ${profile.booksRead || 0}


      


    



    
      
        <h2>Metas de leitura</h2>


        
          
            Meta bimestral**${profile.booksRead || 0} de 10**


            




          


          
            Meta semestral**${profile.booksRead || 0} de 30**


            




          


          
            Meta anual**${profile.booksRead || 0} de 60**


            




          


        


      



      
        <h2>Ranking</h2>Top ${ranking.length}


        
          ${ranking.length > 0 ? ranking.map((u, i) => `
            
              ${i + 1}


              ${initials(u.name)}


              ${u.name}


              ${u.xp || 0} XP
            


          `).join('') : 'Ainda sem dados.

'}
        


      


    



    
      <h2>Missões da turma</h2>


      Nenhuma missão ativa.




    


  `;
}
