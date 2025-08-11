import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// CORRECCIÓN: Definir tipos/interfaces mejora la calidad y previene errores
interface Book {
  id: string;
  title: string;
  author: string;
  cover_image_url: string;
  page_count: number;
}

interface Reading {
  id: string;
  status: 'por_leer' | 'leyendo' | 'leido' | 'abandonado';
  start_date: string | null;
  finish_date: string | null;
  rating: number | null;
  review: string | null;
  book: Book; // Ahora siempre será un objeto Book
  currentPage?: number; // Añadido para consistencia local (ahora opcional)
}


export const useAppStore = defineStore('app', () => {
  // =====================
  // Estado global
  // =====================
  const readings = ref<Reading[]>([]) // Usamos el tipo Reading
  const progressLogs = ref<{ [readingId: string]: any }>({})
  const achievements = ref<number[]>([])
  const userStats = ref({ booksRead: 0, pagesRead: 0, totalDays: 0, startDates: {} as { [date: string]: number } })
  const userProfile = ref({ username: '', bio: '', avatar_url: '' })

  const darkMode = ref(false)
  const recentActivities = ref<any[]>([])

  const currentReadingIdForProgress = ref<string | null>(null)
  const isAddBookModalOpen = ref(false)
  const isEditBookModalOpen = ref(false)
  const isUpdateProgressModalOpen = ref(false)
  const isAchievementModalOpen = ref(false)
  const latestAchievement = ref<any | null>(null)
  const isMobileMenuOpen = ref(false)

  const user = ref<any | null>(null)
  const session = ref<any | null>(null)

  const isLoading = ref(true); // <--- NUEVO ESTADO DE CARGA

  // =====================
  // KPIs y Estadísticas Computadas
  // =====================

  // CORRECCIÓN: readingStreak ahora es su propio computed, no anidado.
  const readingStreak = computed(() => {
    const sortedDates = Object.keys(userStats.value.startDates)
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());

    if (sortedDates.length === 0) return 0; // CORRECCIÓN: Racha 0 si no hay fechas
    
    // CORRECCIÓN: Lógica de racha más robusta
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Comprobar si la fecha más reciente es hoy o ayer para iniciar el conteo
    const mostRecentDate = sortedDates[0];
    const timeDiff = today.getTime() - mostRecentDate.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    if (dayDiff > 1) return 0; // La racha se rompió si el último día de lectura no fue hoy o ayer

    streak = 1; // Si llegamos aquí, al menos hay un día de racha (el más reciente)
    for (let i = 0; i < sortedDates.length - 1; i++) {
        const d1 = sortedDates[i];
        const d2 = sortedDates[i+1];
        const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
        if (diff === 1) {
            streak++;
        } else {
            break; // La racha se rompió
        }
    }
    return streak;
  });

  const weeklyStats = computed(() => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    let pagesReadThisWeek = 0;
    const booksReadThisWeek = new Set<string>();
    // const dailyReadingMinutes = new Array(7).fill(0); // No usado, se puede quitar

    // Calcular páginas leídas esta semana
    for (const readingId in progressLogs.value) {
      const logs = progressLogs.value[readingId];
      let lastPageThisWeek = 0;
      let firstPageThisWeek = -1; // Usar -1 para indicar que no se ha encontrado el primer log de la semana

      logs.forEach((log: any) => {
        const logDate = new Date(log.date);
        if (logDate >= oneWeekAgo && logDate <= today) {
          if (firstPageThisWeek === -1) {
            // Si es el primer log dentro de la semana, buscar el progreso ANTES de la semana.
            const logsBeforeWeek = logs.filter((l: any) => new Date(l.date) < oneWeekAgo).sort((a: any,b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            firstPageThisWeek = logsBeforeWeek.length > 0 ? logsBeforeWeek[0].page : 0;
          }
          lastPageThisWeek = Math.max(lastPageThisWeek, log.page);
        }
      });
      
      if (firstPageThisWeek !== -1) { // Solo sumar si hemos encontrado al menos un log en la semana
        pagesReadThisWeek += (lastPageThisWeek - firstPageThisWeek);
      }
    }

    // Calcular libros terminados esta semana
    readings.value.forEach(reading => {
      if (reading.status === 'leido' && reading.finish_date) {
        const finishDate = new Date(reading.finish_date);
        if (finishDate >= oneWeekAgo && finishDate <= today) {
          booksReadThisWeek.add(reading.book.id);
        }
      }
    });

    return {
      pagesRead: pagesReadThisWeek,
      booksFinished: booksReadThisWeek.size,
      currentStreak: readingStreak.value, // Referencia al computed de nivel superior
      readingGoalProgress: 75, // KPI #4: Progreso de meta (dato de ejemplo)
    };
  });

  // =====================
  // Funciones principales de Supabase
  // =====================
  async function fetchInitialData() {
    isLoading.value = true; // Empezamos a cargar
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      session.value = currentSession
      user.value = currentSession?.user || null

      if (user.value) {
        // CAMBIO: Seleccionar 'username' y 'bio'
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`username, bio, avatar_url`)
          .eq('id', user.value.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') throw profileError
        // CAMBIO: Asignar a las propiedades correctas
        userProfile.value = profileData || { username: '', bio: '', avatar_url: '' }

        // El resto de las cargas
        await fetchUserReadings() // CAMBIO: Llamar a fetchUserReadings en lugar de fetchBooks
        await fetchUserAchievements()
        await fetchUserStats()
        await fetchRecentActivities()
        await fetchAchievementDefinitions() 
        await fetchAllProgressLogs(); // Llama a fetchAllProgressLogs() en fetchInitialData después de cargar las lecturas

        if (user.value.user_metadata?.darkMode !== undefined) {
          darkMode.value = user.value.user_metadata.darkMode
          // (Tu lógica para aplicar el tema)
        }
      } else {
        readings.value = []; // Asegurarse de que esté vacío si no hay usuario
      }
    } catch (error: any) {
      console.error('Error al cargar datos iniciales de Supabase:', error.message)
    } finally {
      isLoading.value = false; // Terminamos de cargar, con o sin error
    }
  }

  // CAMBIO: Nueva función principal de carga ahora es fetchUserReadings
  async function fetchUserReadings() {
    if (!user.value) {
      return
    }
    try {
      const { data, error } = await supabase
        .from('readings')
        .select('*, book:books(*)') // CAMBIO: Usar la relación FK para traer la info del libro
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .limit(1000) // FIX: Agregar límite para evitar error "range must be <= 1000"

      if (error) throw error

      readings.value = data || []

      // CAMBIO: Obtener el progreso más reciente para cada lectura
      if (data && data.length > 0) {
        for (const reading of data) {
          const { data: progressData, error: progressError } = await supabase
            .from('progress_updates')
            .select('pages_read')
            .eq('reading_id', reading.id)
            .order('created_at', { ascending: false })
            .limit(1)

          if (!progressError && progressData && progressData.length > 0) {
            // Asignar el progreso actual a cada lectura
            reading.currentPage = progressData[0].pages_read
          } else {
            reading.currentPage = 0 // Si no hay progreso, es 0
          }
        }
        // Actualizar el estado con los datos de progreso incluidos
        readings.value = data
      }
    } catch (error: any) {
      console.error('Error al obtener las lecturas del usuario:', error.message)
    }
  }

  // =====================
  // Autenticación (lógica básica, asumiendo que useAuth la maneja más a fondo)
  // =====================
  async function signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      
      // CAMBIO: Ya no es necesario insertar el perfil manualmente, el trigger lo hace.
      // NOTA: El trigger de `handle_new_user` crea el perfil.
      
      // Crear entrada inicial para user_stats
      if (data.user) {
        await supabase.from('user_stats').insert({ id: data.user.id })
      }
      
      alert('Registro exitoso. Revisa tu correo para confirmar tu cuenta.')
      // No necesitas actualizar el estado local aquí, el listener onAuthStateChange lo hará.
      return { success: true, user: data.user }
    } catch (error: any) {
      console.error('Error en el registro:', error.message)
      alert(`Error en el registro: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // No es necesario actualizar el estado aquí, onAuthStateChange lo hará y disparará fetchInitialData
      alert('Inicio de sesión exitoso.')
      // fetchInitialData se llamará desde el watcher o el hook onAuthStateChange en tu App.vue
      return { success: true, user: data.user }
    } catch (error: any) {
      console.error('Error en el inicio de sesión:', error.message)
      alert(`Error en el inicio de sesión: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
      session.value = null
      // Limpiar estados locales
      readings.value = [] // CAMBIO: Limpiar readings en lugar de books
      progressLogs.value = {}
      achievements.value = []
      userStats.value = { booksRead: 0, pagesRead: 0, totalDays: 0, startDates: {} }
      userProfile.value = { username: '', bio: '', avatar_url: '' } // CAMBIO: Limpiar con las nuevas propiedades
      recentActivities.value = [] // Limpiar actividades recientes locales
      isLoading.value = false; // IMPORTANTE: Resetear el loading al cerrar sesión
      alert('Sesión cerrada correctamente.')
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error.message)
      alert(`Error al cerrar sesión: ${error.message}`)
    }
  }

  // =====================
  // Perfil de Usuario
  // =====================
  // CAMBIO: Parámetros y objeto de 'upsert' actualizados
  async function saveProfile(username: string, bio: string, avatarUrl?: string) {
    if (!user.value) {
      alert('Debes iniciar sesión para guardar tu perfil.')
      return
    }
    try {
      const profileData: any = { id: user.value.id, username, bio }
      if (avatarUrl !== undefined) {
        profileData.avatar_url = avatarUrl
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })

      if (error) throw error

      userProfile.value.username = username
      userProfile.value.bio = bio
      if (avatarUrl !== undefined) {
        userProfile.value.avatar_url = avatarUrl
      }
      await addRecentActivity('Perfil actualizado')
      alert('Perfil guardado correctamente.')
    } catch (error: any) {
      console.error('Error al guardar perfil:', error.message)
      alert(`Error al guardar perfil: ${error.message}`)
    }
  }

  // Nueva función para subir avatar siguiendo los pasos del usuario
  async function uploadAvatar(file: File) {
    if (!user.value) {
      alert('Debes iniciar sesión para subir una foto de perfil.')
      return null
    }

    try {
      console.log('📸 Iniciando subida de avatar...')
      
      // Paso 2.2: Generar nombre único y path correcto para la política de seguridad
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.value.id}/${fileName}` // ✅ CORREGIDO: user_id/filename

      console.log('💾 Subiendo archivo a path:', filePath)
      
      // Subir el archivo a Supabase Storage con upsert
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error('❌ Error al subir archivo:', uploadError)
        throw uploadError
      }

      console.log('✅ Archivo subido exitosamente')
      
      // Paso 2.3: Obtener la URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        throw new Error('No se pudo obtener la URL pública del archivo')
      }

      console.log('🔗 URL pública obtenida:', urlData.publicUrl)

      // Paso 2.4: Actualizar el perfil del usuario
      await saveProfile(userProfile.value.username, userProfile.value.bio, urlData.publicUrl)

      console.log('🎉 Avatar actualizado exitosamente')
      return urlData.publicUrl

    } catch (error: any) {
      console.error('❌ Error al subir avatar:', error.message)
      alert(`Error al subir avatar: ${error.message}`)
      return null
    }
  }

  // =====================
  // Funciones de Tema
  // =====================
  async function toggleTheme() {
    darkMode.value = !darkMode.value
    // Actualizar tema en la interfaz
    document.documentElement.classList.toggle('dark', darkMode.value)
    // CAMBIO: Eliminar clases de Tailwind y usar variables CSS si es necesario o manejar en styles.css
    // Las clases de Tailwind fueron removidas previamente de index.html y styles.css
    // Aquí, solo la clase 'dark' en el <html> es suficiente para el tema global con CSS puro.

    // Persistir en Supabase user_metadata si hay un usuario autenticado
    if (user.value) {
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: { darkMode: darkMode.value }
        })
        if (error) throw error
        // console.log('Tema guardado en Supabase user_metadata', data)
      } catch (error: any) {
        console.error('Error al guardar tema en Supabase user_metadata:', error.message)
      }
    } else {
      // Si no hay usuario, no persistir, solo cambiar el estado visualmente.
      // Anteriormente se usaba localStorage, pero ya no es necesario.
    }
  }

  // =====================
  // Funciones para Logros
  // =====================
  // 1. Nuevo estado para almacenar las definiciones de logros desde la DB
  const achievementDefinitions = ref<any[]>([])

  // 3. Nueva función para cargar las definiciones de logros al iniciar la app
  async function fetchAchievementDefinitions() {
    try {
      console.log('🔍 Cargando definiciones de logros...')
      const { data, error } = await supabase.from('achievements').select('*')
      if (error) throw error
      achievementDefinitions.value = data || []
      console.log('✅ Logros cargados:', achievementDefinitions.value.length, achievementDefinitions.value)
    } catch (error: any) {
      console.error('❌ Error al cargar las definiciones de logros:', error.message)
    }
  }

  // Función para obtener los logros del usuario (DEBE IR ANTES DE unlockAchievement y checkAchievements)
  async function fetchUserAchievements() {
    if (!user.value) return
    try {
      console.log('🏆 Cargando logros del usuario...')
      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.value.id)

      if (error) throw error
      achievements.value = data.map(item => item.achievement_id as number)
      console.log('✅ Logros del usuario:', achievements.value)
    } catch (error: any) {
      console.error('❌ Error al obtener logros del usuario:', error.message)
    }
  }

  // 5. Modificar (o crear) la función de desbloqueo
  async function unlockAchievement(achievementDef: any) { // Aceptar el objeto completo del logro
    if (!user.value) return
    
    try {
      console.log('🎉 Intentando desbloquear logro:', achievementDef.name, 'ID:', achievementDef.id)
      
      // Verificación local ÚNICAMENTE - más eficiente
      if (achievements.value.includes(achievementDef.id)) {
        console.log('ℹ️ Logro ya desbloqueado localmente:', achievementDef.name)
        return
      }
      
      // Si no está en el array local, intentar insertarlo directamente
      console.log('💾 Insertando logro en la base de datos...')
      const { error } = await supabase.from('user_achievements').insert({
        user_id: user.value.id,
        achievement_id: achievementDef.id,
        unlocked_at: new Date().toISOString()
      })
      
      if (error) {
        // Si es error de duplicado (logro ya existe), solo actualizar array local
        if (error.code === '23505') { // unique_violation
          console.log('ℹ️ Logro ya existe en BD, actualizando array local:', achievementDef.name)
          achievements.value.push(achievementDef.id as number)
          return
        }
        console.error('❌ Error en la inserción:', error)
        throw error
      }

      // Si llegamos aquí, el logro se desbloqueó exitosamente
      achievements.value.push(achievementDef.id as number)
      await addRecentActivity(`¡Desbloqueaste el logro: ${achievementDef.name}!`);
      showAchievementModal(achievementDef);
      console.log('🎊 Logro desbloqueado exitosamente:', achievementDef.name)

    } catch (error: any) {
      console.error('❌ Error al desbloquear logro:', error.message, error)
      alert(`Error al desbloquear logro: ${error.message}`)
    }
  }

  async function fetchUserStats() {
    if (!user.value) return
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('books_read, pages_read, total_days, start_dates')
        .eq('id', user.value.id)

      if (error) throw error
      
      if (data && data.length > 0) {
        // Si hay datos, usar la primera fila (debería ser única)
        const stats = data[0]
        userStats.value = {
          booksRead: stats.books_read || 0,
          pagesRead: stats.pages_read || 0,
          totalDays: stats.total_days || 0,
          startDates: stats.start_dates || {}
        }
      } else {
        // Si no hay datos, crear entrada inicial con UPSERT para evitar conflictos
        const initialStats = {
          id: user.value.id,
          books_read: 0,
          pages_read: 0,
          total_days: 0,
          start_dates: {}
        }
        
        const { error: upsertError } = await supabase
          .from('user_stats')
          .upsert(initialStats, { onConflict: 'id' })
        
        if (upsertError) {
          console.error('Error al crear/actualizar estadísticas iniciales:', upsertError.message)
        }
        
        userStats.value = {
          booksRead: 0,
          pagesRead: 0,
          totalDays: 0,
          startDates: {}
        }
      }
    } catch (error: any) {
      console.error('Error al obtener estadísticas del usuario:', error.message)
      // En caso de error, usar valores por defecto
      userStats.value = {
        booksRead: 0,
        pagesRead: 0,
        totalDays: 0,
        startDates: {}
      }
    }
  }

  async function updateUserStats(updates: any) {
    if (!user.value) return
    try {
      const { error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('id', user.value.id)

      if (error) throw error
      // No actualizamos userStats.value aquí porque ya se actualiza en el lugar de la llamada
    } catch (error: any) {
      console.error('Error al actualizar estadísticas del usuario:', error.message)
    }
  }

  async function fetchRecentActivities() {
    if (!user.value) return
    try {
      const { data, error } = await supabase
        .from('recent_activities')
        .select('text, created_at')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      recentActivities.value = data || []
    } catch (error: any) {
      console.error('Error al obtener actividades recientes:', error.message)
    }
  }

  async function addRecentActivity(text: string) {
    if (!user.value) return
    try {
      const { error } = await supabase
        .from('recent_activities')
        .insert({ user_id: user.value.id, text })
      if (error) throw error

      // Añadir la nueva actividad al principio del array local
      recentActivities.value.unshift({ text, created_at: new Date().toISOString() })
      // Limitar a los 5 más recientes para evitar que crezca demasiado
      if (recentActivities.value.length > 5) {
        recentActivities.value.pop()
      }
    } catch (error: any) {
      console.error('Error al añadir actividad reciente:', error.message)
    }
  }

  // =====================
  // Funciones CRUD para Lecturas (Libros del usuario)
  // =====================

  async function addReading(bookData: any) {
    if (!user.value) {
      alert('Debes iniciar sesión para agregar libros.')
      return
    }
    try {
      // Primero, intenta insertar o actualizar el libro en la tabla 'books'
      const { data: book, error: bookError } = await supabase
        .from('books')
        .upsert(
          {
            id: bookData.id,
            title: bookData.title,
            author: bookData.author,
            cover_image_url: bookData.cover_image_url,
            page_count: bookData.page_count
          },
          { onConflict: 'id' }
        )
        .select('id')
        .single()

      if (bookError) {
        console.error('Error al upsertar libro:', bookError.message)
        throw bookError
      }
      if (!book) {
        throw new Error('No se pudo obtener el ID del libro después de upsert.')
      }
      const bookId = book.id

      // Luego, crea una nueva entrada en la tabla 'readings'
      const { data: newReadingData, error: readingError } = await supabase
        .from('readings')
        .insert({
          book_id: bookId,
          user_id: user.value.id,
          status: 'por_leer'
        })
        .select('*, book:books(*)') // CAMBIO: Seleccionar también la información completa del libro
        .single()

      if (readingError) {
        if (readingError.code === '23505') { // Código para unique_violation
          alert('Este libro ya está en tu biblioteca.');
        } else {
          console.error('Error al agregar lectura:', readingError.message);
          alert(`Error al agregar lectura: ${readingError.message}`);
        }
        throw readingError; // Re-lanza el error para el bloque catch exterior
      }

      // CORRECCIÓN: Actualizar el estado local en lugar de re-fetchear
      const newReading = newReadingData as Reading;
      newReading.currentPage = 0; // Inicializar currentPage para el nuevo libro
      // Asegurarse de que newReading.book contenga los datos correctos si Supabase no los devuelve directamente
      if (!newReading.book || Object.keys(newReading.book).length === 0) {
        newReading.book = bookData; // Si la relación no cargó el libro completo, usar bookData original
      }
      readings.value.unshift(newReading); // Añadir al principio de la lista

      await addRecentActivity(`Añadiste "${newReading.book.title}" a tu lista de lectura.`);
      
      console.log('📚 Libro añadido, verificando logros...')
      console.log('Total de lecturas:', readings.value.length)
      console.log('Logros actuales:', achievements.value)
      console.log('Definiciones de logros:', achievementDefinitions.value.length)
      
      await checkAchievements(); // Vuelve a verificar logros
      alert('Libro añadido a tu biblioteca correctamente.');

    } catch (error: any) {
      console.error('Error al agregar lectura:', error.message);
      alert(`Error al agregar lectura: ${error.message}`);
    }
  }

  async function updateBook(updatedBook: any) { // Recibe el objeto Reading completo
    if (!user.value) {
      alert('Debes iniciar sesión para actualizar libros.');
      return;
    }

    try {
      // Primero, actualiza la información del libro en la tabla 'books'
      const { error: bookError } = await supabase
        .from('books')
        .update({
          title: updatedBook.book.title,
          author: updatedBook.book.author,
          cover_image_url: updatedBook.book.cover_image_url,
          page_count: updatedBook.book.page_count
        })
        .eq('id', updatedBook.book.id);

      if (bookError) throw bookError;

      // Luego, actualiza la información de la lectura en la tabla 'readings'
      const { error: readingError } = await supabase
        .from('readings')
        .update({
          status: updatedBook.status,
          start_date: updatedBook.start_date,
          finish_date: updatedBook.finish_date,
          rating: updatedBook.rating,
          review: updatedBook.review
        })
        .eq('id', updatedBook.id);

      if (readingError) throw readingError;

      // CORRECCIÓN: Actualizar el estado local en lugar de re-fetchear
      const index = readings.value.findIndex(r => r.id === updatedBook.id);
      if (index !== -1) {
        // Fusionar los cambios en el objeto existente para mantener la reactividad
        readings.value[index] = { ...readings.value[index], ...updatedBook };
      }
      
      await addRecentActivity(`Actualizaste la información de "${updatedBook.book.title}".`); // CORRECCIÓN: Acceder a book.title
      alert('Libro actualizado correctamente!');

    } catch (error: any) {
      console.error('Error al actualizar libro:', error.message);
      alert(`Error al actualizar libro: ${error.message}`);
    }
  }

  async function deleteReading(readingId: string) {
    if (!user.value) {
        alert('Debes iniciar sesión para eliminar lecturas.');
        return;
    }
    if (!confirm('¿Estás seguro de que quieres eliminar esta lectura y todo su progreso asociado?')) {
        return;
    }
    try {
        const readingIndex = readings.value.findIndex(r => r.id === readingId);
        if (readingIndex === -1) return; // No se encontró la lectura

        const readingToDelete = readings.value[readingIndex];

        // CORRECCIÓN: Actualización optimista de la UI: Eliminar inmediatamente
        readings.value.splice(readingIndex, 1); 

        // Ahora, realiza las operaciones en la DB
        // Importante: Eliminar primero las entradas en `progress_updates` debido a la restricción `ON DELETE CASCADE`
        // en la tabla `readings`. Si `progress_updates` no tiene CASCADE en `reading_id`, necesitarías borrarla primero.
        // Dado tu esquema, borrar `readings` con CASCADE en `progress_updates` es suficiente, 
        // pero para claridad y si no tuvieras CASCADE, haríamos esto:
        await supabase
            .from('progress_updates')
            .delete()
            .eq('reading_id', readingId);

        const { error } = await supabase
            .from('readings')
            .delete()
            .eq('id', readingId);

        if (error) {
            // Si falla, revertimos el cambio en la UI y mostramos un error
            readings.value.splice(readingIndex, 0, readingToDelete); // Reinsertar en la posición original
            console.error('Error al eliminar lectura de la DB:', error.message);
            throw error; // Re-lanzar el error para el bloque catch
        }

        // No necesitamos borrar actividades recientes si ya se borraron con CASCADE o no tienen reading_id
        await addRecentActivity(`Eliminaste "${readingToDelete.book.title}" de tu biblioteca.`); // CORRECCIÓN: Acceder a book.title
        alert('Lectura eliminada correctamente!');

    } catch (error: any) {
        console.error('Error al eliminar lectura:', error.message);
        alert(`Error al eliminar lectura: ${error.message}`);
    }
  }
  
  async function updateReadingProgress(readingId: string, newPage: number) {
    if (!user.value) return;

    const readingIndex = readings.value.findIndex(r => r.id === readingId);
    if (readingIndex === -1) {
      console.error('No se encontró la lectura para actualizar.');
      return;
    }

    const reading = readings.value[readingIndex];
    const oldPage = reading.currentPage || 0;

    try {
      // 1. Insertar el nuevo progreso en la tabla 'progress_updates'
      const { error: progressError } = await supabase.from('progress_updates').insert({
        reading_id: readingId,
        pages_read: newPage
      });
      if (progressError) throw progressError;

      // 2. Actualizar el estado local de la lectura
      reading.currentPage = newPage;

      // Opcional: Si el libro se marca como 'leyendo' al empezar a progresar
      if (reading.status === 'por_leer' && newPage > 0) {
        reading.status = 'leyendo';
        await supabase.from('readings').update({ status: 'leyendo' }).eq('id', readingId);
      }

      // 3. Actualizar las estadísticas del usuario
      const pagesJustRead = newPage - oldPage;
      if (pagesJustRead > 0) {
        await updateUserStats({
          pages_read: userStats.value.pagesRead + pagesJustRead,
        });
        userStats.value.pagesRead += pagesJustRead;
        await addRecentActivity(`Actualizaste el progreso de "${reading.book.title}" a la página ${newPage}.`);
      }
      
      // 4. Comprobar si se ha terminado el libro
      if (newPage >= reading.book.page_count) {
        reading.status = 'leido';
        reading.finish_date = new Date().toISOString();
        await supabase.from('readings').update({ 
          status: 'leido', 
          finish_date: reading.finish_date 
        }).eq('id', readingId);
        
        await addRecentActivity(`¡Terminaste de leer "${reading.book.title}"!`);
      }

      // 5. Verificar logros
      await checkAchievements();

    } catch (error: any) {
      console.error('Error al actualizar el progreso de la lectura:', error.message);
      // Aquí podrías revertir el cambio local si falla la DB
      readings.value[readingIndex].currentPage = oldPage;
    }
  }

  // Funciones de control de modales y UI (sin cambios lógicos)
  function showAchievementModal(def: any) {
    latestAchievement.value = def
    isAchievementModalOpen.value = true
  }

  function closeAchievementModal() {
    isAchievementModalOpen.value = false
    latestAchievement.value = null
  }

  function calculateDaysDifference(start: string, end: string) {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  function checkConsecutiveDays(n: number) {
    const sortedDates = Object.keys(userStats.value.startDates)
      .sort((a: any, b: any) => new Date(a).getTime() - new Date(b).getTime());

    if (sortedDates.length < n) {
      return false;
    }

    let consecutiveCount = 0;
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const currentDate = new Date(sortedDates[i]);
      const previousDate = new Date(sortedDates[i - 1]);

      if (i === sortedDates.length - 1 || calculateDaysDifference(previousDate.toISOString().split('T')[0], currentDate.toISOString().split('T')[0]) === 1) {
        consecutiveCount++;
      } else {
        consecutiveCount = 0; // Reset if not consecutive
      }

      if (consecutiveCount >= n) {
        return true;
      }
    }
    return false;
  }

  function checkOneDayFinish() {
    return readings.value.some((reading: any) => { 
      if (!reading.start_date || !reading.finish_date) return false; 
      const startDate = new Date(reading.start_date).toISOString().split('T')[0];
      const finishDate = new Date(reading.finish_date).toISOString().split('T')[0];
      return startDate === finishDate;
    });
  }

  function checkBooksInOneDay(x: number) {
    const finishedDates: { [date: string]: number } = {};
    readings.value.forEach((reading: any) => { 
      if (reading.status === 'leido' && reading.finish_date) { 
        const finishedDate = new Date(reading.finish_date).toISOString().split('T')[0];
        finishedDates[finishedDate] = (finishedDates[finishedDate] || 0) + 1;
      }
    });
    return Object.values(finishedDates).some(count => count >= x);
  }

  function openAddBookModal() {
    isAddBookModalOpen.value = true
  }

  function closeAddBookModal() {
    isAddBookModalOpen.value = false
  }

  function openEditBookModal(bookId: string) {
    currentReadingIdForProgress.value = bookId
    isEditBookModalOpen.value = true
  }

  function closeEditBookModal() {
    isEditBookModalOpen.value = false
    currentReadingIdForProgress.value = null
  }

  function openUpdateProgressModal(readingId: string) { 
    currentReadingIdForProgress.value = readingId 
    isUpdateProgressModalOpen.value = true
  }

  function closeUpdateProgressModal() {
    isUpdateProgressModalOpen.value = false
    currentReadingIdForProgress.value = null
  }

  function toggleMobileMenu(forceState: boolean | null = null) {
    if (forceState !== null) {
      isMobileMenuOpen.value = forceState
    } else {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }
  }

  // Nueva función para verificar los logros (anteriormente estaba como `const checkAchievements = async () => { ... }`)
  async function checkAchievements() {
    if (!user.value) return

    console.log('🏆 Verificando logros...', {
      totalReadings: readings.value.length,
      achievements: achievements.value,
      achievementDefinitions: achievementDefinitions.value.length
    })

    // Creamos un mapa para buscar condiciones por criteria_key
    const conditions: { [key: string]: () => boolean } = {
      'FIRST_BOOK_ADDED': () => readings.value.length >= 1,
      'FIVE_BOOKS_ADDED': () => readings.value.length >= 5,
      'TEN_BOOKS_ADDED': () => readings.value.length >= 10,
      'FIRST_BOOK_FINISHED': () => readings.value.some((r: any) => r.status === 'leido'),
      'FIVE_BOOKS_FINISHED': () => readings.value.filter((r: any) => r.status === 'leido').length >= 5,
      'TEN_BOOKS_FINISHED': () => readings.value.filter((r: any) => r.status === 'leido').length >= 10,
      'READ_100_PAGES': () => {
        const totalPages = readings.value.reduce((total: number, reading: any) => {
          if (reading.status === 'leido' && reading.book?.page_count) {
            return total + reading.book.page_count
          }
          if (reading.status === 'leyendo' && reading.currentPage) {
            return total + reading.currentPage
          }
          return total
        }, 0)
        return totalPages >= 100
      },
      'READ_500_PAGES': () => {
        const totalPages = readings.value.reduce((total: number, reading: any) => {
          if (reading.status === 'leido' && reading.book?.page_count) {
            return total + reading.book.page_count
          }
          if (reading.status === 'leyendo' && reading.currentPage) {
            return total + reading.currentPage
          }
          return total
        }, 0)
        return totalPages >= 500
      },
      'READ_1000_PAGES': () => {
        const totalPages = readings.value.reduce((total: number, reading: any) => {
          if (reading.status === 'leido' && reading.book?.page_count) {
            return total + reading.book.page_count
          }
          if (reading.status === 'leyendo' && reading.currentPage) {
            return total + reading.currentPage
          }
          return total
        }, 0)
        return totalPages >= 1000
      },
      'STREAK_3_DAYS': () => checkConsecutiveDays(3),
      'STREAK_7_DAYS': () => checkConsecutiveDays(7),
      'STREAK_30_DAYS': () => checkConsecutiveDays(30),
      'FINISHED_IN_ONE_DAY': () => checkOneDayFinish(),
      'TWO_BOOKS_IN_ONE_DAY': () => checkBooksInOneDay(2),
    }

    for (const def of achievementDefinitions.value) { 
      if (!achievements.value.includes(def.id)) {
        const conditionFunc = conditions[def.criteria_key]
        if (conditionFunc) {
          const isUnlocked = conditionFunc()
          console.log(`🎯 Verificando logro "${def.name}" (${def.criteria_key}):`, isUnlocked)
          
          if (isUnlocked) {
            console.log(`🎉 ¡Logro desbloqueado! "${def.name}"`)
            await unlockAchievement(def)
          }
        } else {
          console.warn(`⚠️ Condición no encontrada para logro: ${def.criteria_key}`)
        }
      }
    }
  }

  // Función de test manual para debugging
  async function testAchievements() {
    console.log('🧪 TEST: Verificación manual de logros')
    console.log('📊 Estado actual:')
    console.log('  - Usuario:', user.value?.email)
    console.log('  - Total lecturas:', readings.value.length)
    console.log('  - Logros actuales:', achievements.value)
    console.log('  - Definiciones cargadas:', achievementDefinitions.value.length)
    
    if (achievementDefinitions.value.length === 0) {
      console.log('⚠️ No hay definiciones de logros cargadas. Intentando cargar...')
      await fetchAchievementDefinitions()
    }
    
    if (achievements.value.length === 0) {
      console.log('⚠️ No hay logros del usuario cargados. Intentando cargar...')
      await fetchUserAchievements()
    }
    
    console.log('🏆 Ejecutando checkAchievements...')
    await checkAchievements()
    console.log('✅ Test completado')
  }

  // Nueva función para obtener todos los registros de progreso
  async function fetchAllProgressLogs() {
    if (!user.value || readings.value.length === 0) return;

    try {
        const { data, error } = await supabase
            .from('progress_updates')
            .select('reading_id, created_at, pages_read') // CORRECCIÓN: Usar created_at en lugar de update_date
            .in('reading_id', readings.value.map(r => r.id));

        if (error) {
            console.error("Error fetching all progress logs:", error);
            return;
        }
        
        if (!data) return; 

        const logs: { [readingId: string]: any[] } = {};
        data.forEach(log => {
            if (!logs[log.reading_id]) {
                logs[log.reading_id] = [];
            }
            // Usar created_at y convertir a formato de fecha simple para el gráfico
            const date = new Date(log.created_at).toISOString().split('T')[0];
            logs[log.reading_id].push({ date: date, page: log.pages_read });
        });
        progressLogs.value = logs;

        console.log('✅ Progress logs cargados para gráfico:', logs);

    } catch (error: any) {
        console.error("Error en la función fetchAllProgressLogs:", error.message);
    }
  }

  // =====================
  // Watchers y Retorno
  // =====================

  return {
    readings,
    progressLogs,
    achievements,
    userStats,
    userProfile,
    darkMode,
    recentActivities,
    isAddBookModalOpen,
    isEditBookModalOpen,
    isUpdateProgressModalOpen,
    isAchievementModalOpen,
    latestAchievement,
    currentReadingIdForProgress,
    isMobileMenuOpen,
    user,
    session,
    fetchInitialData,
    signUp,
    signIn,
    signOut,
    saveProfile,
    toggleTheme,
    fetchUserAchievements,
    unlockAchievement,
    fetchUserStats,
    updateUserStats,
    fetchRecentActivities,
    addRecentActivity,
    fetchUserReadings,
    addReading,
    updateBook,
    deleteReading,
    updateReadingProgress,
    checkAchievements, // Exportar la función
    testAchievements, // Exportar función de test
    showAchievementModal,
    closeAchievementModal,
    openAddBookModal,
    closeAddBookModal,
    openEditBookModal,
    closeEditBookModal,
    openUpdateProgressModal,
    closeUpdateProgressModal,
    toggleMobileMenu,
    weeklyStats,
    achievementDefinitions,
    isLoading,
    readingStreak, // Exportar el nuevo computed
    fetchAllProgressLogs, // Aseguramos que se exporte
    uploadAvatar, // Exportar la nueva función
  }
}) 