<template>
  <div class="page-container">
    <!-- 1. Header de la Página -->
    <header class="page-header">
      <div>
        <h1 class="page-title">Estadísticas</h1>
        <p class="page-subtitle">Tu progreso de lectura en un vistazo.</p>
      </div>
    </header>

    <!-- 2. Grid Principal (Contenido) -->
    <div class="stats-main-grid">
      
      <!-- Columna Principal -->
      <main class="main-column">
        <!-- Tarjetas de KPIs -->
        <div class="content-section">
          <div class="kpi-grid">
            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-label">Libros Leídos</span>
                <span class="material-symbols-outlined stat-icon">auto_stories</span>
              </div>
              <p class="stat-value">{{ booksReadCount }}</p>
            </div>
            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-label">Páginas Leídas</span>
                <span class="material-symbols-outlined stat-icon">menu_book</span>
              </div>
              <p class="stat-value">{{ totalPagesRead }}</p>
            </div>
            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-label">Promedio por Libro</span>
                <span class="material-symbols-outlined stat-icon">timer</span>
              </div>
              <p class="stat-value">{{ averageDays }} <span class="stat-unit">días</span></p>
            </div>
            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-label">Racha Actual</span>
                <span class="material-symbols-outlined stat-icon">local_fire_department</span>
              </div>
              <p class="stat-value">{{ appStore.readingStreak }} <span class="stat-unit">días</span></p>
            </div>
          </div>
        </div>

        <!-- Gráfico de Actividad de Lectura -->
        <div class="content-section">
          <h2 class="section-title">Actividad de Lectura</h2>
          <p class="section-description">Progreso de lectura en los últimos 7 días.</p>
          <div class="bar-chart">
            <div v-for="day in weeklyReadingActivity" :key="day.date" class="bar-wrapper">
              <div class="bar-item">
                <div 
                  class="bar-fill" 
                  :style="{ height: `${(day.progress / maxProgressInWeek) * 100}%` }"
                  :title="`${day.progress}% de progreso`"
                ></div>
              </div>
              <span class="bar-label">{{ formatDateLabel(day.date) }}</span>
            </div>
          </div>
        </div>

        <!-- Distribución por Estado -->
        <div class="content-section">
          <h2 class="section-title">Estado de tus Libros</h2>
          <p class="section-description">Distribución de tus lecturas por estado.</p>
          <div class="status-distribution">
            <div class="status-item">
              <div class="status-bar">
                <div class="status-fill status-reading" :style="{ width: `${getStatusPercentage('leyendo')}%` }"></div>
              </div>
              <div class="status-info">
                <span class="status-label">Leyendo</span>
                <span class="status-count">{{ getStatusCount('leyendo') }}</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar">
                <div class="status-fill status-to-read" :style="{ width: `${getStatusPercentage('por_leer')}%` }"></div>
              </div>
              <div class="status-info">
                <span class="status-label">Por Leer</span>
                <span class="status-count">{{ getStatusCount('por_leer') }}</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar">
                <div class="status-fill status-finished" :style="{ width: `${getStatusPercentage('leido')}%` }"></div>
              </div>
              <div class="status-info">
                <span class="status-label">Leídos</span>
                <span class="status-count">{{ getStatusCount('leido') }}</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar">
                <div class="status-fill status-abandoned" :style="{ width: `${getStatusPercentage('abandonado')}%` }"></div>
              </div>
              <div class="status-info">
                <span class="status-label">Abandonados</span>
                <span class="status-count">{{ getStatusCount('abandonado') }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Columna Lateral -->
      <aside class="side-column">
        <div class="content-section">
          <h2 class="section-title">Finalizados Recientemente</h2>
          <p class="section-description">Tus últimas lecturas completadas.</p>
          <div v-if="recentFinishedBooks.length > 0" class="recent-books-list">
            <BookListItem v-for="reading in recentFinishedBooks" :key="reading.id" :reading="reading" />
          </div>
          <div v-else class="empty-state-placeholder">
            <span class="material-symbols-outlined icon">hourglass_empty</span>
            <p>Aún no has terminado ningún libro.</p>
          </div>
        </div>

        <!-- Logros Recientes -->
        <div class="content-section">
          <h2 class="section-title">Logros Recientes</h2>
          <p class="section-description">Tus últimos logros desbloqueados.</p>
          <div v-if="recentAchievements.length > 0" class="achievements-list">
            <div v-for="achievement in recentAchievements" :key="achievement.id" class="achievement-item">
              <div class="achievement-icon">
                <span class="material-symbols-outlined">{{ achievement.icon || 'emoji_events' }}</span>
              </div>
              <div class="achievement-info">
                <h4 class="achievement-name">{{ achievement.name }}</h4>
                <p class="achievement-description">{{ achievement.description }}</p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state-placeholder">
            <span class="material-symbols-outlined icon">military_tech</span>
            <p>¡Empieza a leer para desbloquear logros!</p>
          </div>
        </div>
      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import BookListItem from '@/components/BookListItem.vue'

const appStore = useAppStore()

// Cálculo dinámico de estadísticas basado en lecturas reales
const booksReadCount = computed(() => {
  return appStore.readings.filter((reading: any) => reading.status === 'leido').length
})

const totalPagesRead = computed(() => {
  return appStore.readings.reduce((total: number, reading: any) => {
    if (reading.status === 'leido' && reading.book?.page_count) {
      return total + reading.book.page_count
    }
    // Si está leyendo, agregar páginas leídas hasta ahora
    if (reading.status === 'leyendo' && reading.currentPage) {
      return total + reading.currentPage
    }
    return total
  }, 0)
})

const averageDays = computed(() => {
  const finishedBooks = appStore.readings.filter((reading: any) => 
    reading.status === 'leido' && reading.start_date && reading.finish_date
  )
  
  if (finishedBooks.length === 0) return '0'
  
  const totalDays = finishedBooks.reduce((total: number, reading: any) => {
    const start = new Date(reading.start_date)
    const finish = new Date(reading.finish_date)
    const days = Math.ceil((finish.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return total + days
  }, 0)
  
  return (totalDays / finishedBooks.length).toFixed(1)
})

const recentFinishedBooks = computed(() => {
  return appStore.readings
    .filter((reading: any) => reading.status === 'leido' && reading.finish_date)
    .sort((a: any, b: any) => new Date(b.finish_date).getTime() - new Date(a.finish_date).getTime())
    .slice(0, 5)
})

const recentAchievements = computed(() => {
  return appStore.achievementDefinitions
    .filter((def: any) => appStore.achievements.includes(def.id))
    .slice(0, 3)
})

// Actividad semanal basada en actualizaciones de progreso
const weeklyReadingActivity = computed(() => {
  const last7Days = getLastNDays(7)
  
  return last7Days.map(date => {
    let dailyProgress = 0
    
    // Calcular progreso basado en actualizaciones de ese día
    Object.values(appStore.progressLogs).forEach((logs: any) => {
      const dayLogs = logs.filter((log: any) => log.date === date)
      
      if (dayLogs.length > 0) {
        // Calcular el progreso real: diferencia entre min y max página del día
        const pages = dayLogs.map((log: any) => log.page)
        const minPage = Math.min(...pages)
        const maxPage = Math.max(...pages)
        const pagesReadInDay = maxPage - minPage
        dailyProgress += pagesReadInDay
      }
    })
    
    return {
      date,
      progress: dailyProgress
    }
  })
})

const maxProgressInWeek = computed(() => {
  const progress = weeklyReadingActivity.value.map(d => d.progress)
  const max = Math.max(...progress)
  return max > 0 ? max : 50
})

// Funciones para distribución por estado
const getStatusCount = (status: string) => {
  return appStore.readings.filter((reading: any) => reading.status === status).length
}

const getStatusPercentage = (status: string) => {
  const total = appStore.readings.length
  if (total === 0) return 0
  return (getStatusCount(status) / total) * 100
}

function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()
}

function formatDateLabel(dateString: string): string {
  const date = new Date(dateString)
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return days[date.getUTCDay()]
}

// Cargar datos al montar el componente
onMounted(async () => {
  if (appStore.readings.length === 0) {
    await appStore.fetchInitialData()
  }
})
</script>

<style scoped>
/* ========================================= */
/*  ESTILOS BASE (copiados de otras vistas)  */
/* ========================================= */
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.05em;
  color: var(--foreground);
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--muted-foreground);
  margin-top: 0.25rem;
}

/* ========================================= */
/*  GRID Y SECCIONES (como en Dashboard)     */
/* ========================================= */
.stats-main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .stats-main-grid {
    grid-template-columns: 2fr 1fr;
  }
}

.main-column, .side-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-section {
  width: 100%;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--foreground);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
}

.section-description {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-bottom: 1.5rem;
}

/* ========================================= */
/*  NUEVOS ESTILOS PARA ESTADÍSTICAS         */
/* ========================================= */

/* Grid para los KPIs principales */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Tarjeta de estadística individual */
.stat-card {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted-foreground);
}

.stat-icon {
  color: var(--muted-foreground);
  font-size: 1.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--foreground);
  letter-spacing: -0.05em;
}

.stat-unit {
  font-size: 1rem;
  font-weight: 500;
  color: var(--muted-foreground);
  margin-left: 0.25rem;
}


/* Gráfico de barras simple */
.bar-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.75rem;
  height: 150px; /* Altura fija para el contenedor del gráfico */
  padding: 1rem 0;
  width: 100%;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
}

.bar-item {
  width: 100%;
  height: 120px; /* Altura fija en píxeles para que los porcentajes funcionen */
  background-color: var(--muted);
  border-radius: calc(var(--radius) / 2);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  width: 100%;
  background-color: var(--primary);
  border-radius: calc(var(--radius) / 2);
  transition: height 0.5s ease-out;
  min-height: 2px; /* Altura mínima para barras con poco progreso */
}
.bar-fill:hover {
  opacity: 0.8;
}

.bar-label {
  font-size: 0.75rem;
  color: var(--muted-foreground);
  font-weight: 500;
}

/* Lista de libros recientes */
.recent-books-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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

/* Distribución por Estado */
.status-distribution {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-bar {
  width: 100%;
  height: 10px;
  background-color: var(--muted);
  border-radius: 5px;
  overflow: hidden;
  flex-grow: 1;
}

.status-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease-out;
}

.status-reading {
  background-color: var(--primary);
}

.status-to-read {
  background-color: var(--info);
}

.status-finished {
  background-color: var(--success);
}

.status-abandoned {
  background-color: var(--warning);
}

.status-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted-foreground);
}

.status-count {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--foreground);
}

/* Logros Recientes */
.achievements-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
}

.achievement-icon {
  background-color: var(--muted);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-icon .material-symbols-outlined {
  font-size: 2rem;
  color: var(--primary);
}

.achievement-info {
  flex-grow: 1;
}

.achievement-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 0.25rem;
}

.achievement-description {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}
</style>