type Props = {
  hasTodos: boolean
}

export function EmptyState({ hasTodos }: Props) {
  return (
    <div className="empty-state">
      <span>✓</span>
      <p>{hasTodos ? '該当するタスクはありません' : '＋ボタンでタスクを追加しましょう'}</p>
    </div>
  )
}
