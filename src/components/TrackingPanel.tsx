import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState, type FormEvent } from 'react'
import { estimateDailyEnergy, type ActivityLevel, type BiologicalSex } from '../lib/energy'
import { addWater, addWeight, fetchRecentWeights, fetchWaterForDay } from '../services/tracking-repository'

export function TrackingPanel({ userId, dateKey, onUseEnergyGoal }: { userId: string; dateKey: string; onUseEnergyGoal: (calories: number) => Promise<void> }) {
  const queryClient = useQueryClient()
  const waterQuery = useQuery({ queryKey: ['water', userId, dateKey], queryFn: () => fetchWaterForDay(dateKey) })
  const weightQuery = useQuery({ queryKey: ['weights', userId], queryFn: fetchRecentWeights })
  const [weight, setWeight] = useState('')
  const [showCalculator, setShowCalculator] = useState(false)
  const [busy, setBusy] = useState(false)
  const [calculator, setCalculator] = useState({ sex: 'male' as BiologicalSex, age: 25, heightCm: 175, weightKg: 70, activity: 'moderate' as ActivityLevel })
  const estimatedEnergy = estimateDailyEnergy(calculator)
  const waterTotal = (waterQuery.data ?? []).reduce((sum, entry) => sum + entry.milliliters, 0)
  const weights = useMemo(() => weightQuery.data ?? [], [weightQuery.data])

  const chartPoints = useMemo(() => {
    if (weights.length < 2) return ''
    const values = weights.map((entry) => entry.kilograms)
    const min = Math.min(...values) - 0.5
    const max = Math.max(...values) + 0.5
    return weights.map((entry, index) => {
      const x = (index / Math.max(1, weights.length - 1)) * 100
      const y = 42 - ((entry.kilograms - min) / Math.max(1, max - min)) * 36
      return `${x},${y}`
    }).join(' ')
  }, [weights])

  async function quickWater(milliliters: number) {
    setBusy(true)
    try { await addWater(userId, milliliters); await queryClient.invalidateQueries({ queryKey: ['water', userId, dateKey] }) } finally { setBusy(false) }
  }

  async function submitWeight(event: FormEvent) {
    event.preventDefault()
    const kilograms = Number(weight)
    if (!kilograms) return
    setBusy(true)
    try { await addWeight(userId, kilograms); setWeight(''); await queryClient.invalidateQueries({ queryKey: ['weights', userId] }) } finally { setBusy(false) }
  }

  return <section className="tracking-section">
    <div className="section-heading"><div><p className="eyebrow">TAKİP</p><h2>Su ve kilo</h2></div><button className="text-button" onClick={() => setShowCalculator((value) => !value)}>Enerji ihtiyacını hesapla</button></div>
    <div className="tracking-grid">
      <article className="tracking-card water-card">
        <div className="tracking-icon">◒</div><div><span>Bugünkü su</span><strong>{(waterTotal / 1000).toFixed(2)} L</strong><small>2.00 L günlük referans</small></div>
        <div className="water-actions"><button disabled={busy} onClick={() => void quickWater(250)}>+ 250 ml</button><button disabled={busy} onClick={() => void quickWater(500)}>+ 500 ml</button></div>
      </article>
      <article className="tracking-card weight-card">
        <div className="weight-summary"><div><span>Son kilo</span><strong>{weights.at(-1)?.kilograms.toFixed(1) ?? '—'} kg</strong><small>{weights.length ? `${weights.length} ölçüm` : 'İlk ölçümünü ekle'}</small></div>{chartPoints && <svg viewBox="0 0 100 46" role="img" aria-label="Son kilo ölçümleri"><polyline points={chartPoints} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg>}</div>
        <form className="weight-form" onSubmit={(event) => void submitWeight(event)}><input type="number" min="20" max="500" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="kg" aria-label="Yeni kilo ölçümü" /><button disabled={busy || !weight}>Ekle</button></form>
      </article>
    </div>

    {showCalculator && <article className="calculator-card">
      <div><p className="eyebrow">MİFFLİN–ST JEOR</p><h3>Yaklaşık günlük enerji ihtiyacı</h3><p className="muted">Bu hesap tıbbi tavsiye değildir; başlangıç hedefi belirlemek için yaklaşık bir değerdir.</p></div>
      <div className="calculator-fields">
        <label>Cinsiyet<select value={calculator.sex} onChange={(event) => setCalculator((current) => ({ ...current, sex: event.target.value as BiologicalSex }))}><option value="male">Erkek</option><option value="female">Kadın</option></select></label>
        <label>Yaş<input type="number" min="15" max="100" value={calculator.age} onChange={(event) => setCalculator((current) => ({ ...current, age: Number(event.target.value) }))} /></label>
        <label>Boy (cm)<input type="number" min="100" max="250" value={calculator.heightCm} onChange={(event) => setCalculator((current) => ({ ...current, heightCm: Number(event.target.value) }))} /></label>
        <label>Kilo (kg)<input type="number" min="20" max="500" value={calculator.weightKg} onChange={(event) => setCalculator((current) => ({ ...current, weightKg: Number(event.target.value) }))} /></label>
        <label>Aktivite<select value={calculator.activity} onChange={(event) => setCalculator((current) => ({ ...current, activity: event.target.value as ActivityLevel }))}><option value="sedentary">Hareketsiz</option><option value="light">Hafif aktif</option><option value="moderate">Orta aktif</option><option value="active">Aktif</option><option value="veryActive">Çok aktif</option></select></label>
      </div>
      <div className="energy-result"><div><strong>{estimatedEnergy}</strong><span>kcal / gün</span></div><button className="button secondary" onClick={() => void onUseEnergyGoal(estimatedEnergy)}>Kalori hedefi olarak kullan</button></div>
    </article>}
  </section>
}
