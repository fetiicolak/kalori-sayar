interface MacroProgressProps {
  label: string
  value: number
  target: number
  unit: string
  tone: 'protein' | 'carbs' | 'fat'
}

export function MacroProgress({ label, value, target, unit, tone }: MacroProgressProps) {
  const percent = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0

  return (
    <div className="macro-progress">
      <div className="macro-label"><span>{label}</span><strong>{Math.round(value)}{unit}</strong></div>
      <div className="progress-track" aria-label={`${label}: yüzde ${percent}`}>
        <span className={tone} style={{ width: `${percent}%` }} />
      </div>
      <small>{Math.max(0, Math.round(target - value))}{unit} kaldı</small>
    </div>
  )
}
