import { describe, expect, it } from 'vitest'
import { estimateDailyEnergy } from './energy'

describe('energy estimation', () => {
  it('uses the Mifflin-St Jeor equation and activity multiplier', () => {
    expect(estimateDailyEnergy({ sex: 'male', age: 30, heightCm: 180, weightKg: 80, activity: 'moderate' })).toBe(2759)
    expect(estimateDailyEnergy({ sex: 'female', age: 30, heightCm: 165, weightKg: 60, activity: 'sedentary' })).toBe(1584)
  })
})
