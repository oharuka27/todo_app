import { CO2_GRAMS_PER_NOTE, formatCo2 } from '../todoUtils'

type Props = {
  savedNotes: number
}

// 削減できた付箋の枚数とCO2削減量を葉っぱ型で表示する
export function LeafCounter({ savedNotes }: Props) {
  return (
    <div
      className="leaf-counter"
      role="status"
      aria-label={`削減できた付箋 ${savedNotes}枚、CO2削減量 約${formatCo2(savedNotes)}`}
      title={`付箋1枚あたり約${CO2_GRAMS_PER_NOTE}gのCO2削減として計算`}
    >
      <span className="leaf-label">削減できた付箋</span>
      <span className="leaf-count">{savedNotes}<small>枚</small></span>
      <span className="leaf-co2">CO₂ 約{formatCo2(savedNotes)}</span>
    </div>
  )
}
