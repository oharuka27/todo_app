export type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

export type Filter = 'all' | 'active' | 'completed'
export type DropPosition = 'before' | 'after'

export const STORAGE_KEY = 'cloudflare-todo-sample'

export function createTodo(title: string): Todo {
  const trimmedTitle = title.trim()

  return {
    id: crypto.randomUUID(),
    title: trimmedTitle,
    completed: false,
    createdAt: Date.now(),
  }
}

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter((todo) => !todo.completed)
    case 'completed':
      return todos.filter((todo) => todo.completed)
    default:
      return todos
  }
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
}

export function renameTodo(todos: Todo[], id: string, title: string): Todo[] {
  return todos.map((todo) => (todo.id === id ? { ...todo, title: title.trim() } : todo))
}

export function removeTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((todo) => todo.id !== id)
}

export function clearCompleted(todos: Todo[]): Todo[] {
  return todos.filter((todo) => !todo.completed)
}

// 入力途中の空の項目は残り件数に含めない
export function countRemaining(todos: Todo[]): number {
  return todos.filter((todo) => !todo.completed && todo.title !== '').length
}

export function loadTodos(): Todo[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as Todo[]) : []
  } catch {
    return []
  }
}

export function reorderTodos(
  todos: Todo[],
  targetId: string,
  draggedId: string,
  position: DropPosition,
): Todo[] {
  if (!draggedId || draggedId === targetId) return todos

  const draggedIndex = todos.findIndex((todo) => todo.id === draggedId)
  const targetIndex = todos.findIndex((todo) => todo.id === targetId)
  if (draggedIndex === -1 || targetIndex === -1) return todos

  const reordered = [...todos]
  const [draggedTodo] = reordered.splice(draggedIndex, 1)
  const targetInsertionIndex = position === 'after' ? targetIndex + 1 : targetIndex
  const insertionIndex = draggedIndex < targetInsertionIndex ? targetInsertionIndex - 1 : targetInsertionIndex
  reordered.splice(insertionIndex, 0, draggedTodo)
  return reordered
}

export const SAVED_NOTES_STORAGE_KEY = 'cloudflare-todo-saved-notes'

// 75mm角の付箋1枚(約0.4g)の製造時CO2排出量からの概算値
export const CO2_GRAMS_PER_NOTE = 0.5

export function loadSavedNotes(): number {
  try {
    const saved = Number(localStorage.getItem(SAVED_NOTES_STORAGE_KEY))
    return Number.isFinite(saved) && saved > 0 ? Math.floor(saved) : 0
  } catch {
    return 0
  }
}

export function formatCo2(notes: number): string {
  const grams = notes * CO2_GRAMS_PER_NOTE
  return grams >= 1000 ? `${(grams / 1000).toFixed(2)}kg` : `${grams.toFixed(1)}g`
}
