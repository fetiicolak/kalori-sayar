import { createClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from './env'

export const supabase = isSupabaseConfigured
  ? createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_PUBLISHABLE_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase bağlantısı henüz yapılandırılmadı.')
  }

  return supabase
}
