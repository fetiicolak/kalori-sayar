import { describe, expect, it } from 'vitest'
import { aiAnalysisSchema } from './schemas'

describe('AI response validation', () => {
  it('accepts a bounded and sourced estimate', () => {
    const result = aiAnalysisSchema.safeParse({
      model: 'test-model',
      warning: 'Yaklaşık sonuç',
      items: [{
        id: '1', name: 'Menemen', amountGrams: 250, calories: 320, protein: 18, carbs: 12, fat: 22,
        sourceType: 'ai_estimate', sourceRef: 'test-model', aiConfidence: 0.7, userModified: false
      }]
    })
    expect(result.success).toBe(true)
  })

  it('rejects impossible or unbounded values', () => {
    const result = aiAnalysisSchema.safeParse({
      model: 'test-model', warning: 'x',
      items: [{ id: '1', name: '', amountGrams: -1, calories: 99_999, protein: 0, carbs: 0, fat: 0, sourceType: 'ai_estimate' }]
    })
    expect(result.success).toBe(false)
  })
})
