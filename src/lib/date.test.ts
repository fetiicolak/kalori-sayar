import { describe, expect, it } from 'vitest'
import { fromDateKey, shiftDateKey, toDateKey } from './date'

describe('local date helpers', () => {
  it('round trips a local date key', () => {
    expect(toDateKey(fromDateKey('2026-10-23'))).toBe('2026-10-23')
  })

  it('moves across month boundaries', () => {
    expect(shiftDateKey('2026-10-31', 1)).toBe('2026-11-01')
    expect(shiftDateKey('2026-11-01', -1)).toBe('2026-10-31')
  })
})
