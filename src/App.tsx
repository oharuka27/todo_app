import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { CO2_GRAMS_PER_NOTE, SAVED_NOTES_STORAGE_KEY, formatCo2, loadSavedNotes } from './todoUtils'

type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

type Filter = 'all' | 'active' | 'completed'
type DropPosition = 'before' | 'after'

const STORAGE_KEY = 'cloudflare-todo-sample'
const LAYOUT_STORAGE_KEY = 'cloudflare-todo-layout'
type Layout = 1 | 2

function loadLayout(): Layout {
  try {
    return localStorage.getItem(LAYOUT_STORAGE_KEY) === '2' ? 2 : 1
  } catch {
    return 1
  }
}

function loadTodos(): Todo[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as Todo[]) : []
  } catch {
    return []
  }
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [savedNotes, setSavedNotes] = useState(loadSavedNotes)
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [layout, setLayout] = useState<Layout>(loadLayout)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: string; position: DropPosition } | null>(null)
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null)
  const editFormRef = useRef<HTMLFormElement>(null)
  const todoListRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_NOTES_STORAGE_KEY, String(savedNotes))
    } catch {
      // 保存できない環境でもカウント表示は使えるようにする
    }
  }, [savedNotes])

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, String(layout))
    } catch {
      // 保存できない環境でも表示切り替えは使えるようにする
    }
  }, [layout])

  useEffect(() => {
    if (!pendingScrollId) return
    keepDroppedTodoVisible(pendingScrollId)
    setPendingScrollId(null)
  }, [todos, pendingScrollId])

  useEffect(() => {
    if (!editingId) return
    const currentEditingId = editingId

    function handleOutsideClick(event: MouseEvent) {
      if (editFormRef.current && !editFormRef.current.contains(event.target as Node)) {
        saveEdit(currentEditingId)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [editingId, editingTitle])

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed)
    if (filter === 'completed') return todos.filter((todo) => todo.completed)
    return todos
  }, [filter, todos])

  const remaining = todos.filter((todo) => !todo.completed).length

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    setTodos((current) => [
      { id: crypto.randomUUID(), title: trimmedTitle, completed: false, createdAt: Date.now() },
      ...current,
    ])
    setSavedNotes((count) => count + 1)
    setTitle('')
  }

  function toggleTodo(id: string) {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    )
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id)
    setEditingTitle(todo.title)
  }

  function saveEdit(id: string) {
    const trimmedTitle = editingTitle.trim()
    if (!trimmedTitle) return

    if (todos.find((todo) => todo.id === id)?.title !== trimmedTitle) {
      setSavedNotes((count) => count + 1)
    }
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, title: trimmedTitle } : todo)),
    )
    setEditingId(null)
    setEditingTitle('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingTitle('')
  }

  function removeTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  function clearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.completed))
  }

  function reorderTodos(targetId: string, position: DropPosition) {
    if (!draggedId || draggedId === targetId) return

    setTodos((current) => {
      const draggedIndex = current.findIndex((todo) => todo.id === draggedId)
      const targetIndex = current.findIndex((todo) => todo.id === targetId)
      if (draggedIndex === -1 || targetIndex === -1) return current

      const reordered = [...current]
      const [draggedTodo] = reordered.splice(draggedIndex, 1)
      const targetInsertionIndex = position === 'after' ? targetIndex + 1 : targetIndex
      const insertionIndex = draggedIndex < targetInsertionIndex ? targetInsertionIndex - 1 : targetInsertionIndex
      reordered.splice(insertionIndex, 0, draggedTodo)
      return reordered
    })
  }

  function updateDropTarget(event: React.DragEvent<HTMLLIElement>, id: string) {
    if (!draggedId || draggedId === id) {
      setDropTarget(null)
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    const position = event.clientY < bounds.top + bounds.height / 2 ? 'before' : 'after'
    setDropTarget({ id, position })
  }

  function autoScrollTodoList(event: React.DragEvent<HTMLUListElement>) {
    if (!draggedId || !todoListRef.current) return

    const list = todoListRef.current
    const bounds = list.getBoundingClientRect()
    const edgeThreshold = 48
    const scrollStep = 3

    if (event.clientY < bounds.top + edgeThreshold) {
      list.scrollTop -= scrollStep
    } else if (event.clientY > bounds.bottom - edgeThreshold) {
      list.scrollTop += scrollStep
    }
  }

  function keepDroppedTodoVisible(todoId: string) {
    requestAnimationFrame(() => {
      const list = todoListRef.current
      if (!list) return

      const droppedTodo = Array.from(list.children).find(
        (item) => (item as HTMLElement).dataset.todoId === todoId,
      ) as HTMLElement | undefined
      droppedTodo?.scrollIntoView({ block: 'nearest' })
    })
  }

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
        </header>

        <form className="add-form" onSubmit={addTodo}>
          <label className="sr-only" htmlFor="new-task">新しいタスク</label>
          <input
            id="new-task"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="新しいタスクを入力…"
            maxLength={100}
            autoFocus
          />
          <button type="submit" disabled={!title.trim()} aria-label="タスクを追加">＋</button>
        </form>

        <div className="toolbar">
          <div className="filters" aria-label="表示するタスク">
            {(['all', 'active', 'completed'] as Filter[]).map((item) => (
              <button
                key={item}
                className={filter === item ? 'active' : ''}
                onClick={() => setFilter(item)}
              >
                {{ all: 'すべて', active: '未完了', completed: '完了' }[item]}
              </button>
            ))}
          </div>
          <div className="toolbar-end">
            <span>{remaining} 件残っています</span>
            <div className="layout-switch" role="group" aria-label="タスクの表示列数">
              {([1, 2] as Layout[]).map((columns) => (
                <button
                  key={columns}
                  type="button"
                  className={layout === columns ? 'active' : ''}
                  aria-pressed={layout === columns}
                  onClick={() => setLayout(columns)}
                >
                  {columns}列
                </button>
              ))}
            </div>
          </div>
        </div>

        <ul
          className={`todo-list columns-${layout}`}
          ref={todoListRef}
          aria-live="polite"
          onDragOver={(event) => autoScrollTodoList(event)}
        >
          {visibleTodos.map((todo) => (
            <li
              key={todo.id}
              data-todo-id={todo.id}
              className={`${todo.completed ? 'completed' : ''}${draggedId === todo.id ? ' dragging' : ''}${dropTarget?.id === todo.id ? ` drop-${dropTarget.position}` : ''}`}
              draggable={editingId !== todo.id}
              onDragStart={() => setDraggedId(todo.id)}
              onDragOver={(event) => {
                event.preventDefault()
                updateDropTarget(event, todo.id)
              }}
              onDrop={(event) => {
                event.preventDefault()
                if (dropTarget?.id === todo.id && draggedId) {
                  reorderTodos(todo.id, dropTarget.position)
                  setPendingScrollId(draggedId)
                }
                setDraggedId(null)
                setDropTarget(null)
              }}
              onDragEnd={() => {
                setDraggedId(null)
                setDropTarget(null)
              }}
            >
              <button
                className="check-button"
                onClick={() => toggleTodo(todo.id)}
                aria-label={todo.completed ? `${todo.title}を未完了に戻す` : `${todo.title}を完了にする`}
                aria-pressed={todo.completed}
              >
                {todo.completed && '✓'}
              </button>
              {editingId === todo.id ? (
                <form
                  className="edit-form"
                  ref={editFormRef}
                  onSubmit={(event) => {
                    event.preventDefault()
                    saveEdit(todo.id)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') cancelEdit()
                  }}
                >
                  <label className="sr-only" htmlFor={`edit-task-${todo.id}`}>タスク名を変更</label>
                  <input
                    id={`edit-task-${todo.id}`}
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    maxLength={100}
                    autoFocus
                  />
                  <button type="submit" disabled={!editingTitle.trim()}>保存</button>
                  <button type="button" onClick={cancelEdit}>キャンセル</button>
                </form>
              ) : (
                <span className="editable-title" onDoubleClick={() => startEditing(todo)}>{todo.title}</span>
              )}
              <button className="delete-button" onClick={() => removeTodo(todo.id)} aria-label={`${todo.title}を削除`}>
                ×
              </button>
            </li>
          ))}
        </ul>

        {visibleTodos.length === 0 && (
          <div className="empty-state">
            <span>✓</span>
            <p>{todos.length === 0 ? 'タスクはまだありません' : '該当するタスクはありません'}</p>
          </div>
        )}

        {todos.some((todo) => todo.completed) && (
          <button className="clear-button" onClick={clearCompleted}>完了済みを削除</button>
        )}
      </section>
      <footer>データはこのブラウザに保存されます</footer>
    </main>
  )
}
