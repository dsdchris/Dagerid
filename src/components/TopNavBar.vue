<template>
    <header class="app-header">
      <nav class="main-nav">
        <!-- Logo y Navegación de Escritorio -->
        <div class="nav-left">
          <RouterLink to="/" class="brand-logo">
            <span class="material-symbols-outlined brand-icon">auto_stories</span>
            <span class="brand-name">Dagerid</span>
          </RouterLink>
          <ul class="desktop-menu">
            <li><RouterLink to="/" class="nav-link">Dashboard</RouterLink></li>
            <li><RouterLink to="/libros" class="nav-link">Mis Libros</RouterLink></li>
            <li><RouterLink to="/estadisticas" class="nav-link">Estadísticas</RouterLink></li>
          </ul>
        </div>
  
        <!-- Controles de Usuario y Menú Móvil -->
        <div class="nav-right">
          <div class="desktop-user-menu">
            <UserAvatar 
              :avatarUrl="appStore.userProfile.avatar_url" 
              size="sm"
              alt="Tu avatar"
            />
            <RouterLink to="/perfil" class="nav-link">Perfil</RouterLink>
            <button @click="handleLogout" class="logout-button">Cerrar Sesión</button>
          </div>
          <button class="mobile-menu-toggle" @click="toggleMobileMenu">
            <span v-if="!isMobileMenuOpen" class="material-symbols-outlined">menu</span>
            <span v-else class="material-symbols-outlined">close</span>
          </button>
        </div>
      </nav>
      
      <!-- Menú Desplegable Móvil -->
      <transition name="slide-fade">
        <div v-if="isMobileMenuOpen" class="mobile-menu">
          <ul class="mobile-menu-links">
            <li><RouterLink to="/" @click="closeMobileMenu" class="mobile-nav-link">Dashboard</RouterLink></li>
            <li><RouterLink to="/libros" @click="closeMobileMenu" class="mobile-nav-link">Mis Libros</RouterLink></li>
            <li><RouterLink to="/estadisticas" @click="closeMobileMenu" class="mobile-nav-link">Estadísticas</RouterLink></li>
            <li><hr class="menu-divider"></li>
            <li><RouterLink to="/perfil" @click="closeMobileMenu" class="mobile-nav-link">Perfil</RouterLink></li>
            <li><button @click="handleLogoutAndCloseMenu" class="mobile-nav-link logout-button">Cerrar Sesión</button></li>
          </ul>
        </div>
      </transition>
    </header>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { RouterLink } from 'vue-router';
  import { useAuth } from '@/composables/useAuth';
  import { useAppStore } from '@/stores/appStore';
  import UserAvatar from '@/components/UserAvatar.vue';
  
  const { handleLogout } = useAuth();
  const appStore = useAppStore();
  const isMobileMenuOpen = ref(false);
  
  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  };
  
  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
  };
  
  const handleLogoutAndCloseMenu = () => {
    handleLogout();
    closeMobileMenu();
  };
  </script>
  
  <style scoped>
  /* ========================================= */
  /*  Estilos Completos para TopNavBar         */
  /* ========================================= */
  
  .app-header {
    position: sticky;
    top: 0;
    z-index: 40;
    width: 100%;
    background-color: var(--background);
    border-bottom: 1px solid var(--border);
  }
  
  .main-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 4rem; /* 64px */
    padding: 0 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .nav-left, .nav-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  
  /* Logo */
  .brand-logo {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    text-decoration: none;
    color: var(--foreground);
  }
  
  .brand-icon {
    font-size: 1.5rem;
  }
  
  /* ========================================= */
  /*  Menú de Escritorio (Estilos Mejorados)   */
  /* ========================================= */
  .desktop-menu {
    display: none;
    list-style: none;
    gap: 0.25rem;
  }
  
  .nav-link {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: var(--radius, 0.5rem);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--muted-foreground);
    text-decoration: none;
    transition: color 0.2s ease, background-color 0.2s ease;
  }
  
  .nav-link:hover {
    background-color: var(--muted);
    color: var(--foreground);
  }
  
  .nav-link.router-link-active {
    background-color: var(--accent, var(--muted));
    color: var(--foreground);
    font-weight: 600;
  }
  
  .desktop-user-menu {
    display: none;
    align-items: center;
    gap: 0.5rem;
  }
  
  .logout-button {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: var(--radius, 0.5rem);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--muted-foreground);
    transition: color 0.2s ease, background-color 0.2s ease;
    line-height: normal; /* Asegura alineación correcta */
    text-align: left; /* Para el menú móvil */
    width: 100%; /* Para el menú móvil */
  }
  
  .logout-button:hover {
    background-color: var(--muted);
    color: var(--foreground);
  }
  
  
  /* ========================================= */
  /*  Menú Móvil y Toggle                      */
  /* ========================================= */
  .mobile-menu-toggle {
    display: block;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: var(--foreground);
  }
  
  .mobile-menu {
    position: absolute; /* Cambiado de 'fixed' para que se mueva con el scroll si es necesario */
    top: 4rem;
    left: 0;
    right: 0;
    background-color: var(--background);
    border-bottom: 1px solid var(--border);
    padding: 1rem;
    z-index: 30;
  }
  
  .mobile-menu-links {
    list-style: none;
  }
  
  .mobile-nav-link {
    display: block;
    padding: 0.75rem 0.5rem; /* Padding ajustado para móvil */
    font-weight: 500;
    text-decoration: none;
    color: var(--foreground);
    border-radius: var(--radius, 0.5rem);
    transition: background-color 0.2s ease;
  }
  
  .mobile-nav-link:hover {
    background-color: var(--muted);
  }
  
  .mobile-nav-link.logout-button {
    /* hereda estilos, pero ajustamos padding si es necesario */
    padding: 0.75rem 0.5rem;
  }
  
  .menu-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0.5rem 0;
  }
  
  /* ========================================= */
  /*  Media Queries para Responsividad         */
  /* ========================================= */
  @media (min-width: 768px) {
    .desktop-menu, .desktop-user-menu {
      display: flex;
      align-items: center;
    }
    .mobile-menu-toggle, .mobile-menu {
      display: none;
    }
  }
  
  /* ========================================= */
  /*  Transiciones (Opcional pero recomendado) */
  /* ========================================= */
  .slide-fade-enter-active {
    transition: all 0.3s ease-out;
  }
  .slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
  }
  </style>