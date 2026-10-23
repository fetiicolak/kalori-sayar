import { useState, type FormEvent } from 'react'
import type { NutritionGoal } from '../types/domain'

export function GoalDialog({ goal, onClose, onSave }: { goal: NutritionGoal | null; onClose: () => void; onSave: (values: Pick<NutritionGoal, 'calories' | 'protein' | 'carbs' | 'fat'>) => Promise<void> }) {
  const [values, setValues] = useState({
    calories: goal?.calories ?? 2000,
    protein: goal?.protein ?? 120,
    carbs: goal?.carbs ?? 230,
    fat: goal?.fat ?? 65
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try { await onSave(values); onClose() } catch (caught) { setError(caught instanceof Error ? caught.message : 'Hedef kaydedilemedi.') } finally { setBusy(false) }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="goal-title">
      <header className="modal-header"><div><p className="eyebrow">GÜNLÜK PLAN</p><h2 id="goal-title">Hedeflerini düzenle</h2></div><button className="icon-button" onClick={onClose} aria-label="Pencereyi kapat">×</button></header>
      <form onSubmit={(event) => void submit(event)} className="stack-lg">
        <div className="form-grid two">
          {Object.entries({ calories: 'Kalori (kcal)', protein: 'Protein (g)', carbs: 'Karbonhidrat (g)', fat: 'Yağ (g)' }).map(([key, label]) => <label key={key}>{label}<input type="number" min={0} step={key === 'calories' ? 1 : 0.1} value={values[key as keyof typeof values]} onChange={(event) => setValues((current) => ({ ...current, [key]: Number(event.target.value) }))} required /></label>)}
        </div>
        {error && <div className="notice error" role="alert">{error}</div>}
        <footer className="modal-actions"><button type="button" className="button ghost" onClick={onClose}>Vazgeç</button><button className="button primary" disabled={busy}>{busy ? 'Kaydediliyor…' : 'Hedefi kaydet'}</button></footer>
      </form>
    </section>
  </div>
}
