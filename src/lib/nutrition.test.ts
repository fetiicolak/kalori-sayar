import { describe, expect, it } from 'vitest'
import { macroPercent, scaleMacros, sumMacros } from './nutrition'

describe('nutrition calculations', () => {
  it('scales per-100g values without floating point noise', () => {
    expect(scaleMacros({ calories: 250, protein: 10, carbs: 30, fat: 8 }, 150)).toEqual({
      calories: 375,
      protein: 15,
      carbs: 45,
      fat: 12
    })
  })

  it('never returns negative values for a negative amount', () => {
    expect(scaleMacros({ calories: 100, protein: 5, carbs: 10, fat: 2 }, -10)).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    })
  })

  it('sums and rounds macro values', () => {
    expect(sumMacros([
      { calories: 100.4, protein: 1.25, carbs: 2.34, fat: 3.45 },
      { calories: 50.4, protein: 2.25, carbs: 3.26, fat: 4.15 }
    ])).toEqual({ calories: 151, protein: 3.5, carbs: 5.6, fat: 7.6 })
  })

  it('caps macro progress at 100 percent', () => {
    expect(macroPercent(150, 100)).toBe(100)
    expect(macroPercent(10, 0)).toBe(0)
  })
})
