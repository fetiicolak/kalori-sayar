import type { DailySummary, DraftFoodItem, MacroValues } from '../types/domain'

const round = (value: number, digits = 1) => {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function scaleMacros(per100Grams: MacroValues, amountGrams: number): MacroValues {
  const multiplier = Math.max(0, amountGrams) / 100

  return {
    calories: round(per100Grams.calories * multiplier, 0),
    protein: round(per100Grams.protein * multiplier),
    carbs: round(per100Grams.carbs * multiplier),
    fat: round(per100Grams.fat * multiplier)
  }
}

export function sumMacros(items: MacroValues[]): MacroValues {
  const total = items.reduce<MacroValues>(
    (total, item) => ({
      calories: total.calories + item.calories,
      protein: total.protein + item.protein,
      carbs: total.carbs + item.carbs,
      fat: total.fat + item.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return {
    calories: round(total.calories, 0),
    protein: round(total.protein),
    carbs: round(total.carbs),
    fat: round(total.fat)
  }
}

export function buildDailySummary(entries: Array<{ items: DraftFoodItem[] }>): DailySummary {
  return {
    ...sumMacros(entries.flatMap((entry) => entry.items)),
    entryCount: entries.length
  }
}

export function macroPercent(value: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((value / target) * 100)))
}
