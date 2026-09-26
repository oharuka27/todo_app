import { useDragReorder } from '../hooks/useDragReorder'
import type { Layout } from '../layout'
import type { DropPosition, Todo } from '../todoUtils'
import { TodoItem } from './TodoItem'

type Props = {
  todos: Todo[]
  layout: Layout
  editingId: string | null
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onMove: (targetId: string, draggedId: string, position: DropPosition) => void
  onStartEdit: (id: string) => void
  onSave: (id: string, title: string) => void
  onSaveAndNext: (id: string, title: string) => void
  onCancelEdit: (id: string) => void
}

export function TodoList({
  todos,
  layout,
  editingId,
  onToggle,
  onDelete,
  onMove,
  onStartEdit,
  onSave,
  onSaveAndNext,
  onCancelEdit,
}: Props) {
  const { listRef, draggedId, dropTarget, autoScroll, itemHandlers } = useDragReorder(todos, onMove)

  return (
    <ul className={`todo-list columns-${layout}`} ref={listRef} aria-live="polite" onDragOver={autoScroll}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isEditing={editingId === todo.id}
          isDragging={draggedId === todo.id}
          dropPosition={dropTarget?.id === todo.id ? dropTarget.position : null}
          dragHandlers={itemHandlers(todo.id)}
          onToggle={() => onToggle(todo.id)}
          onDelete={() => onDelete(todo.id)}
          onStartEdit={() => onStartEdit(todo.id)}
          onSave={(title) => onSave(todo.id, title)}
          onSaveAndNext={(title) => onSaveAndNext(todo.id, title)}
          onCancelEdit={() => onCancelEdit(todo.id)}
        />
      ))}
    </ul>
  )
}
