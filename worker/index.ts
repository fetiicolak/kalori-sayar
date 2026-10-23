import { z } from 'zod'

interface Env {
  ASSETS: Fetcher
  SUPABASE_URL: string
  SUPABASE_PUBLISHABLE_KEY: string
  GEMINI_API_KEY: string
  USDA_API_KEY: string
  GEMINI_MODEL: string
  ALLOWED_ORIGINS: string
}

interface AuthUser {
  id: string
}

const textRequestSchema = z.object({ text: z.string().trim().min(2).max(1_000) })

const geminiItemSchema = z.object({
  name: z.string().trim().min(1).max(160),
  amountGrams: z.number().positive().max(10_000),
  calories: z.number().min(0).max(20_000),
  protein: z.number().min(0).max(2_000),
  carbs: z.number().min(0).max(5_000),
  fat: z.number().min(0).max(2_000),
  confidence: z.number().min(0).max(1)
})

const geminiResultSchema = z.object({ items: z.array(geminiItemSchema).min(1).max(20) })

const requestWindows = new Map<string, { count: number; resetAt: number }>()

function json(data: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  })
}

function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin')
  if (!origin) return null
  const allowed = env.ALLOWED_ORIGINS.split(',').map((value) => value.trim())
  return allowed.includes(origin) ? origin : null
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = allowedOrigin(request, env)
  return origin
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        Vary: 'Origin'
      }
    : {}
}

function securityHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()')
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self' https://*.supabase.co; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'")
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

async function authenticate(request: Request, env: Env): Promise<AuthUser | null> {
  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return null

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: authorization,
      apikey: env.SUPABASE_PUBLISHABLE_KEY
    }
  })
  if (!response.ok) return null
  const body = await response.json<{ id?: unknown }>()
  return typeof body.id === 'string' ? { id: body.id } : null
}

function allowRequest(userId: string, limit = 20, durationMs = 60_000): boolean {
  const now = Date.now()
  const window = requestWindows.get(userId)
  if (!window || window.resetAt <= now) {
    requestWindows.set(userId, { count: 1, resetAt: now + durationMs })
    return true
  }
  if (window.count >= limit) return false
  window.count += 1
  return true
}

async function callGemini(
  env: Env,
  parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>
): Promise<z.infer<typeof geminiResultSchema>> {
  if (!env.GEMINI_API_KEY) throw new Error('Gemini API anahtarı yapılandırılmadı.')

  const prompt = `Sen bir yemek tanıma yardımcısısın. Verilen açıklama veya fotoğraftaki yenebilir öğeleri ayrı ayrı belirle. Her öğe için Türkçe kısa ad, tahmini gram, kalori, protein, karbonhidrat ve yağ değerlerini ver. Değerler tüketilen miktarın tamamı için olmalı. Emin olmadığın durumda güven değerini düşür. Tıbbi tavsiye verme. Yalnızca istenen JSON yapısını döndür.`
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: prompt }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseJsonSchema: {
            type: 'object',
            required: ['items'],
            properties: {
              items: {
                type: 'array',
                minItems: 1,
                maxItems: 20,
                items: {
                  type: 'object',
                  required: ['name', 'amountGrams', 'calories', 'protein', 'carbs', 'fat', 'confidence'],
                  properties: {
                    name: { type: 'string' },
                    amountGrams: { type: 'number', minimum: 1 },
                    calories: { type: 'number', minimum: 0 },
                    protein: { type: 'number', minimum: 0 },
                    carbs: { type: 'number', minimum: 0 },
                    fat: { type: 'number', minimum: 0 },
                    confidence: { type: 'number', minimum: 0, maximum: 1 }
                  }
                }
              }
            }
          }
        }
      })
    }
  )

  if (response.status === 429) throw new Error('Ücretsiz AI kotası şu anda dolu. Manuel giriş kullanabilirsiniz.')
  if (!response.ok) throw new Error('Yemek analizi şu anda tamamlanamadı.')

  const body = await response.json<{
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }>()
  const text = body.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('AI geçerli bir sonuç döndürmedi.')
  return geminiResultSchema.parse(JSON.parse(text))
}

function analysisResponse(result: z.infer<typeof geminiResultSchema>, model: string) {
  return {
    items: result.items.map((item) => ({
      id: crypto.randomUUID(),
      name: item.name,
      amountGrams: item.amountGrams,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      sourceType: 'ai_estimate',
      sourceRef: model,
      sourceFetchedAt: new Date().toISOString(),
      aiConfidence: item.confidence,
      userModified: false
    })),
    model,
    warning: 'Fotoğraf ve metin analizi yaklaşık sonuç üretir. Kaydetmeden önce miktarları ve değerleri kontrol edin.'
  }
}

async function handleText(request: Request, env: Env): Promise<Response> {
  const parsed = textRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return json({ error: 'Yemek açıklaması 2–1000 karakter olmalıdır.' }, 400)
  const result = await callGemini(env, [{ text: parsed.data.text }])
  return json(analysisResponse(result, env.GEMINI_MODEL))
}

async function handlePhoto(request: Request, env: Env): Promise<Response> {
  const contentLength = Number(request.headers.get('Content-Length') ?? 0)
  if (contentLength > 6_500_000) return json({ error: 'Fotoğraf en fazla 6 MB olabilir.' }, 413)
  const formData = await request.formData()
  const photo = formData.get('photo')
  if (!(photo instanceof File)) return json({ error: 'Fotoğraf bulunamadı.' }, 400)
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) {
    return json({ error: 'Yalnızca JPEG, PNG veya WebP görselleri desteklenir.' }, 415)
  }
  if (photo.size > 6_000_000) return json({ error: 'Fotoğraf en fazla 6 MB olabilir.' }, 413)

  const bytes = new Uint8Array(await photo.arrayBuffer())
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  const result = await callGemini(env, [
    { text: 'Bu öğünde görünen yiyecekleri ve tüketilebilir porsiyonlarını analiz et.' },
    { inlineData: { mimeType: photo.type, data: btoa(binary) } }
  ])
  return json(analysisResponse(result, env.GEMINI_MODEL))
}

interface UsdaFood {
  fdcId?: number
  description?: string
  foodCategory?: string
  foodNutrients?: Array<{ nutrientName?: string; value?: number; unitName?: string }>
}

function nutrient(food: UsdaFood, names: string[]): number {
  const match = food.foodNutrients?.find((item) => item.nutrientName && names.includes(item.nutrientName))
  return typeof match?.value === 'number' ? match.value : 0
}

async function handleFoodSearch(request: Request, env: Env): Promise<Response> {
  const query = new URL(request.url).searchParams.get('q')?.trim()
  if (!query || query.length < 2 || query.length > 120) return json({ error: 'Arama 2–120 karakter olmalıdır.' }, 400)
  if (!env.USDA_API_KEY) return json({ error: 'USDA API anahtarı yapılandırılmadı.' }, 503)

  const response = await fetch('https://api.nal.usda.gov/fdc/v1/foods/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: env.USDA_API_KEY, query, pageSize: 12, dataType: ['Foundation', 'SR Legacy'] })
  })
  if (!response.ok) throw new Error('Besin veritabanına şu anda ulaşılamıyor.')
  const body = await response.json<{ foods?: UsdaFood[] }>()
  const fetchedAt = new Date().toISOString()
  const results = (body.foods ?? []).flatMap((food) => {
    if (!food.fdcId || !food.description) return []
    return [
      {
        id: `usda-${food.fdcId}`,
        name: food.description,
        description: food.foodCategory,
        amountGrams: 100,
        calories: nutrient(food, ['Energy']),
        protein: nutrient(food, ['Protein']),
        carbs: nutrient(food, ['Carbohydrate, by difference']),
        fat: nutrient(food, ['Total lipid (fat)']),
        sourceType: 'usda',
        sourceRef: String(food.fdcId),
        sourceFetchedAt: fetchedAt
      }
    ]
  })
  return json({ results })
}

interface OffProduct {
  product_name_tr?: string
  product_name?: string
  brands?: string
  nutriments?: {
    'energy-kcal_100g'?: number
    proteins_100g?: number
    carbohydrates_100g?: number
    fat_100g?: number
  }
}

async function handleBarcode(request: Request): Promise<Response> {
  const barcode = new URL(request.url).pathname.split('/').at(-1) ?? ''
  if (!/^\d{8,14}$/.test(barcode)) return json({ error: 'Barkod 8–14 rakam olmalıdır.' }, 400)
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
    headers: { 'User-Agent': 'KaloriSayar/0.1 (https://github.com/fetiicolak/kalori-sayar)' }
  })
  if (!response.ok) throw new Error('Open Food Facts servisine şu anda ulaşılamıyor.')
  const body = await response.json<{ status?: number; product?: OffProduct }>()
  if (body.status !== 1 || !body.product) return json({ error: 'Bu barkod Open Food Facts veritabanında bulunamadı.' }, 404)
  const product = body.product
  const name = product.product_name_tr || product.product_name
  if (!name) return json({ error: 'Ürünün adı eksik.' }, 422)

  return json({
    id: `off-${barcode}`,
    name,
    description: product.brands,
    amountGrams: 100,
    calories: Number(product.nutriments?.['energy-kcal_100g'] ?? 0),
    protein: Number(product.nutriments?.proteins_100g ?? 0),
    carbs: Number(product.nutriments?.carbohydrates_100g ?? 0),
    fat: Number(product.nutriments?.fat_100g ?? 0),
    sourceType: 'open_food_facts',
    sourceRef: barcode,
    sourceFetchedAt: new Date().toISOString()
  })
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const headers = corsHeaders(request, env)
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.headers.get('Origin') && !allowedOrigin(request, env)) return json({ error: 'İzin verilmeyen kaynak.' }, 403)

  const user = await authenticate(request, env)
  if (!user) return json({ error: 'Oturum doğrulanamadı.' }, 401, headers)
  if (!allowRequest(user.id)) return json({ error: 'Çok fazla istek gönderdiniz. Bir dakika sonra tekrar deneyin.' }, 429, headers)

  const url = new URL(request.url)
  try {
    let response: Response
    if (request.method === 'GET' && url.pathname === '/api/foods/search') response = await handleFoodSearch(request, env)
    else if (request.method === 'GET' && url.pathname.startsWith('/api/foods/barcode/')) response = await handleBarcode(request)
    else if (request.method === 'POST' && url.pathname === '/api/analyze/text') response = await handleText(request, env)
    else if (request.method === 'POST' && url.pathname === '/api/analyze/photo') response = await handlePhoto(request, env)
    else response = json({ error: 'Uç nokta bulunamadı.' }, 404)

    const responseHeaders = new Headers(response.headers)
    new Headers(headers).forEach((value, key) => responseHeaders.set(key, value))
    return new Response(response.body, { status: response.status, headers: responseHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.'
    return json({ error: message }, 500, headers)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) return securityHeaders(await handleApi(request, env))
    return securityHeaders(await env.ASSETS.fetch(request))
  }
} satisfies ExportedHandler<Env>
