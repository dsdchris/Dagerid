import { createClient } from '@supabase/supabase-js'

// Asegúrate de que las variables de entorno estén configuradas en tu archivo .env
// Por ejemplo: VITE_SUPABASE_URL="https://xyzcompany.supabase.co"
// Y: VITE_SUPABASE_ANON_KEY="eyJ..."

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Las variables de entorno de Supabase no están configuradas. Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 