import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { dateKeyToUtcRange, formatLongDate, localDateTimeToIso, shiftDateKey, toDateKey } from '../lib/date'
import { downloadText, entriesToCsv } from '../lib/export'
import { sumMacros } from '../lib/nutrition'
import { pendingOperationCount } from '../lib/offline-db'
import { createEntry, deleteEntry, fetchEntriesForDay, fetchGoal, saveGoal, syncPendingOperations, updateEntry } from '../services/food-repository'
import type { DraftFoodItem, FoodEntry, NutritionGoal } from '../types/domain'
import { AddMealDialog } from './AddMealDialog'
import { EntryCard } from './EntryCard'
import { GoalDialog } from './GoalDialog'
import { MacroProgress } from './MacroProgress'
import { TrackingPanel } from './TrackingPanel'

const fallbackGoal = { calories: 2000, protein: 120, carbs: 230, fat: 65 }

export function Dashboard() {
  const { user, signOut } = useAuth()
  const queryClient = useQueryClient()
  const [dateKey, setDateKey] = useState(toDateKey(new Date()))
  const [showAdd, setShowAdd] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [showGoal, setShowGoal] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const userId = user!.id
  const entriesQuery = useQuery({
    queryKey: ['entries', userId, dateKey],
    queryFn: () => fetchEntriesForDay(userId, dateKey)
  })
  const goalQuery = useQuery({ queryKey: ['goal', userId, dateKey], queryFn: () => fetchGoal(dateKey) })

  const entries = useMemo(() => entriesQuery.data ?? [], [entriesQuery.data])
  const summary = useMemo(() => sumMacros(entries.flatMap((entry) => entry.items)), [entries])
  const goal = goalQuery.data ?? null
  const targets = goal ?? fallbackGoal
  const caloriePercent = Math.min(100, Math.round((summary.calories / targets.calories) * 100))
  const remaining = Math.round(targets.calories - summary.calories)

  useEffect(() => {
    const updateNetwork = async () => {
      setOnline(navigator.onLine)
      if (navigator.onLine) {
        const synced = await syncPendingOperations(userId)
        if (synced > 0) {
          setToast(`${synced} çevrimdışı işlem eşitlendi.`)
          await queryClient.invalidateQueries({ queryKey: ['entries', userId] })
        }
      }
      setPendingCount(await pendingOperationCount(userId))
    }
    const handleNetworkChange = () => void updateNetwork()
    window.addEventListener('online', handleNetworkChange)
    window.addEventListener('offline', handleNetworkChange)
    void updateNetwork()
    return () => {
      window.removeEventListener('online', handleNetworkChange)
      window.removeEventListener('offline', handleNetworkChange)
    }
  }, [queryClient, userId])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  async function addEntry(input: { mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; time: string; note: string; items: DraftFoodItem[] }) {
    const entry = editingEntry
      ? await updateEntry({
          entry: editingEntry,
          consumedAt: localDateTimeToIso(dateKey, input.time),
          mealType: input.mealType,
          note: input.note,
          items: input.items
        })
      : await createEntry({
          userId,
          consumedAt: localDateTimeToIso(dateKey, input.time),
          mealType: input.mealType,
          note: input.note,
          items: input.items
        })
    queryClient.setQueryData(['entries', userId, dateKey], editingEntry ? entries.map((current) => current.id === entry.id ? entry : current) : [entry, ...entries])
    setPendingCount(await pendingOperationCount(userId))
    setEditingEntry(null)
    setToast(entry.syncState === 'pending' ? 'Çevrimdışı kaydedildi; bağlantıda eşitlenecek.' : editingEntry ? 'Öğün güncellendi.' : 'Öğün kaydedildi.')
  }

  async function removeEntry(id: string) {
    if (!window.confirm('Bu öğünü silmek istediğinize emin misiniz?')) return
    await deleteEntry(userId, id)
    queryClient.setQueryData(['entries', userId, dateKey], entries.filter((entry) => entry.id !== id))
    setPendingCount(await pendingOperationCount(userId))
    setToast('Öğün silindi.')
  }

  async function updateGoal(values: Pick<NutritionGoal, 'calories' | 'protein' | 'carbs' | 'fat'>) {
    const saved = await saveGoal({
      id: goal?.id,
      userId,
      validFrom: goal?.validFrom ?? dateKey,
      validTo: goal?.validTo ?? null,
      ...values
    })
    queryClient.setQueryData(['goal', userId, dateKey], saved)
    setToast('Hedefler güncellendi.')
  }

  async function useEnergyGoal(calories: number) {
    await updateGoal({ ...targets, calories })
  }

  function exportJson() {
    const { start, end } = dateKeyToUtcRange(dateKey)
    downloadText(`kalori-sayar-${dateKey}.json`, JSON.stringify({ exportedAt: new Date().toISOString(), range: { start, end }, entries }, null, 2), 'application/json')
  }

  function exportCsv() {
    downloadText(`kalori-sayar-${dateKey}.csv`, `\uFEFF${entriesToCsv(entries)}`, 'text/csv;charset=utf-8')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href={import.meta.env.BASE_URL} aria-label="Kalori Sayar ana sayfa"><img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" /><span>Kalori Sayar</span></a>
        <nav aria-label="Hesap işlemleri">
          <span className={`network-pill ${online ? '' : 'offline'}`}>{online ? (pendingCount ? `${pendingCount} bekliyor` : 'Eşitlendi') : 'Çevrimdışı'}</span>
          <button className="button ghost small" onClick={() => void signOut()}>Çıkış</button>
        </nav>
      </header>

      {!online && <div className="offline-banner">İnternet bağlantısı yok. Desteklenen kayıtlar cihazda bekletilecek.</div>}
      <main className="dashboard">
        <section className="hero-row">
          <div>
            <p className="eyebrow">BUGÜNÜN ÖZETİ</p>
            <h1>{formatLongDate(dateKey)}</h1>
            <p className="muted">Küçük kayıtlar, daha net bir gün.</p>
          </div>
          <div className="date-controls">
            <button className="icon-button" onClick={() => setDateKey((current) => shiftDateKey(current, -1))} aria-label="Önceki gün">←</button>
            <input type="date" value={dateKey} onChange={(event) => setDateKey(event.target.value)} aria-label="Takip tarihi" />
            <button className="icon-button" onClick={() => setDateKey((current) => shiftDateKey(current, 1))} aria-label="Sonraki gün">→</button>
          </div>
        </section>

        <section className="summary-grid" aria-label="Günlük besin özeti">
          <article className="calorie-card">
            <div className="calorie-ring" style={{ '--progress': `${caloriePercent * 3.6}deg` } as React.CSSProperties}>
              <div><strong>{Math.round(summary.calories)}</strong><span>/ {Math.round(targets.calories)} kcal</span></div>
            </div>
            <div><p className="eyebrow">KALAN</p><h2 className={remaining < 0 ? 'over' : ''}>{Math.abs(remaining)} kcal</h2><p className="muted">{remaining < 0 ? 'hedefin üzerinde' : 'bugünkü hedefe kadar'}</p></div>
          </article>
          <article className="macro-card">
            <div className="section-heading"><div><p className="eyebrow">MAKROLAR</p><h2>Günlük denge</h2></div><button className="text-button" onClick={() => setShowGoal(true)}>Hedefi düzenle</button></div>
            <MacroProgress label="Protein" value={summary.protein} target={targets.protein} unit="g" tone="protein" />
            <MacroProgress label="Karbonhidrat" value={summary.carbs} target={targets.carbs} unit="g" tone="carbs" />
            <MacroProgress label="Yağ" value={summary.fat} target={targets.fat} unit="g" tone="fat" />
          </article>
        </section>

        <section className="entries-section">
          <div className="section-heading entries-heading">
            <div><p className="eyebrow">ÖĞÜNLER</p><h2>{entries.length ? `${entries.length} kayıt` : 'Henüz kayıt yok'}</h2></div>
            <div className="entry-actions"><button className="button ghost small" disabled={!entries.length} onClick={exportCsv}>CSV</button><button className="button ghost small" disabled={!entries.length} onClick={exportJson}>JSON</button><button className="button primary" onClick={() => setShowAdd(true)}>+ Öğün ekle</button></div>
          </div>

          {entriesQuery.isLoading && <div className="empty-state"><div className="spinner" /><p>Kayıtlar yükleniyor…</p></div>}
          {entriesQuery.isError && <div className="notice error" role="alert">Kayıtlar yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.</div>}
          {!entriesQuery.isLoading && !entries.length && <div className="empty-state"><span className="empty-icon">◌</span><h3>İlk öğününü ekle</h3><p>Manuel gir, metni ayrıştır veya fotoğrafla tahmin al.</p><button className="button primary" onClick={() => setShowAdd(true)}>Öğün ekle</button></div>}
          <div className="entries-list">{entries.map((entry) => <EntryCard key={entry.id} entry={entry} onEdit={(selected) => { setEditingEntry(selected); setShowAdd(true) }} onDelete={(id) => void removeEntry(id)} />)}</div>
        </section>

        <TrackingPanel userId={userId} dateKey={dateKey} onUseEnergyGoal={useEnergyGoal} />
      </main>

      <footer className="app-footer"><span>Besin değerleri bilgilendirme amaçlıdır.</span><a href="https://fdc.nal.usda.gov/" target="_blank" rel="noreferrer">USDA FoodData Central</a></footer>
      {showAdd && <AddMealDialog userId={userId} dateKey={dateKey} initialEntry={editingEntry} onClose={() => { setShowAdd(false); setEditingEntry(null) }} onSave={addEntry} />}
      {showGoal && <GoalDialog goal={goal} onClose={() => setShowGoal(false)} onSave={updateGoal} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
