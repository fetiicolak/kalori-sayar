import { env } from '../lib/env'
import { aiAnalysisSchema, foodSearchResponseSchema, foodSearchResultSchema } from '../lib/schemas'
import { requireSupabase } from '../lib/supabase'
import type { AiAnalysisResult, FoodSearchResult } from '../types/domain'

async function authorizedFetch(path: string, init?: RequestInit): Promise<Response> {
  const client = requireSupabase()
  const { data } = await client.auth.getSession()
  const token = data.session?.access_token

  if (!token) throw new Error('Bu işlem için yeniden giriş yapmalısınız.')

  return fetch(`${env.VITE_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`
    }
  })
}

async function parseResponse(response: Response): Promise<unknown> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null
  if (!response.ok) {
    throw new Error(body?.error ?? 'İstek tamamlanamadı. Lütfen tekrar deneyin.')
  }
  return body
}

export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  const response = await authorizedFetch(`/api/foods/search?q=${encodeURIComponent(query)}`)
  return foodSearchResponseSchema.parse(await parseResponse(response)).results
}

export async function lookupBarcode(barcode: string): Promise<FoodSearchResult> {
  const response = await authorizedFetch(`/api/foods/barcode/${encodeURIComponent(barcode)}`)
  return foodSearchResultSchema.parse(await parseResponse(response))
}

export async function analyzeText(text: string): Promise<AiAnalysisResult> {
  const response = await authorizedFetch('/api/analyze/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  return aiAnalysisSchema.parse(await parseResponse(response))
}

export async function analyzePhoto(file: Blob): Promise<AiAnalysisResult> {
  const formData = new FormData()
  formData.set('photo', file, 'meal.jpg')
  const response = await authorizedFetch('/api/analyze/photo', { method: 'POST', body: formData })
  return aiAnalysisSchema.parse(await parseResponse(response))
}

export async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Görsel işleme bu tarayıcıda kullanılamıyor.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Fotoğraf küçültülemedi.'))),
      'image/jpeg',
      quality
    )
  })
}
