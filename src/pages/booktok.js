import { createPost, likePost, listPosts } from '../services/posts.js';
import { showToast } from '../components/Toast.js';
import { showModal } from '../components/Modal.js';

export async function renderBookTok(profile) {
  const posts = profile.role === 'coordinator'
    ? await (await import('../services/posts.js')).listAllPosts()
    : await listPosts(profile.className);

  document.getElementById('pageContent').innerHTML = `
    
      
        <h1>BookTok</h1>
        Compartilhe resenhas com a comunidade.


      


      <button id="newPostBtn" class="primary-btn">Nova resenha</button>
    



    
      ${posts.length > 0 ? posts.map(p => `
        
          ${p.videoUrl ? '▶' : '📖'}


          
            @${(p.userName || '').toLowerCase().replace(/\s/g, '')}
            <h3>${p.title}</h3>
            ${p.description}


            
              <button class="like-post" data-id="${p.id}">❤️ ${p.likesCount || 0}</button>
              <button>💬 Comentar</button>
            


          


        


      `).join('') : 'Nenhuma publicação ainda.

'}
    


  `;

  document.getElementById('newPostBtn').addEventListener('click', showNewPostModal);

  document.querySelectorAll('.like-post').forEach(btn => {
    btn.addEventListener('click', async () => {
      await likePost(btn.dataset.id);
      showToast('Você curtiu esta publicação.');
    });
  });
}

function showNewPostModal() {
  showModal('Nova resenha', `
    <form id="postForm" class="form-grid">
      <label>Título <input name="title" required /></label>
      <label>Descrição <textarea name="description" required></textarea></label>
      <label>Link do vídeo <input name="videoUrl" type="url" /></label>
      <button class="primary-btn full" type="submit">Publicar</button>
    </form>
  `);

  document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const profile = JSON.parse(localStorage.getItem('_profile') || '{}');

    await createPost({
      title: fd.get('title'),
      description: fd.get('description'),
      videoUrl: fd.get('videoUrl'),
      userId: profile.uid,
      userName: profile.name,
      className: profile.className
    });

    showToast('Resenha publicada!', 'success');
    document.getElementById('modal').classList.add('hidden');
    renderBookTok(profile);
  });
}
