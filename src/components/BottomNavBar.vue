<!-- <template>
  <nav class="bottom-nav-bar">
    <ul class="nav-list">
      <li>
        <RouterLink to="/" class="nav-item" :class="{ active: $route.name === 'dashboard' }">
          <span class="material-symbols-outlined nav-icon">home</span>
          <span class="nav-text">Dashboard</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/libros" class="nav-item" :class="{ active: $route.name === 'books' }">
          <span class="material-symbols-outlined nav-icon">book_2</span>
          <span class="nav-text">Libros</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/logros" class="nav-item" :class="{ active: $route.name === 'achievements' }">
          <span class="material-symbols-outlined nav-icon">military_tech</span>
          <span class="nav-text">Logros</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/estadisticas" class="nav-item" :class="{ active: $route.name === 'statistics' }">
          <span class="material-symbols-outlined nav-icon">bar_chart</span>
          <span class="nav-text">Estadísticas</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/perfil" class="nav-item" :class="{ active: $route.name === 'profile' }">
          <span class="material-symbols-outlined nav-icon">person</span>
          <span class="nav-text">Perfil</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.bottom-nav-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--card);
  border-top: 1px solid var(--border);
  z-index: 40;
  padding: 0.5rem 0;
}

@media (min-width: 768px) {
  .bottom-nav-bar {
    display: none;
  }
}

.nav-list {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  color: var(--muted-foreground);
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: var(--radius);
  cursor: pointer;
  min-width: 60px;
}

.nav-item:hover {
  color: var(--foreground);
  background-color: var(--muted);
}

.nav-item.active {
  color: var(--primary);
}

.nav-icon {
  font-size: 1.25rem;
  transition: all 0.2s ease;
}

.nav-item.active .nav-icon {
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

.nav-text {
  font-size: 0.625rem;
  font-weight: 500;
}
</style>  -->