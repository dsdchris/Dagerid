<template>
  <div v-if="appStore.isAddBookModalOpen" class="modal-overlay">
    <div class="modal-content">
      <h2 class="modal-title">Agregar Nuevo Libro</h2>
      <form @submit.prevent="handleAddBook" class="form-container">
        <div class="form-field title-with-search">
          <label class="form-label">Título *</label>
          <div class="input-search-wrapper">
            <input type="text" v-model="bookForm.title" class="form-input" required />
            <button type="button" @click="fetchBookInfo" class="search-icon-btn" :title="'Buscar información en Google Books'">
              <span class="material-symbols-outlined">search</span>
            </button>
          </div>
        </div>
        <div class="form-field">
          <label class="form-label">Autor</label>
          <input type="text" v-model="bookForm.author" class="form-input" />
        </div>
        <div class="form-field">
          <label class="form-label">Total de Páginas *</label>
          <input type="number" v-model.number="bookForm.pages" min="1" class="form-input" required />
        </div>
  
        <p v-if="apiStatus" id="api-status" class="api-status-text">{{ apiStatus }}</p>
    
        <div v-if="bookForm.cover" class="cover-preview-field">
          <label class="form-label">Vista previa de la portada</label>
          <div class="cover-preview-wrapper">
            <img :src="bookForm.cover" alt="Vista previa de la portada" class="cover-preview-img" @error="onImageError" />
          </div>
        </div>
       
        <div class="form-actions">
          <button type="button" @click="appStore.closeAddBookModal()" class="cancel-button">Cancelar</button>
          <button type="submit" class="save-button">Guardar y empezar</button>
        </div>
      </form>
      <button class="close-button" @click="appStore.closeAddBookModal()">&times;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const bookForm = ref({
  title: '',
  author: '',
  pages: 0,
  genre: '',
  cover: '',
  isbn13: '',
  description: '',
  publishedDate: ''
})

const apiStatus = ref('')

watch(() => appStore.isAddBookModalOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

function resetForm() {
  bookForm.value = {
    title: '',
    author: '',
    pages: 0,
    genre: '',
    cover: '',
    isbn13: '',
    description: '',
    publishedDate: ''
  }
  apiStatus.value = ''
}

async function fetchBookInfo() {
  if (!bookForm.value.title) return
  apiStatus.value = 'Buscando...'

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:"${encodeURIComponent(bookForm.value.title)}"`)
    const data = await res.json()

    if (data.totalItems > 0) {
      const info = data.items[0].volumeInfo
      bookForm.value.title = info.title || bookForm.value.title
      bookForm.value.author = (info.authors && info.authors.join(', ')) || ''
      bookForm.value.pages = info.pageCount || 0
      bookForm.value.genre = (info.categories && info.categories[0]) || ''
      // Mejorar calidad de la portada si es de Google Books
      let coverUrl = (info.imageLinks && info.imageLinks.thumbnail) || '';
      if (coverUrl.includes('books.google.com')) {
        coverUrl = coverUrl.replace('zoom=1', 'zoom=2'); // o 'zoom=3' para máxima calidad
      }
      bookForm.value.cover = coverUrl;
      bookForm.value.description = info.description || ''
      // Buscar el ISBN13 correcto (puede estar en industryIdentifiers)
      const isbn13Obj = info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13');
      bookForm.value.isbn13 = isbn13Obj?.identifier || '';
      bookForm.value.publishedDate = info.publishedDate || '';

      apiStatus.value = 'Información cargada desde API.'
    } else {
      apiStatus.value = 'No se encontró el libro. Ingresa información manualmente.'
    }
  } catch (err) {
    console.error(err)
    apiStatus.value = 'Error al obtener datos de la API.'
  }
}

async function handleAddBook() {
  if (!bookForm.value.title || bookForm.value.pages <= 0) { // Validar también páginas
    alert('Por favor, ingresa un título y un número de páginas válido.');
    return;
  }

  const bookData = {
    title: bookForm.value.title,
    author: bookForm.value.author,
    page_count: bookForm.value.pages, // Mapear pages a page_count
    cover_image_url: bookForm.value.cover,
    isbn13: bookForm.value.isbn13,
    description: bookForm.value.description,
    published_date: bookForm.value.publishedDate,
  };
  
  await appStore.addReading(bookData); // CAMBIO: Llamar a addReading
  appStore.closeAddBookModal(); // Cerrar el modal después de añadir
}

const onImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = 'https://via.placeholder.com/128x192?text=Sin+portada';
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 30, 30, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: #fff;
  border-radius: 1.25rem;
  width: 95%;
  max-width: 420px;
  padding: 2.5rem 1.5rem 2rem 1.5rem;
  position: relative;
  box-shadow: 0 12px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: modalFadeIn 0.35s cubic-bezier(.4,0,.2,1);
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(40px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-title {
  font-size: 2rem;
  font-weight: 800;
  color: #111;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
  text-align: center;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  color: #222;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  outline: none;
  font-size: 1rem;
  color: #222;
  background: #fafbfc;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  border-color: #111;
  box-shadow: 0 0 0 2px #0001;
}

.api-search-button {
  margin-top: 0.25rem;
  padding: 0.75rem 1.25rem;
  background: #111;
  color: #fff;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 700;
  border: none;
  font-size: 1rem;
  transition: background 0.2s;
}

.api-search-button:hover {
  background: #222;
}

.api-status-text {
  font-size: 0.95rem;
  color: #666;
  margin-top: 0.25rem;
}

.cover-preview-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.cover-preview-wrapper {
  width: 128px;
  height: 192px;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f6f6f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 2px 8px #0001;
}
.cover-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button,
.save-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  transition: background 0.2s;
}

.cancel-button {
  background: #f3f4f6;
  color: #222;
}
.cancel-button:hover {
  background: #e5e7eb;
}
.save-button {
  background: #111;
  color: #fff;
}
.save-button:hover {
  background: #222;
}

.close-button {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  color: #888;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.2s;
}
.close-button:hover {
  color: #111;
}

.title-with-search {
  position: relative;
}
.input-search-wrapper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  position: relative;
}
.search-icon-btn {
  background: #111;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 11px;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  margin-left: 0.25rem;
  box-shadow: 0 1px 4px #0001;
}
.search-icon-btn:hover {
  background: #222;
  color: #fff;
  box-shadow: 0 2px 8px #0002;
}
.input-search-wrapper .form-input {
  flex: 1 1 0%;
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

@media (max-width: 600px) {
  .modal-content {
    padding: 1.25rem 0.5rem 1rem 0.5rem;
    max-width: 98vw;
  }
  .modal-title {
    font-size: 1.25rem;
  }
  .form-label {
    font-size: 0.95rem;
  }
  .form-input {
    font-size: 0.95rem;
    padding: 0.6rem 0.75rem;
  }
  .cover-preview-wrapper {
    width: 96px;
    height: 144px;
  }
}
</style> 