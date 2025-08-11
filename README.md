# Dagerid - Aplicación de Lectura

## Configuración de Supabase Storage

Para que la funcionalidad de avatar funcione, necesitas configurar el bucket de Storage:

### 1. Crear el bucket 'avatars'
1. Ve a tu proyecto en https://supabase.com/dashboard
2. Ve a Storage > Buckets
3. Crea un nuevo bucket llamado `avatars`
4. Marca como **público** (important para obtener URLs públicas)

### 2. Configurar políticas de acceso
En Storage > avatars > Policies, crea estas políticas:

**Política de INSERT:**
```sql
-- Permitir a usuarios autenticados subir sus avatars
CREATE POLICY "Los usuarios pueden subir sus avatars" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Política de SELECT:**
```sql
-- Permitir a todos ver avatars (son públicos)
CREATE POLICY "Los avatars son públicos" ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');
```

**Política de UPDATE:**
```sql
-- Permitir a usuarios actualizar sus propios avatars
CREATE POLICY "Los usuarios pueden actualizar sus avatars" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Política de DELETE:**
```sql
-- Permitir a usuarios eliminar sus propios avatars
CREATE POLICY "Los usuarios pueden eliminar sus avatars" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Agregar columna avatar_url a la tabla profiles
```sql
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
```

## Funcionalidades Implementadas

### 📸 **Sistema de Avatar Completo**
- **Subida de imágenes** a Supabase Storage
- **Validación** de tipos y tamaños de archivo
- **Preview en tiempo real** del avatar
- **Componente reutilizable** `UserAvatar` para toda la app
- **Avatar en TopNavBar** para mostrar en toda la aplicación
- **Manejo de estados de carga** y errores

### 🏆 **Sistema de Logros**
- Logros se desbloquean automáticamente al agregar libros
- Modal de celebración cuando se obtiene un logro
- Sistema de verificación eficiente (fetch-once, check-locally)
- Funciona en todas las vistas

### 📚 **Gestión de Biblioteca**
- CRUD completo de libros
- Tarjetas de libros responsive con botones de acción
- Progreso de lectura dinámico
- Filtros y búsqueda

### 📊 **Estadísticas Dinámicas**
- KPIs en tiempo real
- Actividades recientes
- Distribución de estados de lectura
- Estadísticas semanales
