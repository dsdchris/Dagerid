import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import BooksView from '../views/BooksView.vue'
import AchievementsView from '../views/AchievementsView.vue'
import StatisticsView from '../views/StatisticsView.vue'
import ProfileView from '../views/ProfileView.vue'
import AuthView from '../views/AuthView.vue'
import HomeView from '../views/HomeView.vue'
// @ts-ignore
import { useAuth } from '@/composables/useAuth';
// import { useAppStore } from '@/stores/appStore'; // REMOVED
import { watch } from 'vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 2. Ruta para la autenticación
    { 
      path: '/login', // Un path explícito
      name: 'login',
      component: AuthView, // Usa la nueva vista
      meta: { requiresAuth: false } // No requiere autenticación
    },
    // Rutas protegidas
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/libros',
      name: 'books',
      component: BooksView,
      meta: { requiresAuth: true }
    },
    {
      path: '/logros',
      name: 'achievements',
      component: AchievementsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/perfil',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    { // CAMBIO: Ruta para estadísticas
      path: '/estadisticas',
      name: 'statistics',
      component: StatisticsView,
      meta: { requiresAuth: true }
    },
    { // CAMBIO: HomeView ahora solo para testeo si es necesario, o se puede eliminar
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    }
  ]
})

// Guardia de navegación simplificada. SOLO se preocupa de la autenticación.
router.beforeEach(async (to, from, next) => {
  const { userSession, isAuthReady } = useAuth();

  // 1. Esperar a que el estado de autenticación esté listo
  if (!isAuthReady.value) {
    await new Promise<void>(resolve => {
      const unwatch = watch(isAuthReady, (ready) => {
        if (ready) {
          unwatch();
          resolve();
        }
      });
    });
  }

  const isLoggedIn = !!userSession.value;
  const requiresAuth = !!to.meta.requiresAuth; // Asegurarse de que sea un booleano

  // 2. Lógica de redirección simple
  if (requiresAuth && !isLoggedIn) {
    next({ name: 'login' }); // No puedes estar aquí, vete al login
  } else if (to.name === 'login' && isLoggedIn) {
    next({ name: 'dashboard' }); // Ya estás logueado, vete al dashboard
  } else {
    next(); // En todos los demás casos, adelante.
  }
});

export default router;
