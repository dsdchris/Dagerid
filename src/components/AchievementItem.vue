<template>
  <div :class="['achievement-item', { 'achievement-item--unlocked': unlocked, 'achievement-item--locked': !unlocked }]">
    <!-- Usar un icono de Material Symbols en lugar de una imagen -->
    <span class="material-symbols-outlined achievement-icon">military_tech</span>
    <span class="achievement-name">{{ achievement.name }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  achievement: {
    type: Object,
    required: true,
    default: () => ({})
  },
  unlocked: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.achievement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem; /* p-6 */
  border-radius: 0.75rem; /* Más redondeado */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); /* Sombra sutil */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.achievement-item:hover {
  transform: translateY(-3px); /* Pequeño efecto hover */
  box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 4px 6px -3px rgba(0, 0, 0, 0.04); /* Sombra más pronunciada al hover */
}

.achievement-item--unlocked {
  background-color: var(--color-green-light); /* Un verde más claro para el fondo */
}

.achievement-item--locked {
  background-color: var(--color-gray-light); /* bg-gray-200 */
  opacity: 0.7; /* Menos opaco para el estado bloqueado */
  filter: grayscale(80%); /* Efecto de escala de grises para bloqueado */
}

.achievement-icon {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 48;
  font-size: 5rem;
  color: var(--color-green-primary); /* Color principal para iconos desbloqueados */
  margin-bottom: 0.75rem; /* mb-3 */
}

/* Estilo para iconos bloqueados */
.achievement-item--locked .achievement-icon {
  color: var(--color-text-secondary); /* Color gris para el icono bloqueado */
  font-variation-settings:
    'FILL' 0; /* Asegurarse de que no esté relleno si está bloqueado */
}

.achievement-name {
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
  font-size: 1rem;
}
</style> 