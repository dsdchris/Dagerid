<template>
  <!-- El componente entero es una 'tarjeta' -->
  <div class="card-container">
    
    <!-- Contenido de la tarjeta -->
    <div class="card-content">
      <ul v-if="appStore.recentActivities.length > 0" class="activities-list">
        <li v-for="(activity, index) in appStore.recentActivities" :key="`activity-${index}-${activity.created_at}`" class="activity-item">
          <!-- Icono para cada tipo de actividad (opcional pero muy visual) -->
          <div class="activity-icon-wrapper">
            <span class="material-symbols-outlined activity-icon">
              {{ getActivityIcon(activity.text) }}
            </span>
          </div>
          <!-- Texto de la actividad -->
          <div class="activity-text">
            <p class="text-main">{{ getActivityText(activity.text) }}</p>
            <p class="text-meta">{{ formatRelativeTime(activity.created_at) }}</p>
          </div>
        </li>
      </ul>
      
      <!-- Mensaje cuando no hay actividades -->
      <div v-else class="empty-state">
        <span class="material-symbols-outlined empty-icon">history</span>
        <p class="empty-title">Sin actividad reciente</p>
        <p class="empty-description">Empieza a añadir libros o a leer para ver tu progreso aquí.</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/appStore';

const appStore = useAppStore();

// --- Lógica de Ayuda para mejorar la visualización ---

/**
 * Devuelve un icono de Material Symbols basado en el texto de la actividad.
 * @param text El texto de la actividad.
 */
function getActivityIcon(text: string | undefined): string {
  if (!text) return 'history_toggle_off'; // Valor por defecto si text es undefined
  const lowerText = text.toLowerCase();
  if (lowerText.includes('añadiste')) return 'add_circle';
  if (lowerText.includes('terminaste')) return 'check_circle';
  if (lowerText.includes('actualizaste')) return 'sync';
  if (lowerText.includes('desbloqueado')) return 'emoji_events';
  if (lowerText.includes('eliminaste')) return 'delete';
  return 'history_toggle_off'; // Icono por defecto
}

/**
 * Devuelve el texto principal de la actividad (sin prefijos si los hubiera).
 * Esta función es un placeholder, puedes adaptarla si tu texto es más complejo.
 * @param text El texto completo de la actividad.
 */
function getActivityText(text: string | undefined): string {
  // Por ahora, devolvemos el texto tal cual, con validación de seguridad.
  return text || 'Actividad sin descripción';
}

/**
 * Formatea una fecha ISO a un formato de tiempo relativo (ej. "hace 5 minutos").
 * Para una implementación real, se recomienda una librería como `date-fns` o `day.js`.
 * Esta es una versión simplificada.
 * @param isoDateString La fecha en formato ISO.
 */
function formatRelativeTime(isoDateString: string): string {
  const date = new Date(isoDateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `hace ${seconds} seg`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} días`;
}

</script>

<style scoped>
/*
 * Estilos para la tarjeta de Actividad Reciente, siguiendo la estética de Shadcn/ui.
 */

/* .card-container {
  background-color: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
}
 */
/* Header de la tarjeta */
.card-header {
  padding-bottom: 1rem;
}

.card-title {
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.card-description {
  font-size: 0.875rem; /* 14px */
  color: var(--muted-foreground);
}

/* Contenido de la tarjeta */
.card-content {
  /* No necesita estilos directos, el contenido interior se estiliza */
}

/* Lista de Actividades */
.activities-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.activity-icon-wrapper {
  background-color: var(--muted);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon {
  font-size: 1.25rem; /* 20px */
  color: var(--muted-foreground);
}

.activity-text {
  display: flex;
  flex-direction: column;
}

.text-main {
  font-size: 0.875rem; /* 14px */
  font-weight: 500;
  color: var(--foreground);
}

.text-meta {
  font-size: 0.75rem; /* 12px */
  color: var(--muted-foreground);
}

/* Estado Vacío (cuando no hay actividades) */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background-color: var(--background);
}

.empty-icon {
  font-size: 2.5rem; /* 40px */
  color: var(--muted-foreground);
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1rem; /* 16px */
  font-weight: 500;
  color: var(--foreground);
  margin-bottom: 0.25rem;
}

.empty-description {
  font-size: 0.875rem; /* 14px */
  color: var(--muted-foreground);
  max-width: 300px;
}
</style>