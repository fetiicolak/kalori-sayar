export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type FoodSource = 'usda' | 'open_food_facts' | 'user' | 'curated' | 'ai_estimate'

export interface MacroValues {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface FoodItem extends MacroValues {
  id: string
  entryId: string
  userId: string
  position: number
  name: string
  amountGrams: number
  sourceType: FoodSource
  sourceRef: string | null
  sourceFetchedAt: string | null
  aiConfidence: number | null
  userModified: boolean
}

export interface FoodEntry {
  id: string
  userId: string
  consumedAt: string
  mealType: MealType
  note: string | null
  createdAt: string
  updatedAt: string
  items: FoodItem[]
  syncState?: 'synced' | 'pending' | 'error'
}

export interface NutritionGoal extends MacroValues {
  id: string
  userId: string
  validFrom: string
  validTo: string | null
}

export interface DraftFoodItem extends MacroValues {
  id: string
  name: string
  amountGrams: number
  sourceType: FoodSource
  sourceRef?: string | null
  sourceFetchedAt?: string | null
  aiConfidence?: number | null
  userModified?: boolean
}

export interface FoodSearchResult extends MacroValues {
  id: string
  name: string
  description?: string
  amountGrams: 100
  sourceType: FoodSource
  sourceRef: string
  sourceFetchedAt: string
}

export interface DailySummary extends MacroValues {
  entryCount: number
}

export interface Profile {
  id: string
  displayName: string | null
  timezone: string
  units: 'metric'
}

export interface AiAnalysisResult {
  items: DraftFoodItem[]
  model: string
  warning: string
}

export interface WaterEntry {
  id: string
  userId: string
  consumedAt: string
  milliliters: number
}

export interface WeightEntry {
  id: string
  userId: string
  measuredAt: string
  kilograms: number
  note: string | null
}
