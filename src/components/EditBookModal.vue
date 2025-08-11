<template>
  <div v-if="appStore.isEditBookModalOpen" class="modal-overlay">
    <div class="modal-content" style="    background: rgba(255, 255, 255, 0.2);     backdrop-filter: blur(5px);">
      <h2 class="modal-title">Editar Libro</h2>
      <form @submit.prevent="handleEditBook" class="form-container">
        <input type="hidden" v-model="bookForm.id" />
        <div class="form-field">
          <label class="form-label">Título *</label>
          <input type="text" v-model="bookForm.title" class="form-input" required />
        </div>
        <div class="form-field">
          <label class="form-label">Autor</label>
          <input type="text" v-model="bookForm.author" class="form-input" />
        </div>
        <div class="form-field">
          <label class="form-label">Total de Páginas *</label>
          <input type="number" v-model.number="bookForm.pages" min="1" class="form-input" required />
        </div>
        <div class="form-field">
          <label class="form-label">Género</label>
          <input type="text" v-model="bookForm.genre" class="form-input" />
        </div>
        <div class="form-field">
          <label class="form-label">Portada (URL)</label>
          <input type="text" v-model="bookForm.cover" class="form-input" placeholder="Ingresa la URL de la portada" />
        </div>
        <div class="form-actions">
          <button type="button" @click="appStore.closeEditBookModal()" class="cancel-button">Cancelar</button>
          <button type="submit" class="save-button">Actualizar libro</button>
        </div>
      </form>
      <button class="close-button" @click="appStore.closeEditBookModal()">&times;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const bookForm = ref({
  id: '',
  title: '',
  author: '',
  pages: 0,
  genre: '',
  cover: '',
  currentPage: 0,
  createdAt: '',
  finishedAt: null as string | null
})

watch(() => appStore.isEditBookModalOpen, (isOpen) => {
  if (isOpen && appStore.currentReadingIdForProgress) {
    const readingToEdit = appStore.readings.find((r: any) => r.id === appStore.currentReadingIdForProgress)
    if (readingToEdit) {
      bookForm.value = {
        id: readingToEdit.book.id,
        title: readingToEdit.book.title,
        author: readingToEdit.book.author,
        pages: readingToEdit.book.page_count,
        genre: '',
        cover: readingToEdit.book.cover_image_url,
        currentPage: readingToEdit.currentPage || 0,
        createdAt: '',
        finishedAt: readingToEdit.finish_date || null
      }
    }
  }
})

function handleEditBook() {
  appStore.updateBook(bookForm.value)
  // appStore.checkAchievements() // Se verificará cuando se actualice el progreso o se añada/elimine libro
  appStore.closeEditBookModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4); /* Fondo más sutil */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* Asegurarse de que esté por encima de todo */
}

.modal-content {
  background-color: var(--color-card-background);
  border-radius: 0.75rem; /* Más redondeado */
  width: 91.666667%; /* w-11/12 */
  max-width: 500px; /* Un max-width para desktop */
  padding: 2rem; /* p-8, más generoso */
  position: relative;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Sombra estándar */
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Espaciado entre elementos del modal */
}

@media (min-width: 768px) {
  .modal-content {
    width: 50%; /* md:w-1/2 */
  }
}

@media (min-width: 1024px) {
  .modal-content {
    width: 33.333333%; /* lg:w-1/3 */
  }
}

.modal-title {
  font-size: 1.5rem; /* text-2xl */
  font-weight: 700; /* font-bold */
  color: var(--color-text-primary);
  margin-bottom: 0.5rem; /* mb-2 */
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* space-y-4 */
}

.form-label {
  display: block;
  color: var(--color-text-primary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem; /* Ajustado el padding */
  border: 1px solid var(--color-gray-border);
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  font-size: 1rem;
  color: var(--color-text-primary);
}

.form-input:focus {
  border-color: var(--color-green-primary);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); /* Sombra de foco */
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button,
.save-button {
  padding: 0.75rem 1.25rem; /* px-5 py-3 */
  border-radius: 0.75rem; /* Más redondeado */
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  font-weight: 600;
  border: none;
}

.cancel-button {
  background-color: var(--color-gray-light);
  color: var(--color-text-primary);
}

.cancel-button:hover {
  background-color: var(--color-gray-border);
}

.save-button {
  background-color: var(--color-green-primary);
  color: white;
}

.save-button:hover {
  background-color: var(--color-green-hover);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
}

.close-button:hover {
  color: var(--color-text-primary);
}
</style> 