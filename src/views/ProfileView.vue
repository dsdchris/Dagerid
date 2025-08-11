<template>
  <div class="page-container">
    <!-- 1. Header de la Página -->
    <header class="page-header">
      <div>
        <h1 class="page-title">Perfil</h1>
        <p class="page-subtitle">Gestiona tu información personal y preferencias.</p>
      </div>
    </header>

    <!-- 2. Contenido Principal -->
    <main class="profile-content">
      <form @submit.prevent="saveProfileInfo" class="profile-card">
        
        <!-- Sección de Avatar -->
        <div class="content-section">
          <h2 class="section-title">Foto de Perfil</h2>
          <p class="section-description">Sube una imagen para personalizar tu perfil.</p>
          
          <div class="avatar-section">
            <!-- Preview del avatar -->
            <div class="avatar-preview-container">
              <UserAvatar 
                :avatarUrl="appStore.userProfile.avatar_url" 
                size="xl"
                alt="Tu avatar"
              />
              
              <!-- Estado de carga -->
              <div v-if="isUploadingAvatar" class="avatar-loading">
                <span class="material-symbols-outlined loading-spinner">hourglass_top</span>
              </div>
            </div>
            
            <!-- Input de archivo y botón -->
            <div class="avatar-controls">
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*" 
                @change="handleFileSelect"
                class="file-input"
                :disabled="isUploadingAvatar"
              />
              <button 
                type="button" 
                @click="triggerFileSelect"
                class="upload-button"
                :disabled="isUploadingAvatar"
              >
                <span class="material-symbols-outlined">upload</span>
                {{ isUploadingAvatar ? 'Subiendo...' : 'Cambiar Foto' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Sección de Información del Perfil -->
        <div class="content-section">
          <h2 class="section-title">Información Pública</h2>
          <p class="section-description">Esta información podrá ser visible por otros usuarios.</p>
          <div class="form-grid">
            <div class="form-field">
              <label for="username" class="form-label">Nombre de usuario</label>
              <input id="username" type="text" v-model="appStore.userProfile.username" class="form-input" placeholder="Tu nombre de usuario" />
            </div>
            <div class="form-field">
              <label for="bio" class="form-label">Biografía</label>
              <input id="bio" type="text" v-model="appStore.userProfile.bio" class="form-input" placeholder="ej. Lector apasionado..." />
            </div>
          </div>
        </div>

        <!-- Sección de Apariencia -->
        <div class="content-section">
          <h2 class="section-title">Apariencia</h2>
          <p class="section-description">Personaliza cómo se ve la aplicación.</p>
          <div class="theme-option">
             <label class="form-label">Tema de la interfaz</label>
             <div class="theme-toggle-wrapper">
               <span class="theme-label">Alternar entre modo claro y oscuro.</span>
               <button type="button" @click="appStore.toggleTheme()" class="theme-toggle-button">
                 <span class="material-symbols-outlined">{{ appStore.darkMode ? 'light_mode' : 'dark_mode' }}</span>
               </button>
             </div>
          </div>
        </div>
        
        <!-- Acciones del Formulario -->
        <div class="form-actions">
          <button type="submit" class="save-button">Guardar Cambios</button>
        </div>

      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/appStore'
import UserAvatar from '@/components/UserAvatar.vue'

const appStore = useAppStore()
const isUploadingAvatar = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function saveProfileInfo() {
  // La acción saveProfile ya muestra una alerta internamente
  appStore.saveProfile(appStore.userProfile.username, appStore.userProfile.bio)
}

function triggerFileSelect() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido.')
    return
  }
  
  // Validar tamaño (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB en bytes
  if (file.size > maxSize) {
    alert('La imagen es demasiado grande. El tamaño máximo es 5MB.')
    return
  }
  
  isUploadingAvatar.value = true
  
  try {
    const avatarUrl = await appStore.uploadAvatar(file)
    if (avatarUrl) {
      console.log('✅ Avatar actualizado exitosamente')
    }
  } catch (error) {
    console.error('❌ Error al subir avatar:', error)
  } finally {
    isUploadingAvatar.value = false
    // Limpiar el input para permitir subir la misma imagen nuevamente si es necesario
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}
</script>

<style scoped>
/* ========================================= */
/*  ESTILOS BASE (coherentes con la app)    */
/* ========================================= */
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.05em;
  color: var(--foreground);
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--muted-foreground);
  margin-top: 0.25rem;
}

/* ========================================= */
/*  ESTILOS DEL PERFIL                       */
/* ========================================= */

/* Sección de Avatar */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.avatar-preview-container {
  position: relative;
}

.avatar-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 50%;
}

.loading-spinner {
  font-size: 2rem;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.avatar-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.file-input {
  display: none; /* Ocultar el input nativo */
}

.upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--secondary);
  color: var(--secondary-foreground);
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius);
  font-weight: 500;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}

.upload-button:hover:not(:disabled) {
  background-color: var(--accent);
  color: var(--accent-foreground);
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .avatar-section {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 2rem;
  }
  
  .avatar-controls {
    align-items: flex-start;
  }
}

.profile-content {
  max-width: 720px; /* Ancho ideal para formularios */
  margin: 0 auto;
}

.profile-card {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 768px) {
  .profile-card {
    padding: 2rem;
  }
}

.content-section {
  width: 100%;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--foreground);
}

.section-description {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-top: 0.25rem;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground);
}

.form-input {
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background-color: var(--background);
  color: var(--foreground);
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
}

/* Sección de Tema */
.theme-option {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.theme-toggle-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background-color: var(--background);
}

.theme-label {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.theme-toggle-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--muted);
  color: var(--muted-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle-button:hover {
  background-color: var(--accent);
  color: var(--accent-foreground);
}

/* Acciones */
.form-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
  margin-top: 1rem;
}

.save-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--primary);
  color: var(--primary-foreground);
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.save-button:hover {
  opacity: 0.9;
}
</style> 