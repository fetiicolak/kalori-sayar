import { dateKeyToUtcRange } from '../lib/date'
import {
  cacheDailyEntries,
  enqueueOperation,
  getCachedDailyEntries,
  getPendingOperations,
  removePendingOperation
} from '../lib/offline-db'
import { requireSupabase } from '../lib/supabase'
import type { DraftFoodItem, FoodEntry, FoodItem, MealType, NutritionGoal } from '../types/domain'
import { z } from 'zod'

interface EntryRow {
  id: string
  user_id: string
  consumed_at: string
  meal_type: MealType
  note: string | null
  created_at: string
  updated_at: string
  food_entry_items: ItemRow[]
}

interface ItemRow {
  id: string
  entry_id: string
  user_id: string
  position: number
  name: string
  amount_grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  source_type: FoodItem['sourceType']
  source_ref: string | null
  source_fetched_at: string | null
  ai_confidence: number | null
  user_modified: boolean
}

const goalRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  valid_from: z.string(),
  valid_to: z.string().nullable(),
  calories: z.coerce.number(),
  protein: z.coerce.number(),
  carbs: z.coerce.number(),
  fat: z.coerce.number()
})

function mapGoal(value: unknown): NutritionGoal {
  const row = goalRowSchema.parse(value)
  return {
    id: row.id,
    userId: row.user_id,
    validFrom: row.valid_from,
    validTo: row.valid_to,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat
  }
}

function mapItem(row: ItemRow): FoodItem {
  return {
    id: row.id,
    entryId: row.entry_id,
    userId: row.user_id,
    position: row.position,
    name: row.name,
    amountGrams: Number(row.amount_grams),
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    sourceFetchedAt: row.source_fetched_at,
    aiConfidence: row.ai_confidence === null ? null : Number(row.ai_confidence),
    userModified: row.user_modified
  }
}

function mapEntry(row: EntryRow): FoodEntry {
  return {
    id: row.id,
    userId: row.user_id,
    consumedAt: row.consumed_at,
    mealType: row.meal_type,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: [...row.food_entry_items].sort((a, b) => a.position - b.position).map(mapItem),
    syncState: 'synced'
  }
}

export async function fetchEntriesForDay(userId: string, dateKey: string): Promise<FoodEntry[]> {
  const client = requireSupabase()
  const { start, end } = dateKeyToUtcRange(dateKey)
  const { data, error } = await client
    .from('food_entries')
    .select('*, food_entry_items(*)')
    .gte('consumed_at', start)
    .lt('consumed_at', end)
    .order('consumed_at', { ascending: false })

  if (error) {
    const cached = await getCachedDailyEntries(userId, dateKey)
    if (cached.length > 0 || !navigator.onLine) return cached
    throw error
  }

  const entries = ((data ?? []) as EntryRow[]).map(mapEntry)
  await cacheDailyEntries(userId, dateKey, entries)
  return entries
}

async function persistEntry(entry: FoodEntry): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.rpc('save_food_entry', {
    p_id: entry.id,
    p_consumed_at: entry.consumedAt,
    p_meal_type: entry.mealType,
    p_note: entry.note,
    p_client_updated_at: entry.updatedAt,
    p_items: entry.items.map((item) => ({
      id: item.id,
      position: item.position,
      name: item.name,
      amount_grams: item.amountGrams,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      source_type: item.sourceType,
      source_ref: item.sourceRef,
      source_fetched_at: item.sourceFetchedAt,
      ai_confidence: item.aiConfidence,
      user_modified: item.userModified
    }))
  })
  if (error) throw error
}

export async function createEntry(input: {
  userId: string
  consumedAt: string
  mealType: MealType
  note?: string
  items: DraftFoodItem[]
}): Promise<FoodEntry> {
  const now = new Date().toISOString()
  const entryId = crypto.randomUUID()
  const entry: FoodEntry = {
    id: entryId,
    userId: input.userId,
    consumedAt: input.consumedAt,
    mealType: input.mealType,
    note: input.note?.trim() || null,
    createdAt: now,
    updatedAt: now,
    items: input.items.map((item, position) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      entryId,
      userId: input.userId,
      position,
      sourceRef: item.sourceRef ?? null,
      sourceFetchedAt: item.sourceFetchedAt ?? null,
      aiConfidence: item.aiConfidence ?? null,
      userModified: item.userModified ?? false
    })),
    syncState: 'synced'
  }

  try {
    await persistEntry(entry)
  } catch (error) {
    if (navigator.onLine) throw error
    entry.syncState = 'pending'
    await enqueueOperation({
      id: crypto.randomUUID(),
      userId: input.userId,
      type: 'create_entry',
      createdAt: now,
      payload: entry
    })
  }

  return entry
}

export async function updateEntry(input: {
  entry: FoodEntry
  consumedAt: string
  mealType: MealType
  note?: string
  items: DraftFoodItem[]
}): Promise<FoodEntry> {
  const updatedAt = new Date().toISOString()
  const entry: FoodEntry = {
    ...input.entry,
    consumedAt: input.consumedAt,
    mealType: input.mealType,
    note: input.note?.trim() || null,
    updatedAt,
    items: input.items.map((item, position) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      entryId: input.entry.id,
      userId: input.entry.userId,
      position,
      sourceRef: item.sourceRef ?? null,
      sourceFetchedAt: item.sourceFetchedAt ?? null,
      aiConfidence: item.aiConfidence ?? null,
      userModified: true
    })),
    syncState: 'synced'
  }

  try {
    await persistEntry(entry)
  } catch (error) {
    if (navigator.onLine) throw error
    entry.syncState = 'pending'
    await enqueueOperation({
      id: crypto.randomUUID(),
      userId: entry.userId,
      type: 'create_entry',
      createdAt: updatedAt,
      payload: entry
    })
  }
  return entry
}

async function persistDelete(entryId: string): Promise<void> {
  const { error } = await requireSupabase().from('food_entries').delete().eq('id', entryId)
  if (error) throw error
}

export async function deleteEntry(userId: string, entryId: string): Promise<void> {
  try {
    await persistDelete(entryId)
  } catch (error) {
    if (navigator.onLine) throw error
    await enqueueOperation({
      id: crypto.randomUUID(),
      userId,
      type: 'delete_entry',
      createdAt: new Date().toISOString(),
      payload: { entryId }
    })
  }
}

export async function syncPendingOperations(userId: string): Promise<number> {
  const operations = await getPendingOperations(userId)
  let completed = 0

  for (const operation of operations) {
    try {
      if (operation.type === 'create_entry') await persistEntry(operation.payload)
      if (operation.type === 'delete_entry') await persistDelete(operation.payload.entryId)
      await removePendingOperation(operation.id)
      completed += 1
    } catch {
      break
    }
  }

  return completed
}

export async function fetchGoal(dateKey: string): Promise<NutritionGoal | null> {
  const response = await requireSupabase()
    .from('nutrition_goals')
    .select('*')
    .lte('valid_from', dateKey)
    .or(`valid_to.is.null,valid_to.gte.${dateKey}`)
    .order('valid_from', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (response.error) throw response.error
  if (!response.data) return null
  const data: unknown = response.data
  return mapGoal(data)
}

export async function saveGoal(goal: Omit<NutritionGoal, 'id'> & { id?: string }): Promise<NutritionGoal> {
  const response = await requireSupabase()
    .from('nutrition_goals')
    .upsert({
      id: goal.id ?? crypto.randomUUID(),
      user_id: goal.userId,
      valid_from: goal.validFrom,
      valid_to: goal.validTo,
      calories: goal.calories,
      protein: goal.protein,
      carbs: goal.carbs,
      fat: goal.fat
    })
    .select()
    .single()
  if (response.error) throw response.error
  const data: unknown = response.data
  return mapGoal(data)
}

export async function saveConsent(userId: string, version: string, granted: boolean): Promise<void> {
  const { error } = await requireSupabase().from('consents').upsert(
    {
      user_id: userId,
      consent_type: 'gemini_photo_analysis',
      document_version: version,
      granted,
      decided_at: new Date().toISOString()
    },
    { onConflict: 'user_id,consent_type,document_version' }
  )
  if (error) throw error
}
