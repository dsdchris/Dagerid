<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import TopNavBar from '@/components/TopNavBar.vue';
// @ts-ignore
import { useAuth } from '@/composables/useAuth';
import { useAppStore } from '@/stores/appStore';
import { watch } from 'vue';

const { userSession } = useAuth();
const appStore = useAppStore();
const route = useRoute();

// Este watcher sigue siendo el punto de entrada para cargar los datos.
// Solo se activa cuando el usuario cambia de null a un valor (login)
// o de un valor a null (logout).
watch(userSession, async (newSession, oldSession) => {
  if (newSession && !oldSession) {
    // Usuario acaba de iniciar sesión
    await appStore.fetchInitialData()
  } else if (!newSession && oldSession) {
    // Usuario acaba de cerrar sesión
    // El store ya limpia los datos en signOut()
  }
})

// El watcher del modo oscuro está bien.
watch(() => appStore.darkMode, (isDark) => {
  document.documentElement.classList.toggle('dark', isDark)
}, { immediate: true })
</script>

<template>
  <div id="app">
    <!-- Loading global - Solo mostrar si no estamos en login -->
    <div v-show="appStore.isLoading && route.name !== 'login'" class="loading-container">
    <span class="material-symbols-outlined loader-icon">hourglass_top</span>
      <p>Cargando...</p>
    </div>
    
    <!-- Contenido principal - Siempre mostrar en login, o cuando no esté cargando -->
    <div v-show="!appStore.isLoading || route.name === 'login'" class="app-content">
      <TopNavBar v-if="userSession" />
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
      </RouterView>
   
    </div>
  </div>
</template>

<style scoped>
#app {
  min-height: 100dvh;
  position: relative;
}

.app-content {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* Ocupa el espacio de la vista donde se coloca */
  min-height: 70vh; 
  gap: 1.5rem;
  color: var(--muted-foreground);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid var(--border);
  border-bottom-color: var(--primary, hsl(222.2 47.4% 11.2%)); /* Usa el color primario para la parte que gira */
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

.loader-icon {
  font-size: 3rem;
  animation: spin 1.5s linear infinite;
}


@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}


@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>