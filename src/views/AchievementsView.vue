<template>
  <section id="logros" class="achievements-section">
    <h1 class="achievements-title">Mis Logros</h1>
    <div class="achievements-grid">
      <AchievementItem
        v-for="achievement in appStore.achievementDefinitions"
        :key="achievement.id"
        :achievement="achievement"
        :unlocked="appStore.achievements.includes(achievement.id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/appStore'
import AchievementItem from '@/components/AchievementItem.vue'

const appStore = useAppStore()
</script>

<style scoped>
.achievements-section {
  margin-top: 2rem; /* space-y-8 */
  display: flex;
  flex-direction: column;
  gap: 2rem; /* Espaciado entre secciones */
}

.achievements-title {
  font-size: 1.75rem; /* text-3xl */
  font-weight: 700; /* font-bold */
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* Más flexible */
  gap: 1.5rem; /* gap-6 */
}

@media (min-width: 768px) {
  .achievements-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style> 