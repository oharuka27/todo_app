import type { Layout } from '../layout'
import type { Filter } from '../todoUtils'

const FILTER_LABELS: Record<Filter, string> = { all: 'すべて', active: '未完了', completed: '完了' }
const LAYOUTS: Layout[] = [1, 2]

type Props = {
  filter: Filter
  layout: Layout
  remaining: number
  onAdd: () => void
  onFilterChange: (filter: Filter) => void
  onLayoutChange: (layout: Layout) => void
}

export function Toolbar({ filter, layout, remaining, onAdd, onFilterChange, onLayoutChange }: Props) {
  return (
    <div className="toolbar">
      <div className="toolbar-start">
        <button
          type="button"
          className="add-button"
          onClick={onAdd}
          aria-label="タスクを追加"
          aria-keyshortcuts="N"
          title="新しいタスク（N）"
        >
          ＋
        </button>
        <div className="filters" aria-label="表示するタスク">
          {(Object.keys(FILTER_LABELS) as Filter[]).map((item) => (
            <button
              key={item}
              className={filter === item ? 'active' : ''}
              onClick={() => onFilterChange(item)}
            >
              {FILTER_LABELS[item]}
            </button>
          ))}
        </div>
      </div>
      <div className="toolbar-end">
        <span>{remaining} 件残っています</span>
        <div className="layout-switch" role="group" aria-label="タスクの表示列数">
          {LAYOUTS.map((columns) => (
            <button
              key={columns}
              type="button"
              className={layout === columns ? 'active' : ''}
              aria-pressed={layout === columns}
              onClick={() => onLayoutChange(columns)}
            >
              {columns}列
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
