import { listBooks, searchBooks } from '../services/books.js';
import { isStudent, isStaff } from '../utils/permissions.js';
import { showToast } from '../components/Toast.js';
import { showModal } from '../components/Modal.js';

export async function renderLibrary(profile) {
  const books = await listBooks();

  document.getElementById('pageContent').innerHTML = `
    
      
        <h1>Biblioteca</h1>
        Descubra novas leituras.


      


      ${isStaff(profile) ? '<button id="addBookBtn" class="primary-btn">+ Livro</button>' : ''}
    



    
      
        <input id="searchBooks" placeholder="Buscar por título ou autor..." style="flex:1" />
      



      
        ${books.length > 0 ? books.map(b => `
          
            
              ${b.coverUrl ? `<img src="${b.coverUrl}" style="width:100%;height:100%;object-fit:cover" />` : '📚'}
            


            
              ${b.category || 'Literatura'}
              <h3>${b.title}</h3>
              ${b.author || ''}


              ${b.pages || 0} páginas


              
                ${b.pdfUrl ? `<a class="secondary-btn" href="${b.pdfUrl}" target="_blank" style="font-size:12px">📄 PDF</a>` : 'Sem PDF'}
                ${isStaff(profile) ? `<button class="danger-btn" style="font-size:12px;padding:6px 10px;min-height:auto" data-remove="${b.id}">Excluir</button>` : ''}
              


            


          


        `).join('') : 'Nenhum livro cadastrado.

'}
      


    


  `;

  document.getElementById('searchBooks')?.addEventListener('input', async (e) => {
    const term = e.target.value;
    const filtered = term ? await searchBooks(term) : books;
    const container = document.getElementById('booksContainer');

    container.innerHTML = filtered.length > 0
      ? filtered.map(b => `...

`).join('')
      : 'Nenhum resultado.

';
  });

  document.getElementById('addBookBtn')?.addEventListener('click', showAddBookModal);
  document.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { deleteBook } = await import('../services/books.js');
      if (confirm('Excluir este livro?')) {
        await deleteBook(btn.dataset.remove);
        showToast('Livro removido.');
        renderLibrary(profile);
      }
    });
  });
}

function showAddBookModal() {
  showModal('Adicionar livro', `
    <form id="bookForm" class="form-grid">
      <label>Título <input name="title" required /></label>
      <label>Autor <input name="author" required /></label>
      <label>Total de páginas <input name="pages" type="number" min="1" required /></label>
      <label>Categoria <input name="category" value="Literatura" /></label>
      <label>Link do PDF <input name="pdfUrl" type="url" /></label>
      <button class="primary-btn full" type="submit">Salvar livro</button>
    </form>
  `);

  document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const { addBook } = await import('../services/books.js');
    await addBook({
      title: fd.get('title'),
      author: fd.get('author'),
      pages: Number(fd.get('pages')),
      category: fd.get('category'),
      pdfUrl: fd.get('pdfUrl')
    });
    showToast('Livro adicionado!');
    document.getElementById('modal').classList.add('hidden');
    renderLibrary(JSON.parse(localStorage.getItem('_profile') || '{}'));
  });
}
