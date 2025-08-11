<template>
  <div class="auth-view">
    <!-- Fondo con patrón de lectura -->
    <div class="auth-background">
      <div class="background-pattern"></div>
      <div class="background-overlay"></div>
    </div>

    <!-- Contenido principal -->
    <div class="auth-content">
      <!-- Sección de bienvenida lateral (solo visible en desktop) -->
      <div class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-icon">
            <span class="material-symbols-outlined">auto_stories</span>
          </div>
          <h1 class="welcome-title">Bienvenido a Dagerid</h1>
          <p class="welcome-subtitle">
            Tu compañero personal de lectura. Organiza, rastrea y disfruta de tus libros como nunca antes.
          </p>
          <div class="welcome-features">
            <div class="feature-item">
              <span class="material-symbols-outlined">bookmark</span>
              <span>Organiza tu biblioteca personal</span>
            </div>
            <div class="feature-item">
              <span class="material-symbols-outlined">trending_up</span>
              <span>Rastrea tu progreso de lectura</span>
            </div>
            <div class="feature-item">
              <span class="material-symbols-outlined">emoji_events</span>
              <span>Desbloquea logros y estadísticas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de autenticación -->
      <div class="auth-form-section">
        <Auth />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Auth from '@/components/Auth.vue'
</script>

<style scoped>
.auth-view {
  position: relative;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background);
}

/* Fondo con patrón */
.auth-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(90deg, var(--border) 1px, transparent 1px),
    linear-gradient(180deg, var(--border) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.3;
}

.background-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--background) 0%,
    var(--muted) 25%,
    var(--background) 50%,
    var(--muted) 75%,
    var(--background) 100%
  );
  opacity: 0.9;
}

/* Contenido principal */
.auth-content {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

@media (min-width: 1024px) {
  .auth-content {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    padding: 3rem;
  }
}

/* Sección de bienvenida */
.welcome-section {
  display: none;
  align-items: center;
  justify-content: center;
}

@media (min-width: 1024px) {
  .welcome-section {
    display: flex;
  }
}

.welcome-content {
  max-width: 480px;
}

.welcome-icon {
  margin-bottom: 2rem;
}

.welcome-icon .material-symbols-outlined {
  font-size: 4rem;
  color: var(--primary);
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--foreground);
  margin-bottom: 1rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  font-size: 1.125rem;
  color: var(--muted-foreground);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.welcome-features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius);
  background-color: var(--card);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.feature-item:hover {
  background-color: var(--muted);
  border-color: var(--primary);
}

.feature-item .material-symbols-outlined {
  font-size: 1.5rem;
  color: var(--primary);
  flex-shrink: 0;
}

.feature-item span:last-child {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground);
}

/* Sección del formulario */
.auth-form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

/* Mejoras responsivas */
@media (max-width: 640px) {
  .auth-content {
    padding: 1rem;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-content {
  animation: fadeInUp 0.6s ease-out;
}

.auth-form-section {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.feature-item {
  animation: fadeInUp 0.6s ease-out calc(0.4s + var(--delay, 0s)) both;
}

.feature-item:nth-child(1) { --delay: 0s; }
.feature-item:nth-child(2) { --delay: 0.1s; }
.feature-item:nth-child(3) { --delay: 0.2s; }
</style>