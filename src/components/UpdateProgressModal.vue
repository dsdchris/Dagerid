<template>
  <Teleport to="body">
    <div v-if="appStore.isUpdateProgressModalOpen && reading" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content" @click.stop>
        
        <!-- Header con Información del Libro -->
        <header class="modal-header">
          <div class="header-info">
            <h2 class="modal-title">{{ reading.book.title }}</h2>
            <p class="modal-author">{{ reading.book.author }}</p>
          </div>
          <button class="close-button" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <!-- Contenido Principal con Dos Columnas -->
        <div class="modal-body">
          
          <!-- Columna Izquierda: Portada y Progreso Actual -->
          <div class="left-column">
            <div class="book-cover-section">
              <img 
                :src="reading.book.cover_image_url || 'https://via.placeholder.com/200x300?text=Libro'" 
                :alt="reading.book.title"
                class="book-cover-large"
              />
              <div class="progress-overview">
                <div class="progress-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--muted)" stroke-width="8"/>
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="var(--primary)" 
                      stroke-width="8"
                      :stroke-dasharray="`${progressPercentage * 2.83} 283`"
                      stroke-dashoffset="0"
                      stroke-linecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div class="progress-text">
                    <span class="percentage">{{ Math.round(progressPercentage) }}%</span>
                    <span class="label">completado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Actualizar Progreso e Historial -->
          <div class="right-column">
            
            <!-- Sección de Actualización -->
            <section class="update-section">
              <h3 class="section-title">Actualizar Progreso</h3>
              <form @submit.prevent="submitProgressUpdate" class="progress-form">
                <div class="page-input-group">
                  <label class="input-label">Página actual</label>
                  <div class="page-input-wrapper">
                    <input 
                      type="number" 
                      v-model.number="currentPageInput" 
                      min="0" 
                      :max="reading.book.page_count" 
                      class="page-input"
                      @input="handlePageInput"
                    />
                    <span class="page-total">de {{ reading.book.page_count }}</span>
                  </div>
                  <div class="progress-bar-preview">
                    <div class="progress-bar-bg">
                      <div 
                        class="progress-bar-fill" 
                        :style="{ width: `${previewPercentage}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
                <p v-if="showError" class="error-message">{{ errorMessage }}</p>
                <button type="submit" class="save-button" :disabled="!hasChanges">
                  <span class="material-symbols-outlined">save</span>
                  Guardar Progreso
                </button>
              </form>
            </section>

            <!-- Sección de Historial -->
            <section class="history-section">
              <h3 class="section-title">Historial de Lectura</h3>
              <div v-if="isLoadingHistory" class="loading-history">
                <span class="material-symbols-outlined spinning">progress_activity</span>
                <p>Cargando historial...</p>
              </div>
              <div v-else-if="progressHistory.length > 0" class="history-list">
                <div v-for="(entry, index) in progressHistory" :key="entry.id" class="history-entry">
                  <div class="entry-date">{{ formatDate(entry.created_at) }}</div>
                  <div class="entry-info">
                    <span class="pages">Página {{ entry.pages_read }}</span>
                    <span class="progress-change" v-if="index > 0">
                      (+{{ entry.pages_read - progressHistory[index - 1].pages_read }} páginas)
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-history">
                <span class="material-symbols-outlined">history_toggle_off</span>
                <p>Aún no hay registros de progreso</p>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { supabase } from '@/lib/supabaseClient'

const appStore = useAppStore()
const currentPageInput = ref(0)
const showError = ref(false)
const errorMessage = ref('')
const progressHistory = ref<any[]>([])
const isLoadingHistory = ref(false)

// Obtenemos la lectura actual
const reading = computed(() => {
  if (!appStore.currentReadingIdForProgress) return null;
  return appStore.readings.find(r => r.id === appStore.currentReadingIdForProgress);
});

// Progreso actual como porcentaje
const progressPercentage = computed(() => {
  if (!reading.value?.book?.page_count) return 0;
  const current = reading.value.currentPage || 0;
  return Math.min((current / reading.value.book.page_count) * 100, 100);
});

// Vista previa del porcentaje basado en el input
const previewPercentage = computed(() => {
  if (!reading.value?.book?.page_count) return 0;
  return Math.min((currentPageInput.value / reading.value.book.page_count) * 100, 100);
});

// Detectar si hay cambios
const hasChanges = computed(() => {
  return reading.value && currentPageInput.value !== (reading.value.currentPage || 0);
});

// Manejar input de página
const handlePageInput = () => {
  showError.value = false;
};

// Cargar historial de progreso
const loadProgressHistory = async () => {
  if (!reading.value) {
    console.log('❌ No hay reading.value disponible')
    return;
  }
  
  console.log('🔍 Cargando historial para reading:', reading.value.id)
  isLoadingHistory.value = true;
  try {
    const { data, error } = await supabase
      .from('progress_updates')
      .select('*')
      .eq('reading_id', reading.value.id)
      .order('created_at', { ascending: false }) // CORRECCIÓN: Usar created_at que es el campo real
      .limit(10);

    if (error) {
      console.error('❌ Error en la consulta de historial:', error)
      throw error;
    }
    
    console.log('✅ Historial cargado:', data)
    progressHistory.value = data || [];
  } catch (error) {
    console.error('❌ Error al cargar historial:', error);
  } finally {
    isLoadingHistory.value = false;
  }
};

// Formatear fecha
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
};

// Observar cuando el modal se abre
watch(() => appStore.isUpdateProgressModalOpen, async (isOpen) => {
  console.log('🔍 Modal abierto:', isOpen, 'Reading ID:', appStore.currentReadingIdForProgress)
  
  if (isOpen && reading.value) {
    console.log('✅ Reading encontrado:', reading.value.book.title)
    currentPageInput.value = reading.value.currentPage || 0;
    showError.value = false;
    progressHistory.value = [];
    
    // Cargar historial
    await loadProgressHistory();
  } else if (isOpen && !reading.value) {
    console.log('❌ Modal abierto pero no se encontró reading. Readings disponibles:', appStore.readings.length)
  }
});

// Enviar actualización
const submitProgressUpdate = async () => {
  if (!reading.value || !hasChanges.value) return;
  const newPage = currentPageInput.value;

  if (newPage < 0 || newPage > reading.value.book.page_count) {
    showError.value = true;
    errorMessage.value = 'El número de página debe estar entre 0 y ' + reading.value.book.page_count;
    return;
  }
  
  showError.value = false;
  
  try {
    await appStore.updateReadingProgress(reading.value.id, newPage);
    // Recargar historial después de guardar
    await loadProgressHistory();
    // Cerrar modal
    closeModal();
  } catch (error) {
    showError.value = true;
    errorMessage.value = 'Error al guardar el progreso. Intenta de nuevo.';
  }
};

const closeModal = () => {
  appStore.closeUpdateProgressModal();
};
</script>

<style scoped>
/* Animaciones */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-zoom-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-zoom-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.modal-zoom-enter-from {
  opacity: 0;
  transform: scale(0.7) translateY(20px);
}

.modal-zoom-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

/* Layout Base */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
  padding: 1rem;
}

.modal-content {
  background-color: var(--card);
  color: var(--card-foreground);
  border-radius: 1rem;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 10000;
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.header-info {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.modal-author {
  color: var(--muted-foreground);
  font-size: 1rem;
}

.close-button {
  background: transparent;
  border: none;
  color: var(--muted-foreground);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: all 0.2s;
}

.close-button:hover {
  background: var(--muted);
  color: var(--foreground);
}

/* Body Layout */
.modal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-column {
  width: 300px;
  padding: 2rem;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.right-column {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Portada y Progreso Circular */
.book-cover-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.book-cover-large {
  width: 180px;
  height: 270px;
  object-fit: cover;
  border-radius: var(--radius);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.progress-overview {
  text-align: center;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary);
}

.label {
  display: block;
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

/* Secciones */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--foreground);
}

.update-section {
  margin-bottom: 2.5rem;
}

/* Formulario de Progreso */
.progress-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted-foreground);
}

.page-input-wrapper {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.page-input {
  width: 100px;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background-color: var(--input);
  color: var(--foreground);
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s;
}

.page-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--ring);
}

.page-total {
  font-size: 1rem;
  color: var(--muted-foreground);
}

.progress-bar-preview {
  margin-top: 0.5rem;
}

.progress-bar-bg {
  height: 8px;
  background-color: var(--muted);
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--primary);
  transition: width 0.4s ease-out;
}

.error-message {
  font-size: 0.875rem;
  color: var(--destructive);
}

.save-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary);
  color: var(--primary-foreground);
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button:hover:not(:disabled) {
  opacity: 0.9;
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Historial */
.history-section {
  border-top: 1px solid var(--border);
  padding-top: 2rem;
}

.loading-history,
.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--muted-foreground);
  text-align: center;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-entry {
  padding: 0.75rem;
  background-color: var(--muted);
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entry-date {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground);
}

.entry-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pages {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.progress-change {
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
  }
  
  .modal-body {
    flex-direction: column;
  }
  
  .left-column {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding: 1.5rem;
  }
  
  .book-cover-section {
    flex-direction: row;
    gap: 1.5rem;
  }
  
  .book-cover-large {
    width: 100px;
    height: 150px;
  }
  
  .right-column {
    padding: 1.5rem;
  }
}
</style> 