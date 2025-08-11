<template>
  <div class="page-container">
    <!-- 1. Header de la página -->
    <header class="page-header">
      <div>
        <h1 class="page-title">Mi Biblioteca</h1>
        <p class="page-subtitle">Gestiona tu colección de lecturas.</p>
      </div>
      <button class="add-book-button" @click="openAddBookModal">
        <span class="material-symbols-outlined">add</span>
        Añadir Libro
      </button>
    </header>

    <!-- 2. Panel de Control (Filtros y Búsqueda) -->
    <div class="controls-panel">
      <!-- Barra de Búsqueda -->
      <div class="search-wrapper">
        <span class="material-symbols-outlined search-icon">search</span>
        <input type="text" v-model="searchQuery" placeholder="Buscar por título o autor..." class="search-input">
      </div>
      <!-- Filtros de Estado -->
      <div class="filter-wrapper">
        <button 
          v-for="status in filterStatuses" 
          :key="status.value"
          :class="{ 'active': selectedStatus === status.value }"
          class="filter-button"
          @click="selectedStatus = status.value"
        >
          {{ status.label }} ({{ getCountForStatus(status.value) }})
        </button>
      </div>
    </div>

    <!-- 3. Contenido Principal -->
    <main>
      <!-- Estado de Carga -->
      <div v-if="isLoading" class="global-loader">
        <span class="material-symbols-outlined loader-icon">hourglass_top</span>
        <p>Cargando tus libros...</p>
      </div>
      
      <!-- Contenido Principal (con estado vacío integrado) -->
      <div v-else-if="filteredReadings.length > 0" class="books-content">
        <div class="books-grid">
          <BookCard
            v-for="reading in filteredReadings"
            :key="reading.id"
            :reading="reading" 
            @open-progress-modal="openUpdateProgressModal(reading.id)"
            @open-edit-modal="openEditBookModal(reading.id)"
            @delete-reading="confirmDeleteReading(reading.id, reading.book.title)"
          />
        </div>
      </div>
      
      <!-- Estado Vacío (mostrado si no hay resultados de búsqueda o libros en total) -->
      <div v-else class="empty-state">
        <div class="empty-state-content">
          <span class="material-symbols-outlined empty-icon">{{ appStore.readings.length === 0 ? 'import_contacts' : 'search_off' }}</span>
          <h3 class="empty-title">{{ appStore.readings.length === 0 ? 'Tu biblioteca está vacía' : 'No se encontraron resultados' }}</h3>
          <p class="empty-description">
            {{ appStore.readings.length === 0 ? 'Empieza añadiendo tu primer libro para verlo aquí.' : 'Intenta con otro término de búsqueda o cambia el filtro.' }}
          </p>
          <button v-if="appStore.readings.length === 0" class="add-book-button large" @click="openAddBookModal">
            Añade tu primer libro
          </button>
        </div>
      </div>
    </main>
    
    <!-- 4. Modales -->
    <AddBookModal v-if="appStore.isAddBookModalOpen" />
    <EditBookModal v-if="appStore.isEditBookModalOpen" />
    <UpdateProgressModal />
    <AchievementModal
      :isOpen="appStore.isAchievementModalOpen"
      :achievement="appStore.latestAchievement"
      @close="appStore.closeAchievementModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/appStore';
import BookCard from '@/components/BookCard.vue';
import AddBookModal from '@/components/AddBookModal.vue';
import EditBookModal from '@/components/EditBookModal.vue';
import UpdateProgressModal from '@/components/UpdateProgressModal.vue';
import AchievementModal from '@/components/AchievementModal.vue';

const appStore = useAppStore();
const isLoading = ref(true);

// --- Estado local para filtros y modales ---
const searchQuery = ref('');
const selectedStatus = ref<'all' | 'leyendo' | 'por_leer' | 'leido' | 'abandonado'>('all');

const openAddBookModal = () => appStore.openAddBookModal();

// --- Lógica de Filtros ---
type Status = 'all' | 'leyendo' | 'por_leer' | 'leido' | 'abandonado';

const filterStatuses: { label: string; value: Status }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Leyendo', value: 'leyendo' },
  { label: 'Por Leer', value: 'por_leer' },
  { label: 'Leídos', value: 'leido' },
  { label: 'Abandonados', value: 'abandonado' },
];

const filteredReadings = computed(() => {
  return appStore.readings.filter(reading => {
    // Filtrar por estado
    const statusMatch = selectedStatus.value === 'all' || reading.status === selectedStatus.value;
    
    // Filtrar por búsqueda
    const query = searchQuery.value.toLowerCase();
    const searchMatch = !query || 
                        reading.book?.title?.toLowerCase().includes(query) ||
                        reading.book?.author?.toLowerCase().includes(query);

    return statusMatch && searchMatch;
  });
});

const getCountForStatus = (status: Status): number => {
    if (status === 'all') return appStore.readings.length;
    return appStore.readings.filter(r => r.status === status).length;
};

// --- Funciones de Interacción ---
const openUpdateProgressModal = (readingId: string) => appStore.openUpdateProgressModal(readingId);
const openEditBookModal = (readingId: string) => appStore.openEditBookModal(readingId);
const confirmDeleteReading = (readingId: string, title: string) => {
  if (confirm(`¿Estás seguro de eliminar la lectura de "${title}"?`)) {
    appStore.deleteReading(readingId);
  }
};

// --- Carga de Datos ---
onMounted(async () => {
  isLoading.value = true;
  try {
    if (appStore.readings.length === 0) {
      await appStore.fetchInitialData(); // fetchInitialData es más completo
    }
  } catch (error) {
    console.error('Error al cargar datos en Mis Libros:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* ========================================= */
/*  ESTILOS BASE (Mobile First)              */
/* ========================================= */

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem; /* Padding reducido para móviles */
  position: relative;
}

/* --- Header de la Página --- */
.page-header {
  display: flex;
  flex-direction: column; /* Apilado en móvil */
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.75rem; /* Tamaño reducido para móvil */
  font-weight: 700;
  letter-spacing: -0.05em;
  color: var(--foreground);
}

.page-subtitle {
  font-size: 1rem;
  color: var(--muted-foreground);
  margin-top: 0.25rem;
}

.add-book-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--primary, hsl(222.2 47.4% 11.2%));
  color: var(--primary-foreground, hsl(210 40% 98%));
  padding: 0.6rem 1rem;
  width: 100%; /* Ocupa todo el ancho en móvil */
  border-radius: var(--radius, 0.5rem);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
  font-family: Inter;
}

.add-book-button:hover {
  opacity: 0.9;
}

.add-book-button.large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}


/* --- Panel de Controles --- */
.controls-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted-foreground);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background-color: var(--background);
  color: var(--foreground);
  font-size: 1rem; /* Asegura buena legibilidad en móvil */
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.filter-wrapper {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto; /* Permite scroll horizontal si los filtros no caben */
  padding-bottom: 0.5rem; /* Espacio para la barra de scroll */
  -webkit-overflow-scrolling: touch; /* Scroll suave en iOS */
}
/* Ocultar barra de scroll pero mantener funcionalidad */
.filter-wrapper::-webkit-scrollbar { display: none; }
.filter-wrapper { -ms-overflow-style: none; scrollbar-width: none; }


.filter-button {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted-foreground);
  background-color: var(--muted);
  border: 1px solid transparent;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-button.active {
  background-color: var(--background);
  color: var(--foreground);
  border-color: var(--border);
}


/* --- Contenido Principal (Listas de Libros) --- */
.books-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
}

.books-grid {
  display: grid;
  /* Una columna por defecto en móviles */
  grid-template-columns: 1fr;
  gap: 1rem;
}

.finished-books-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


/* --- Estados Vacío y de Carga --- */
.empty-state, .global-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  text-align: center;
  padding: 1rem;
}
.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.empty-icon {
  font-size: 3rem;
  color: var(--muted-foreground);
}
.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
}
.empty-description {
  max-width: 350px;
  color: var(--muted-foreground);
}
.loader-icon {
  font-size: 2.5rem;
  animation: spin 1.5s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}


/* ========================================= */
/*  ESTILOS PARA TABLET (Breakpoint > 768px) */
/* ========================================= */
@media (min-width: 768px) {
  .page-container {
    padding: 1.5rem; /* Volvemos al padding original */
  }

  .page-header {
    flex-direction: row; /* Elementos en línea */
    align-items: center;
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 2.25rem; /* Restauramos el tamaño grande */
  }

  .add-book-button {
    width: auto; /* El botón recupera su ancho natural */
  }

  .controls-panel {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 1rem; /* Restauramos padding si lo habíamos reducido */
    background-color: transparent; /* Fondo transparente en desktop */
    border: none;
  }
  
  .filter-wrapper {
    overflow-x: visible; /* Ya no necesita scroll */
  }
  
  .filter-button {
    background-color: transparent; /* Fondo transparente en desktop */
  }
  
  .filter-button.active {
    background-color: var(--background);
  }

  .books-grid {
    /* Dos columnas en tablet */
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

/* ============================================= */
/*  ESTILOS PARA DESKTOP (Breakpoint > 1024px)   */
/* ============================================= */
@media (min-width: 1024px) {
  .books-grid {
    /* La cuadrícula puede tener más columnas en pantallas grandes */
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

 
}

@media (width < 450px  ) {
    .page-container {
      width: 100%;
    }
  }


</style>