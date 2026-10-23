import { dateKeyToUtcRange } from '../lib/date'
import { requireSupabase } from '../lib/supabase'
import type { WaterEntry, WeightEntry } from '../types/domain'
import { z } from 'zod'

const waterRowSchema = z.object({
  id: z.string(), user_id: z.string(), consumed_at: z.string(), milliliters: z.coerce.number()
})
const weightRowSchema = z.object({
  id: z.string(), user_id: z.string(), measured_at: z.string(), kilograms: z.coerce.number(), note: z.string().nullable()
})

export async function fetchWaterForDay(dateKey: string): Promise<WaterEntry[]> {
  const { start, end } = dateKeyToUtcRange(dateKey)
  const response = await requireSupabase().from('water_entries').select('*').gte('consumed_at', start).lt('consumed_at', end).order('consumed_at')
  if (response.error) throw response.error
  const data: unknown = response.data
  return z.array(waterRowSchema).parse(data).map((row) => ({ id: row.id, userId: row.user_id, consumedAt: row.consumed_at, milliliters: row.milliliters }))
}

export async function addWater(userId: string, milliliters: number): Promise<WaterEntry> {
  const response = await requireSupabase().from('water_entries').insert({ user_id: userId, consumed_at: new Date().toISOString(), milliliters }).select().single()
  if (response.error) throw response.error
  const data: unknown = response.data
  const row = waterRowSchema.parse(data)
  return { id: row.id, userId: row.user_id, consumedAt: row.consumed_at, milliliters: row.milliliters }
}

export async function fetchRecentWeights(): Promise<WeightEntry[]> {
  const response = await requireSupabase().from('weight_entries').select('*').order('measured_at', { ascending: false }).limit(30)
  if (response.error) throw response.error
  const data: unknown = response.data
  return z.array(weightRowSchema).parse(data).map((row) => ({ id: row.id, userId: row.user_id, measuredAt: row.measured_at, kilograms: row.kilograms, note: row.note })).reverse()
}

export async function addWeight(userId: string, kilograms: number, note = ''): Promise<WeightEntry> {
  const response = await requireSupabase().from('weight_entries').insert({ user_id: userId, measured_at: new Date().toISOString(), kilograms, note: note.trim() || null }).select().single()
  if (response.error) throw response.error
  const data: unknown = response.data
  const row = weightRowSchema.parse(data)
  return { id: row.id, userId: row.user_id, measuredAt: row.measured_at, kilograms: row.kilograms, note: row.note }
}
