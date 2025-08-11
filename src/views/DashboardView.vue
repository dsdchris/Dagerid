<template>
  <!-- Mostrar el dashboard directamente, sin lógica de carga -->
  <div class="dashboard-container">
    <!-- Usamos un contenedor principal para el padding y el ancho máximo -->
    <header class="dashboard-header">
      <h1 class="header-title">Dashboard</h1>
      <p class="header-subtitle">Un resumen de tu actividad y progreso.</p>
    </header>
  
    <!-- Contenido principal en un grid para flexibilidad -->
    <div class="dashboard-grid">
      
      <!-- Columna Principal (más ancha) -->
      <main class="main-column">
        <!-- KPIs se mueven aquí para un flujo más lógico -->
        <KpiCards v-if="appStore.weeklyStats" />

        <!-- Sección de Libros Activos -->
        <div class="content-section">
          <h2 class="section-title">Tus Libros Activos</h2>
          <p class="section-description">
            Continúa donde lo dejaste.
          </p>
          <div v-if="activeBooks.length > 0" class="active-books-grid">
            <BookCard
              v-for="reading in activeBooks"
              :key="reading.id"
              :reading="reading"
              @open-edit-modal="openEditBookModal(reading.id)"
              @open-progress-modal="openUpdateProgressModal(reading.id)"
              @delete-reading="confirmDeleteReading(reading.id, reading.book?.title || 'Libro sin título')"
            />
          </div>
          <p v-else class="empty-section-message">No tienes libros en lectura activa.</p>
        </div>
      </main>

      <!-- Columna Secundaria (más estrecha) -->
      <aside class="side-column">
        
        <!-- Actividad Reciente -->
        <div class="content-section">
          <h2 class="section-title">Actividad Reciente</h2>
          <p class="section-description">
            Un vistazo a tus últimas acciones.
          </p>
          <!-- El componente RecentActivities ya tiene su propio estado vacío, así que podemos llamarlo directamente -->
          <RecentActivities />
        </div>

        <!-- Logros Destacados -->
        <div class="content-section">
          <h2 class="section-title">Logros</h2>
          <p class="section-description">
            Tus medallas de lector.
          </p>
          <!-- Si hay logros, muestra la cuadrícula -->
          <div v-if="appStore.achievements.length > 0" class="achievements-grid">
            <AchievementItem
              v-for="achievementId in appStore.achievements"
              :key="achievementId"
              :achievementId="achievementId"
              @click="handleAchievementClick(achievementId)"
            />
          </div>
          <!-- Si no hay logros, muestra un estado vacío -->
          <div v-else class="empty-state-placeholder">
            <span class="material-symbols-outlined icon">military_tech</span>
            <p>Aún no has desbloqueado logros. ¡Sigue leyendo para conseguir el primero!</p>
          </div>
        </div>

      </aside>

    </div>

    <!-- Los modales viven fuera del layout principal, pero deben estar dentro del único nodo raíz -->
    <AchievementModal
        :isOpen="appStore.isAchievementModalOpen"
        :achievement="appStore.latestAchievement"
        @close="appStore.closeAchievementModal"
      />
    <UpdateProgressModal /> <!-- Añadir el modal aquí -->
    
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import RecentActivities from '@/components/RecentActivities.vue'
import AchievementItem from '@/components/AchievementItem.vue'
import AchievementModal from '@/components/AchievementModal.vue'
import KpiCards from '@/components/KpiCards.vue'
import BookCard from '@/components/BookCard.vue' // Importar BookCard
import UpdateProgressModal from '@/components/UpdateProgressModal.vue' // Añadir esta importación
import { useRouter } from 'vue-router'

const appStore = useAppStore()

// Filtrar lecturas activas
const activeBooks = computed(() => {
  return appStore.readings.filter((reading: any) => reading.status !== 'leido' && reading.book) // CORRECCIÓN: Filtrar si reading.book existe
})

const openEditBookModal = (bookId: string) => {
  appStore.openEditBookModal(bookId)
}

const openUpdateProgressModal = (readingId: string) => {
  appStore.openUpdateProgressModal(readingId)
}

const confirmDeleteReading = (readingId: string, title: string) => {
  if (confirm(`¿Estás seguro de eliminar la lectura de "${title}"? Esta acción no se puede deshacer.`)) {
    appStore.deleteReading(readingId)
  }
}

// CORRECCIÓN: Mover la lógica compleja fuera del template
const handleAchievementClick = (achievementId: number) => {
  const definition = appStore.achievementDefinitions.find((def: any) => def.id === achievementId);
  if (definition) {
    appStore.showAchievementModal(definition);
  } else {
    console.warn(`No se encontró la definición para el logro con ID: ${achievementId}`);
  }
};

const router = useRouter()

// Carga de datos si es necesario
onMounted(async () => {
  // Si no hay lecturas, cargar los datos
  if (appStore.readings.length === 0) {
    await appStore.fetchUserReadings()
  }
})
</script>

<style scoped>
/*
 * Estilos específicos para el layout del Dashboard, inspirados en Shadcn.
 */

 .empty-state-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background-color: var(--background);
  color: var(--muted-foreground);
  font-size: 0.875rem;
}

.empty-state-placeholder .icon {
  font-size: 2.5rem;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
}



.dashboard-container {
  padding: 1.5rem; /* rem es mejor para accesibilidad */
}

/* Header de la página */
.dashboard-header {
  margin-bottom: 2rem;
}

.header-title {
  font-size: 2.25rem; /* 36px */
  font-weight: 700;
  letter-spacing: -0.05em; /* Tracking tight */
  color: var(--foreground);
}

.header-subtitle {
  font-size: 1.125rem; /* 18px */
  color: var(--muted-foreground);
  margin-top: 0.5rem;
}

/* Grid principal del layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr; /* Una columna por defecto para móviles */
  gap: 2rem;
}

/* Layout de dos columnas para pantallas más grandes */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 2fr 1fr; /* Columna principal 2/3, lateral 1/3 */
  }
}

/* Columnas del grid */
.main-column, .side-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Contenedores de sección genéricos */
.content-section {
  width: 100%;
}

.section-title {
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
  color: var(--foreground);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
}

.section-description {
  font-size: 0.875rem; /* 14px */
  color: var(--muted-foreground);
  margin-bottom: 1.5rem;
}

/* Grid para libros activos */
.active-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Placeholders de ejemplo (puedes borrarlos) */
.book-placeholder, .activity-placeholder {
  background-color: var(--muted);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  text-align: center;
  color: var(--muted-foreground);
}

.achievements-placeholder {
  display: flex;
  gap: 1rem;
  color: var(--muted-foreground);
  font-size: 2rem;
}

.activity-placeholder {
  text-align: left;
  font-size: 0.875rem;
}
.activity-placeholder p {
  margin-bottom: 0.5rem;
}

/* ESTILOS DEL CARGADOR GLOBAL (Ya no se necesitan) */
.global-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh; /* Ajusta la altura según necesites para esta vista */
  gap: 1rem;
  color: var(--muted-foreground);
}

.loader-icon {
  font-size: 3rem;
  animation: spin 1.5s linear infinite;
}

/* .global-loader, .loader-icon, @keyframes spin - ELIMINADOS */

.empty-section-message {
  color: var(--muted-foreground);
  font-size: 0.95rem;
  text-align: center;
  padding: 2rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
}

</style>