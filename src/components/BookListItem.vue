<template>
  <div class="book-list-item">
    <div class="book-details">
      <img v-if="reading.book?.cover_image_url" :src="reading.book.cover_image_url" alt="Portada" class="book-list-cover" />
      <span v-else class="material-symbols-outlined default-book-list-cover">book</span>
      <div>
        <h3 class="book-list-title">{{ reading.book?.title || 'Título desconocido' }}</h3>
        <p class="book-list-author">{{ reading.book?.author || 'Autor desconocido' }}</p>
      </div>
    </div>
    <span class="finished-date">Terminado: {{ formattedFinishedDate }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  reading: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const formattedFinishedDate = computed(() => {
  if (props.reading.finish_date) {
    return new Date(props.reading.finish_date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
  return 'Fecha no disponible'
})
</script>

<style scoped>
.book-list-item {
  background-color: var(--color-card-background);
  border-radius: 0.75rem; /* rounded-lg, más redondeado */
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02); /* Sombra más sutil */
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.book-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.book-list-cover {
  width: 3rem;
  height: 4rem;
  object-fit: cover;
  border-radius: 0.5rem;
}

.default-book-list-cover {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24; /* Tamaño de icono más pequeño */
  font-size: 3rem; /* Ajustado para el tamaño del list-item */
  color: var(--color-gray-border);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3rem;
  height: 4rem;
  border-radius: 0.5rem;
  background-color: var(--color-background);
}

.book-list-title {
  font-weight: 600;
  color: var(--color-text-primary);
}

.book-list-author {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.finished-date {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}
</style> 