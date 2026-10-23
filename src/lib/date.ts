export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1, 12)
}

export function shiftDateKey(dateKey: string, days: number): string {
  const date = fromDateKey(dateKey)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

export function dateKeyToUtcRange(dateKey: string): { start: string; end: string } {
  const start = fromDateKey(dateKey)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function formatLongDate(dateKey: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(fromDateKey(dateKey))
}

export function localDateTimeToIso(dateKey: string, time: string): string {
  return new Date(`${dateKey}T${time}:00`).toISOString()
}
