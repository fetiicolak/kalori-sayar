import { useState, type FormEvent } from 'react'
import { analyzePhoto, analyzeText, compressImage, lookupBarcode, searchFoods } from '../services/api'
import { saveConsent } from '../services/food-repository'
import type { DraftFoodItem, FoodEntry, FoodSearchResult, MealType } from '../types/domain'

type AddMode = 'manual' | 'text' | 'photo' | 'search' | 'barcode'

interface SpeechRecognitionResultLike {
  results: ArrayLike<{ 0: { transcript: string } }>
}

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionResultLike) => void) | null
  onerror: (() => void) | null
  start: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

interface BarcodeDetectorLike {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>
}

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike

const CONSENT_VERSION = '2026-10-23-v1'

const emptyItem = (): DraftFoodItem => ({
  id: crypto.randomUUID(),
  name: '',
  amountGrams: 100,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  sourceType: 'user',
  userModified: true
})

const modes: Array<{ id: AddMode; label: string }> = [
  { id: 'manual', label: 'Manuel' },
  { id: 'text', label: 'Metin' },
  { id: 'photo', label: 'Fotoğraf' },
  { id: 'search', label: 'USDA ara' },
  { id: 'barcode', label: 'Barkod' }
]

interface AddMealDialogProps {
  userId: string
  dateKey: string
  initialEntry?: FoodEntry | null
  onClose: () => void
  onSave: (input: { mealType: MealType; time: string; note: string; items: DraftFoodItem[] }) => Promise<void>
}

export function AddMealDialog({ userId, initialEntry, onClose, onSave }: AddMealDialogProps) {
  const [mode, setMode] = useState<AddMode>('manual')
  const [mealType, setMealType] = useState<MealType>(initialEntry?.mealType ?? 'breakfast')
  const [time, setTime] = useState(initialEntry ? new Date(initialEntry.consumedAt).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5))
  const [note, setNote] = useState(initialEntry?.note ?? '')
  const [items, setItems] = useState<DraftFoodItem[]>(initialEntry?.items ?? [emptyItem()])
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoConsent, setPhotoConsent] = useState(false)
  const [query, setQuery] = useState('')
  const [barcode, setBarcode] = useState('')
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([])
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function changeMode(nextMode: AddMode) {
    setMode(nextMode)
    setError(null)
    setWarning(null)
    if (nextMode === 'manual' && items.every((item) => item.name)) setItems([emptyItem()])
  }

  function updateItem(id: string, field: keyof DraftFoodItem, value: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        if (field === 'name') return { ...item, name: value, userModified: true }
        return { ...item, [field]: Math.max(0, Number(value)), userModified: true }
      })
    )
  }

  async function runAnalysis(kind: 'text' | 'photo') {
    setBusy(true)
    setError(null)
    setWarning(null)
    try {
      if (kind === 'text') {
        const result = await analyzeText(text)
        setItems(result.items)
        setWarning(result.warning)
      } else {
        if (!photo || !photoConsent) throw new Error('Fotoğrafı seçip veri aktarım onayını işaretleyin.')
        await saveConsent(userId, CONSENT_VERSION, true)
        const result = await analyzePhoto(await compressImage(photo))
        setItems(result.items)
        setWarning(result.warning)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Analiz tamamlanamadı.')
    } finally {
      setBusy(false)
    }
  }

  async function runSearch() {
    setBusy(true)
    setError(null)
    try {
      setSearchResults(await searchFoods(query))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Arama tamamlanamadı.')
    } finally {
      setBusy(false)
    }
  }

  function startVoiceInput() {
    const constructor = (window as typeof window & { webkitSpeechRecognition?: SpeechRecognitionConstructor; SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
      ?? (window as typeof window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition
    if (!constructor) {
      setError('Sesle giriş bu tarayıcıda desteklenmiyor. Metin alanını kullanabilirsiniz.')
      return
    }
    setError(null)
    const recognition = new constructor()
    recognition.lang = 'tr-TR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => setText(event.results[0]?.[0]?.transcript ?? '')
    recognition.onerror = () => setError('Ses anlaşılamadı. Tekrar deneyin veya metinle yazın.')
    recognition.start()
  }

  async function runBarcode(value = barcode) {
    setBusy(true)
    setError(null)
    try {
      const result = await lookupBarcode(value)
      pickSearchResult(result)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Barkod sorgulanamadı.')
    } finally {
      setBusy(false)
    }
  }

  async function scanBarcodeFile(file: File) {
    const Detector = (window as typeof window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
    if (!Detector) {
      setError('Bu tarayıcı fotoğraftan barkod okumayı desteklemiyor. Numarayı manuel yazabilirsiniz.')
      return
    }
    try {
      const bitmap = await createImageBitmap(file)
      const matches = await new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }).detect(bitmap)
      bitmap.close()
      const value = matches[0]?.rawValue
      if (!value) throw new Error('Fotoğrafta barkod bulunamadı.')
      setBarcode(value)
      await runBarcode(value)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Barkod okunamadı.')
    }
  }

  function pickSearchResult(result: FoodSearchResult) {
    setItems((current) => [
      ...(current.length === 1 && !current[0]?.name ? [] : current),
      { ...result, id: crypto.randomUUID(), userModified: false }
    ])
    setSearchResults([])
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const validItems = items.filter((item) => item.name.trim() && item.amountGrams > 0)
    if (validItems.length === 0) {
      setError('En az bir besin ekleyin.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSave({ mealType, time, note, items: validItems })
      onClose()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Öğün kaydedilemedi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card large" role="dialog" aria-modal="true" aria-labelledby="add-meal-title">
        <header className="modal-header">
          <div><p className="eyebrow">{initialEntry ? 'KAYDI DÜZENLE' : 'YENİ KAYIT'}</p><h2 id="add-meal-title">{initialEntry ? 'Öğünü düzenle' : 'Öğün ekle'}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Pencereyi kapat">×</button>
        </header>

        <form onSubmit={(event) => void submit(event)}>
          <div className="form-grid two">
            <label>Öğün
              <select value={mealType} onChange={(event) => setMealType(event.target.value as MealType)}>
                <option value="breakfast">Kahvaltı</option><option value="lunch">Öğle</option>
                <option value="dinner">Akşam</option><option value="snack">Atıştırma</option>
              </select>
            </label>
            <label>Saat<input type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label>
          </div>

          <div className="segmented" role="tablist" aria-label="Yemek ekleme yöntemi">
            {modes.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={mode === item.id} className={mode === item.id ? 'active' : ''} onClick={() => changeMode(item.id)}>{item.label}</button>
            ))}
          </div>

          {mode === 'text' && (
            <div className="input-action-panel">
              <label>Ne yedin?
                <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Örn. 2 yumurta, 1 dilim tam buğday ekmeği ve bir küçük muz" maxLength={1000} />
              </label>
              <div className="inline-buttons"><button type="button" className="button ghost" onClick={startVoiceInput}>Sesle doldur</button><button type="button" className="button secondary" disabled={busy || text.trim().length < 2} onClick={() => void runAnalysis('text')}>AI ile ayrıştır</button></div>
            </div>
          )}

          {mode === 'photo' && (
            <div className="input-action-panel">
              <label>Yemek fotoğrafı
                <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
              </label>
              <label className="consent-check">
                <input type="checkbox" checked={photoConsent} onChange={(event) => setPhotoConsent(event.target.checked)} />
                <span>Fotoğrafın analiz için Google Gemini'ye gönderileceğini anlıyorum. Fotoğraf uygulamada kalıcı olarak saklanmayacak.</span>
              </label>
              <button type="button" className="button secondary" disabled={busy || !photo || !photoConsent} onClick={() => void runAnalysis('photo')}>Fotoğrafı analiz et</button>
            </div>
          )}

          {mode === 'search' && (
            <div className="input-action-panel">
              <label>USDA FoodData Central'da ara
                <div className="inline-input"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Örn. oatmeal" /><button type="button" className="button secondary" disabled={busy || query.trim().length < 2} onClick={() => void runSearch()}>Ara</button></div>
              </label>
              {searchResults.length > 0 && <ul className="search-results">{searchResults.map((result) => <li key={result.id}><button type="button" onClick={() => pickSearchResult(result)}><strong>{result.name}</strong><span>{Math.round(result.calories)} kcal / 100 g · {result.description}</span></button></li>)}</ul>}
            </div>
          )}

          {mode === 'barcode' && (
            <div className="input-action-panel">
              <label>Barkod numarası
                <div className="inline-input"><input inputMode="numeric" pattern="[0-9]{8,14}" value={barcode} onChange={(event) => setBarcode(event.target.value.replace(/\D/g, '').slice(0, 14))} placeholder="869…" /><button type="button" className="button secondary" disabled={busy || !/^\d{8,14}$/.test(barcode)} onClick={() => void runBarcode()}>Ürünü bul</button></div>
              </label>
              <label>Barkod fotoğrafı <span className="optional">(tarayıcı destekliyorsa)</span><input type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) void scanBarcodeFile(file) }} /></label>
              <small className="muted">Ürün bilgileri Open Food Facts'tan gelir ve kaydetmeden önce düzenlenebilir.</small>
            </div>
          )}

          {warning && <div className="notice warning" role="status">{warning}</div>}
          {error && <div className="notice error" role="alert">{error}</div>}

          <div className="items-editor">
            <div className="section-heading"><h3>Besinler</h3><button type="button" className="text-button" onClick={() => setItems((current) => [...current, emptyItem()])}>+ Satır ekle</button></div>
            {items.map((item, index) => (
              <fieldset className="item-editor" key={item.id}>
                <legend>{index + 1}. besin</legend>
                <button type="button" className="remove-item" onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))} aria-label={`${index + 1}. besini kaldır`}>Kaldır</button>
                <label className="span-two">Besin adı<input value={item.name} onChange={(event) => updateItem(item.id, 'name', event.target.value)} placeholder="Besin adı" required /></label>
                <label>Gram<input type="number" min="0.1" step="0.1" value={item.amountGrams} onChange={(event) => updateItem(item.id, 'amountGrams', event.target.value)} required /></label>
                <label>Kalori<input type="number" min="0" step="1" value={item.calories} onChange={(event) => updateItem(item.id, 'calories', event.target.value)} required /></label>
                <label>Protein (g)<input type="number" min="0" step="0.1" value={item.protein} onChange={(event) => updateItem(item.id, 'protein', event.target.value)} required /></label>
                <label>Karbonhidrat (g)<input type="number" min="0" step="0.1" value={item.carbs} onChange={(event) => updateItem(item.id, 'carbs', event.target.value)} required /></label>
                <label>Yağ (g)<input type="number" min="0" step="0.1" value={item.fat} onChange={(event) => updateItem(item.id, 'fat', event.target.value)} required /></label>
                <div className="source-chip">{item.sourceType === 'ai_estimate' ? `AI tahmini · güven ${Math.round((item.aiConfidence ?? 0) * 100)}%` : item.sourceType === 'usda' ? 'USDA kaynaklı' : 'Kullanıcı girişi'}</div>
              </fieldset>
            ))}
          </div>

          <label>Not <span className="optional">(isteğe bağlı)</span><input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} /></label>

          <footer className="modal-actions"><button type="button" className="button ghost" onClick={onClose}>Vazgeç</button><button className="button primary" disabled={busy}>{busy ? 'İşleniyor…' : initialEntry ? 'Değişiklikleri kaydet' : 'Öğünü kaydet'}</button></footer>
        </form>
      </section>
    </div>
  )
}
