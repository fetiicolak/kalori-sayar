import type { FoodEntry } from '../types/domain'

function escapeCsv(value: string | number | null | undefined): string {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function entriesToCsv(entries: FoodEntry[]): string {
  const header = [
    'tarih',
    'ogun',
    'besin',
    'gram',
    'kalori',
    'protein',
    'karbonhidrat',
    'yag',
    'kaynak',
    'kaynak_kaydi'
  ]
  const rows = entries.flatMap((entry) =>
    entry.items.map((item) => [
      entry.consumedAt,
      entry.mealType,
      item.name,
      item.amountGrams,
      item.calories,
      item.protein,
      item.carbs,
      item.fat,
      item.sourceType,
      item.sourceRef
    ])
  )

  return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
}

export function downloadText(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
