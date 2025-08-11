<template>
  <div class="book-card" @click="handleCardClick">
    <!-- Portada del Libro -->
    <div class="cover-wrapper">
      <img 
        :src="reading.book.cover_image_url || 'https://via.placeholder.com/150x220?text=Libro'" 
        alt="Portada del libro" 
        class="book-cover"
        loading="lazy"
      />
      
      <!-- Botones de Acción (aparecen en hover) -->
      <div class="action-buttons">
       <!--  <button 
          class="action-button edit-button" 
          @click.stop="handleEditClick"
          title="Editar libro"
        >
          <span class="material-symbols-outlined">edit</span>
        </button> -->
        <button 
          class="action-button delete-button" 
          @click.stop="handleDeleteClick"
          title="Eliminar libro"
        >
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
    
    <!-- Información del Libro -->
    <div class="book-info">
      <h3 class="book-title">{{ reading.book.title }}</h3>
      <p class="book-author">{{ reading.book.author }}</p>
      <div class="book-status">
        <span class="status-badge" :class="reading.status">{{ getStatusLabel(reading.status) }}</span>
        <span v-if="reading.currentPage || progressPercentage > 0" class="progress-text">
          {{ Math.round(progressPercentage) }}%
        </span>
      </div>
    </div>
    
    <!-- Barra de Progreso -->
    <div class="progress-bar-background">
      <div class="progress-bar-fill" :style="{ width: `${progressPercentage}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/stores/appStore';

const props = defineProps<{
  reading: any;
}>();

const emit = defineEmits(['open-progress-modal', 'open-edit-modal', 'delete-reading']);

const appStore = useAppStore();

const progressPercentage = computed(() => {
  if (!props.reading?.book?.page_count) {
    return 0;
  }
  
  // Primero intentar obtener el progreso del currentPage local
  if (props.reading.currentPage) {
    return (props.reading.currentPage / props.reading.book.page_count) * 100;
  }
  
  // Si no hay currentPage, obtener el progreso más reciente de progressLogs
  const logs = appStore.progressLogs[props.reading.id];
  if (logs && logs.length > 0) {
    // Ordenar por fecha y obtener el más reciente
    const sortedLogs = logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestPage = sortedLogs[0]?.page || 0;
    return (latestPage / props.reading.book.page_count) * 100;
  }
  
  return 0;
});

const getStatusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    'por_leer': 'Por Leer',
    'leyendo': 'Leyendo',
    'leido': 'Leído',
    'abandonado': 'Abandonado'
  };
  return labels[status] || status;
};

const handleCardClick = () => {
  emit('open-progress-modal', props.reading.id);
};

const handleEditClick = () => {
  emit('open-edit-modal', props.reading.id);
};

const handleDeleteClick = () => {
  emit('delete-reading', props.reading.id, props.reading.book.title);
};
</script>

<style scoped>
.book-card {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: var(--card);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  max-width: 400px;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.book-card:hover .action-buttons {
  opacity: 1;
  visibility: visible;
}

.cover-wrapper {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.action-buttons {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  /* En móviles, siempre visibles */
  opacity: 1;
  visibility: visible;
  transition: all 0.2s ease;
}

/* En desktop, solo visibles en hover */
@media (min-width: 768px) {
  .action-buttons {
    opacity: 0;
    visibility: hidden;
  }
  
  .book-card:hover .action-buttons {
    opacity: 1;
    visibility: visible;
  }
}

.action-button {
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

/* En móviles, hacer los botones un poco más pequeños */
@media (max-width: 767px) {
  .action-button {
    width: 2rem;
    height: 2rem;
    background-color: rgba(0, 0, 0, 0.8);
  }
  
  .action-button .material-symbols-outlined {
    font-size: 1rem;
  }
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.edit-button:hover {
  background-color: var(--primary);
}

.delete-button:hover {
  background-color: #ef4444;
}

.action-button .material-symbols-outlined {
  font-size: 1.25rem;
}

.book-info {
  padding: 1rem;
  flex-grow: 1;
}

.book-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 0.25rem;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: calc(var(--radius) / 2);
  text-transform: capitalize;
}

.status-badge.por_leer {
  background-color: var(--muted);
  color: var(--muted-foreground);
}

.status-badge.leyendo {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge.leido {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-badge.abandonado {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
}

.progress-bar-background {
  height: 4px;
  background-color: var(--muted);
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--primary);
  transition: width 0.4s ease-out;
}
</style> 