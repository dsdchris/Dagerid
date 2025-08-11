<template>
    <div class="kpi-container">
      <!-- KPI 1: Páginas Leídas -->
      <div class="kpi-card">
        <div class="card-header">
          <h3 class="card-title">Páginas Leídas</h3>
          <span class="material-symbols-outlined card-icon">auto_stories</span>
        </div>
        <div class="card-content">
          <p class="card-value">{{ weeklyStats.pagesRead }}</p>
          <p class="card-description">en los últimos 7 días</p>
        </div>
      </div>
  
      <!-- KPI 2: Libros Terminados -->
      <div class="kpi-card">
        <div class="card-header">
          <h3 class="card-title">Libros Terminados</h3>
          <span class="material-symbols-outlined card-icon">library_books</span>
        </div>
        <div class="card-content">
          <p class="card-value">{{ weeklyStats.booksFinished }}</p>
          <p class="card-description">en los últimos 7 días</p>
        </div>
      </div>
  
      <!-- KPI 3: Racha de Lectura -->
      <div class="kpi-card">
        <div class="card-header">
          <h3 class="card-title">Racha Actual</h3>
          <span class="material-symbols-outlined card-icon">local_fire_department</span>
        </div>
        <div class="card-content">
          <p class="card-value">{{ weeklyStats.currentStreak }}</p>
          <p class="card-description">días consecutivos</p>
        </div>
      </div>
  
      <!-- KPI 4: Progreso de Meta -->
      <div class="kpi-card">
        <div class="card-header">
          <h3 class="card-title">Meta Anual</h3>
          <span class="material-symbols-outlined card-icon">track_changes</span>
        </div>
        <div class="card-content">
          <p class="card-value">{{ weeklyStats.readingGoalProgress }}<span class="value-unit">%</span></p>
          <p class="card-description">de tu objetivo de lectura</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useAppStore } from '@/stores/appStore';
  import { computed } from 'vue';
  
  const appStore = useAppStore();
  // Hacemos el `computed` local para mayor encapsulación, aunque es opcional.
  const weeklyStats = computed(() => appStore.weeklyStats);
  </script>
  
  <style scoped>
  /*
   * Estilos inspirados en la estética de Shadcn/ui: minimalismo, espacio y tipografía.
   * Usamos variables CSS para que sea fácil de adaptar a temas claro/oscuro.
   */
  
  /* Definición de variables de color (puedes moverlas a tu :root en un archivo CSS global) */
  :root {
    --background: hsl(0 0% 100%);
    --foreground: hsl(0 0% 3.9%);
    --card: hsl(0 0% 100%);
    --card-foreground: hsl(0 0% 3.9%);
    --muted-foreground: hsl(0 0% 45.1%);
    --border: hsl(0 0% 89.8%);
  }
  
  .dark {
    --background: hsl(0 0% 3.9%);
    --foreground: hsl(0 0% 98%);
    --card: hsl(0 0% 3.9%);
    --card-foreground: hsl(0 0% 98%);
    --muted-foreground: hsl(0 0% 63.9%);
    --border: hsl(0 0% 14.9%);
  }
  
  /* Contenedor principal */
  .kpi-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
    width: 100%;
  }
  
  /* Tarjeta KPI individual */
  .kpi-card {
    background-color: var(--card);
    color: var(--card-foreground);
    border: 1px solid var(--border);
    border-radius: 0.75rem; /* Bordes sutilmente redondeados */
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: box-shadow 0.2s ease-in-out;
  }
  
  /* Header de la tarjeta (Título e Icono) */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .card-title {
    font-size: 0.875rem; /* 14px */
    font-weight: 500;
    color: var(--foreground);
    margin: 0;
  }
  
  .card-icon {
    font-size: 1.25rem; /* 20px */
    color: var(--muted-foreground);
  }
  
  /* Contenido principal de la tarjeta (Valor y Descripción) */
  .card-content {
    display: flex;
    flex-direction: column;
  }
  
  .card-value {
    font-size: 2.25rem; /* 36px */
    font-weight: 700;
    letter-spacing: -0.05em; /* Tracking tight */
    color: var(--foreground);
    margin: 0;
    line-height: 1;
  }
  
  .value-unit {
    font-size: 1.5rem;
    color: var(--muted-foreground);
    margin-left: 0.2rem;
  }
  
  .card-description {
    font-size: 0.75rem; /* 12px */
    color: var(--muted-foreground);
    margin: 0.25rem 0 0 0;
  }
  </style>