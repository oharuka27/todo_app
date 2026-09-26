import { describe, expect, it } from 'vitest'
import { createTodo, filterTodos, formatCo2, loadSavedNotes, loadTodos, reorderTodos, type Todo } from './todoUtils'

describe('todo utilities', () => {
  it('creates a todo with trimmed title', () => {
    const todo = createTodo('  Buy milk  ')

    expect(todo.title).toBe('Buy milk')
    expect(todo.completed).toBe(false)
    expect(todo.id).toBeTruthy()
  })

  it('filters todos by completion status', () => {
    const todos: Todo[] = [
      { id: '1', title: 'done task', completed: true, createdAt: 1 },
      { id: '2', title: 'active task', completed: false, createdAt: 2 },
    ]

    expect(filterTodos(todos, 'all')).toHaveLength(2)
    expect(filterTodos(todos, 'active')).toEqual([todos[1]])
    expect(filterTodos(todos, 'completed')).toEqual([todos[0]])
  })

  it('reorders a todo before another item', () => {
    const todos: Todo[] = [
      { id: '1', title: 'first', completed: false, createdAt: 1 },
      { id: '2', title: 'second', completed: false, createdAt: 2 },
      { id: '3', title: 'third', completed: false, createdAt: 3 },
    ]

    const reordered = reorderTodos(todos, '1', '3', 'before')

    expect(reordered.map((todo) => todo.id)).toEqual(['3', '1', '2'])
  })

  it('loads todos from localStorage and falls back to empty list', () => {
    localStorage.setItem('cloudflare-todo-sample', JSON.stringify([{ id: 'x', title: 'stored', completed: false, createdAt: 42 }]))

    expect(loadTodos()).toHaveLength(1)

    localStorage.clear()
    expect(loadTodos()).toEqual([])
  })

  it('loads saved note count and falls back to zero', () => {
    localStorage.setItem('cloudflare-todo-saved-notes', '12')
    expect(loadSavedNotes()).toBe(12)

    localStorage.setItem('cloudflare-todo-saved-notes', 'broken')
    expect(loadSavedNotes()).toBe(0)

    localStorage.clear()
    expect(loadSavedNotes()).toBe(0)
  })

  it('formats CO2 reduction in grams or kilograms', () => {
    expect(formatCo2(0)).toBe('0.0g')
    expect(formatCo2(3)).toBe('1.5g')
    expect(formatCo2(4000)).toBe('2.00kg')
  })
})
