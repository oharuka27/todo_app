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
