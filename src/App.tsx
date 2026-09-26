import { useMemo, useState } from 'react'
import { EmptyState } from './components/EmptyState'
import { LeafCounter } from './components/LeafCounter'
import { ShortcutHint } from './components/ShortcutHint'
import { TodoList } from './components/TodoList'
import { Toolbar } from './components/Toolbar'
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut'
import { usePersistentState } from './hooks/usePersistentState'
import { useTodos } from './hooks/useTodos'
import { LAYOUT_STORAGE_KEY, loadLayout } from './layout'
import { filterTodos, type Filter } from './todoUtils'

export default function App() {
  const todoStore = useTodos()
  const { todos } = todoStore
  const [filter, setFilter] = useState<Filter>('all')
  const [layout, setLayout] = usePersistentState(LAYOUT_STORAGE_KEY, loadLayout)
  const [editingId, setEditingId] = useState<string | null>(null)

  const visibleTodos = useMemo(() => filterTodos(todos, filter), [filter, todos])

  // 空の項目を先頭に追加し、そのまま入力できるよう編集状態にする
  function startAdding() {
    const id = todoStore.addDraft()
    if (filter === 'completed') setFilter('all')
    setEditingId(id)
  }

  function save(id: string, title: string) {
    if (todoStore.saveTitle(id, title)) setEditingId(null)
  }

  function saveAndNext(id: string, title: string) {
    save(id, title)
    startAdding()
  }

  function cancelEdit(id: string) {
    todoStore.discardIfEmpty(id)
    setEditingId(null)
  }

  useKeyboardShortcut('n', startAdding)

  return (
    <main className="page-shell">
      <section className={`todo-card columns-${layout}`} aria-labelledby="page-title">
        <header className="hero">
          <div>
            <p className="eyebrow">DAILY FOCUS</p>
            <h1 id="page-title">
              <span>ちょっと待った！</span>
              <span>その付箋</span>
            </h1>
            <p className="subtitle">今日やることを、シンプルに。</p>
          </div>
          <LeafCounter savedNotes={todoStore.savedNotes} />
        </header>

        <Toolbar
          filter={filter}
          layout={layout}
          remaining={todoStore.remaining}
          onAdd={startAdding}
          onFilterChange={setFilter}
          onLayoutChange={setLayout}
        />

        <TodoList
          todos={visibleTodos}
          layout={layout}
          editingId={editingId}
          onToggle={todoStore.toggle}
          onDelete={todoStore.remove}
          onMove={todoStore.move}
          onStartEdit={setEditingId}
          onSave={save}
          onSaveAndNext={saveAndNext}
          onCancelEdit={cancelEdit}
        />

        {visibleTodos.length === 0 && <EmptyState hasTodos={todos.length > 0} />}

        {todos.some((todo) => todo.completed) && (
          <button className="clear-button" onClick={todoStore.clearCompleted}>完了済みを削除</button>
        )}
      </section>
      <footer>
        <ShortcutHint />
        <p>データはこのブラウザに保存されます</p>
      </footer>
    </main>
  )
}
