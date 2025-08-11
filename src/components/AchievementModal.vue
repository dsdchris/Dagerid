<template>
  <div v-if="appStore.isAchievementModalOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="achievement-icon">
        <span class="material-symbols-outlined">{{ appStore.latestAchievement?.icon || 'emoji_events' }}</span>
      </div>
      <h2 class="modal-title">¡Felicidades!</h2>
      <p class="achievement-text">Has desbloqueado: <span class="achievement-name-highlight">{{ appStore.latestAchievement?.name }}</span></p>
      <p class="achievement-description">{{ appStore.latestAchievement?.description }}</p>
      <button @click="appStore.closeAchievementModal()" class="close-button-main">Cerrar</button>
      <button class="close-button-alt" @click="appStore.closeAchievementModal()">&times;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 91.666667%;
  max-width: 400px;
  padding: 2rem;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.achievement-icon {
  background-color: var(--primary);
  border-radius: 50%;
  width: 6rem;
  height: 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.achievement-icon .material-symbols-outlined {
  font-size: 3rem;
  color: var(--primary-foreground);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--foreground);
  margin-bottom: 0.25rem;
}

.achievement-text {
  font-size: 1rem;
  color: var(--foreground);
  margin-bottom: 0.5rem;
}

.achievement-name-highlight {
  font-weight: 600;
  color: var(--primary);
}

.achievement-description {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-bottom: 1rem;
}

.close-button-main {
  padding: 0.75rem 1.25rem;
  background-color: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius);
  cursor: pointer;
  transition: opacity 0.2s ease;
  font-weight: 600;
  border: none;
  margin-top: 1rem;
}

.close-button-main:hover {
  opacity: 0.9;
}

.close-button-alt {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: var(--muted-foreground);
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
}

.close-button-alt:hover {
  color: var(--foreground);
}
</style> 