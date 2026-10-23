export type BiologicalSex = 'female' | 'male'

const activityFactors = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9
} as const

export type ActivityLevel = keyof typeof activityFactors

export function estimateDailyEnergy(input: {
  sex: BiologicalSex
  age: number
  heightCm: number
  weightKg: number
  activity: ActivityLevel
}): number {
  const sexConstant = input.sex === 'male' ? 5 : -161
  const basal = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + sexConstant
  return Math.round(basal * activityFactors[input.activity])
}
