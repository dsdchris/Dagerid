import { ref } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import router from '@/router';

// 1. Estado global (singleton)
const userSession = ref<any>(null);
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

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (error) {
      return { error };
    }
  };

  const handleRegister = async ({ email, password, username }: { email: string; password: string; username: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
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