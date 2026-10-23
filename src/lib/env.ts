import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(20).optional(),
  VITE_API_BASE_URL: z.string().optional().default('')
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  console.error('Ortam değişkenleri geçersiz.', parsed.error.flatten().fieldErrors)
}

export const env = parsed.success
  ? parsed.data
  : { VITE_SUPABASE_URL: undefined, VITE_SUPABASE_PUBLISHABLE_KEY: undefined, VITE_API_BASE_URL: '' }

export const isSupabaseConfigured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY)
