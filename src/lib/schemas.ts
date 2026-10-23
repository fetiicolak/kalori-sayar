import { z } from 'zod'

export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack'])
export const foodSourceSchema = z.enum(['usda', 'open_food_facts', 'user', 'curated', 'ai_estimate'])

const macroSchema = {
  calories: z.number().finite().min(0).max(20_000),
  protein: z.number().finite().min(0).max(2_000),
  carbs: z.number().finite().min(0).max(5_000),
  fat: z.number().finite().min(0).max(2_000)
}

export const draftFoodItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(160),
  amountGrams: z.number().finite().positive().max(10_000),
  ...macroSchema,
  sourceType: foodSourceSchema,
  sourceRef: z.string().max(200).nullish(),
  sourceFetchedAt: z.string().datetime().nullish(),
  aiConfidence: z.number().min(0).max(1).nullish(),
  userModified: z.boolean().optional()
})

export const aiAnalysisSchema = z.object({
  items: z.array(draftFoodItemSchema).min(1).max(20),
  model: z.string().min(1),
  warning: z.string().min(1)
})

export const foodSearchResultSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  amountGrams: z.literal(100),
  ...macroSchema,
  sourceType: foodSourceSchema,
  sourceRef: z.string().min(1),
  sourceFetchedAt: z.string().datetime()
})

export const foodSearchResponseSchema = z.object({ results: z.array(foodSearchResultSchema).max(25) })
