import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[family-tree] Missing Supabase env vars.\n' +
    'Copy .env.example → .env.local and fill in your Project URL + anon key.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
