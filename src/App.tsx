import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

type Filter = 'all' | 'active' | 'completed'

const STORAGE_KEY = 'cloudflare-todo-sample'

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
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const editFormRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

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

  return (
    <main className="page-shell">
      <section className="todo-card" aria-labelledby="page-title">
        <header className="hero">
          <p className="eyebrow">DAILY FOCUS</p>
          <h1 id="page-title">My Tasks</h1>
          <p className="subtitle">今日やることを、シンプルに。</p>
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
          <span>{remaining} 件残っています</span>
        </div>

        <ul className="todo-list" aria-live="polite">
          {visibleTodos.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
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
