<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()

// Usamos nuestro composable
const { handleLogin, handleRegister } = useAuth()

// Estado local del componente
const isRegistering = ref(false)
const form = ref({
  email: '',
  password: '',
  username: '' // Solo para el registro
})
const errorMessage = ref(null)
const successMessage = ref(null)
const loading = ref(false)
const showPassword = ref(false) // Nuevo estado para alternar visibilidad de contraseña

const toggleForm = () => {
  isRegistering.value = !isRegistering.value
  errorMessage.value = null
  successMessage.value = null
  form.value = { email: '', password: '', username: '' } // Resetear formulario
}

const submitForm = async () => {
  loading.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    let result
    if (isRegistering.value) {
      // Registro
      result = await handleRegister({
        email: form.value.email,
        password: form.value.password,
        username: form.value.username
      })
      if (result.error) throw result.error
      successMessage.value = "¡Registro exitoso! Revisa tu correo para confirmar tu cuenta."
    } else {
      // Login
      result = await handleLogin({
        email: form.value.email,
        password: form.value.password
      })
      if (result.error) throw result.error
      // Redirigir al dashboard después de un login exitoso
      router.push('/')
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-header">
      <span class="material-symbols-outlined primary-icon">
auto_stories
</span>
      <span class="auth-logo-text">DageRid</span>
    </div>

    <form @submit.prevent="submitForm" class="auth-form">
      <div v-if="isRegistering" class="form-group"> <!-- El campo de username se muestra solo en registro -->
        <label for="username">Nombre de usuario</label>
        <input id="username" type="text" v-model="form.username" required placeholder="Tu nombre de usuario">
      </div>
      
      <div class="form-group">
        <label for="email">Correo electrónico</label>
        <input id="email" type="email" v-model="form.email" required placeholder="example@tudomino.com">
      </div>

      <div class="form-group password-group">
        <label for="password">Contraseña</label>
        <input id="password" :type="showPassword ? 'text' : 'password'" v-model="form.password" required placeholder="••••••••">
        <span class="material-symbols-outlined password-toggle" @click="togglePasswordVisibility">
          {{ showPassword ? 'visibility_off' : 'visibility' }}
        </span>
      </div>

      <button type="submit" :disabled="loading" class="auth-button primary">
        {{ loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Inicia sesión') }}
      </button>

      <button type="button" @click="toggleForm" class="auth-button secondary">
        {{ isRegistering ? 'Iniciar Sesión' : 'Regístrate' }}
      </button>

      <a href="#" class="forgot-password-link">¿Problemas para iniciar sesión?</a>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Estilos CSS para el componente Auth.vue */

.primary-icon {
  font-size: 112px;
  color: black;
  margin-bottom: 8px;
}

.auth-container {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 40px;
  width: auto;
  min-width: 400px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: none;
  font-family: 'Inter', sans-serif;
  text-align: center;
}

.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  margin-top: 0;
}

.auth-logo-text {
  font-size: 36px;
  font-weight: 700;
  color: #000;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-bottom: 6px;
}

.form-group input {
  height: 48px;
  padding: 0 12px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font-size: 16px;
  color: #000;
  outline: none;
  box-sizing: border-box;
}

.form-group input::placeholder {
  color: #9CA3AF;
}

.form-group input:focus {
  border-color: #000;
  box-shadow: 0 0 0 1px #000;
}

.password-group {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(3px);
  cursor: pointer;
  color: #9CA3AF;
  font-size: 20px;
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 20;
}

.auth-button {
  height: 48px;
  padding: 0 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

.auth-button.primary {
  background-color: #000;
  color: #fff;
}

.auth-button.primary:hover:not(:disabled) {
  background-color: #333;
}

.auth-button.secondary {
  background-color: #fff;
  color: #000;
  border: 1px solid #D1D5DB;
  margin-top: 0;
}

.auth-button.secondary:hover:not(:disabled) {
  background-color: #F9FAFB;
  border-color: #9CA3AF;
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.forgot-password-link {
  font-size: 14px;
  color: #000;
  text-decoration: none;
  margin-top: 16px;
  display: block;
}

.forgot-password-link:hover {
  text-decoration: underline;
}

.error-message {
  color: #EF4444;
  margin-top: 16px;
  font-size: 14px;
}

.success-message {
  color: #22C55E;
  margin-top: 16px;
  font-size: 14px;
}
</style> 