<template>
  <div :class="['user-avatar', sizeClass]">
    <img 
      v-if="avatarUrl" 
      :src="avatarUrl" 
      :alt="alt"
      class="avatar-image"
      @error="handleImageError"
    />
    <div v-else class="avatar-placeholder">
      <span class="material-symbols-outlined">person</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  avatarUrl?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: null,
  alt: 'Avatar del usuario',
  size: 'md'
})

const imageError = ref(false)

const sizeClass = computed(() => `avatar-${props.size}`)

function handleImageError() {
  imageError.value = true
}
</script>

<style scoped>
.user-avatar {
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border);
  background-color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--muted);
  color: var(--muted-foreground);
}

/* Tamaños */
.avatar-sm {
  width: 32px;
  height: 32px;
}

.avatar-sm .material-symbols-outlined {
  font-size: 1.2rem;
}

.avatar-md {
  width: 40px;
  height: 40px;
}

.avatar-md .material-symbols-outlined {
  font-size: 1.5rem;
}

.avatar-lg {
  width: 64px;
  height: 64px;
}

.avatar-lg .material-symbols-outlined {
  font-size: 2rem;
}

.avatar-xl {
  width: 120px;
  height: 120px;
}

.avatar-xl .material-symbols-outlined {
  font-size: 3rem;
}
</style> 