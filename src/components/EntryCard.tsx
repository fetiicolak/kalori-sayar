import { sumMacros } from '../lib/nutrition'
import type { FoodEntry, MealType } from '../types/domain'

const mealNames: Record<MealType, string> = {
  breakfast: 'Kahvaltı',
  lunch: 'Öğle',
  dinner: 'Akşam',
  snack: 'Atıştırma'
}

const sourceNames = {
  usda: 'USDA',
  open_food_facts: 'Open Food Facts',
  user: 'Kullanıcı',
  curated: 'Kaynaklı',
  ai_estimate: 'AI tahmini'
}

export function EntryCard({ entry, onDelete, onEdit }: { entry: FoodEntry; onDelete: (id: string) => void; onEdit: (entry: FoodEntry) => void }) {
  const total = sumMacros(entry.items)
  const time = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(entry.consumedAt))

  return (
    <article className="entry-card">
      <header>
        <div>
          <span className="meal-badge">{mealNames[entry.mealType]}</span>
          <span className="entry-time">{time}</span>
          {entry.syncState === 'pending' && <span className="pending-badge">Eşitlenecek</span>}
        </div>
        <div className="entry-total"><strong>{Math.round(total.calories)}</strong><span>kcal</span></div>
      </header>
      <ul className="food-list">
        {entry.items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{Math.round(item.amountGrams)} g · {sourceNames[item.sourceType]}</span>
            </div>
            <span>{Math.round(item.calories)} kcal</span>
          </li>
        ))}
      </ul>
      <footer>
        <span>P {Math.round(total.protein)}g</span>
        <span>K {Math.round(total.carbs)}g</span>
        <span>Y {Math.round(total.fat)}g</span>
        <button className="text-button entry-edit" onClick={() => onEdit(entry)} aria-label={`${mealNames[entry.mealType]} kaydını düzenle`}>Düzenle</button>
        <button className="danger-text" onClick={() => onDelete(entry.id)} aria-label={`${mealNames[entry.mealType]} kaydını sil`}>Sil</button>
      </footer>
    </article>
  )
}
