import { ref } from 'vue';
import { supabase } from '@/lib/supabaseClient'; // Confirma que esta es la ruta correcta
import router from '@/router'; // Importar el router para redirección

// 1. Estado global (singleton)
const userSession = ref(null);
const isAuthReady = ref(false);

let listenerInitialized = false;

export function useAuth() {
  
  if (!listenerInitialized) {
    // Primero, verificar la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      userSession.value = session;
      isAuthReady.value = true;
    });

    // Luego, configurar el listener para cambios futuros
    supabase.auth.onAuthStateChange((event, session) => {
      userSession.value = session;
      isAuthReady.value = true;
      
      // Si el usuario cierra sesión, redirigir a login
      if (event === 'SIGNED_OUT') {
        router.push({ name: 'login' });
      }
    });
    listenerInitialized = true;
  }

  const handleLogin = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (error) {
      // Devolvemos el error para que el componente de UI lo pueda manejar
      return { error };
    }
  };

  const handleRegister = async ({ email, password, username }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username } // Pasamos metadatos al crear el usuario
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      return { error };
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // La redirección se maneja en onAuthStateChange
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return {
    userSession,
    isAuthReady,
    handleLogin,
    handleRegister,
    handleLogout
  };
}