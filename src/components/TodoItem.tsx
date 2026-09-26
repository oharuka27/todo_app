import type { DragEvent } from 'react'
import type { DropPosition, Todo } from '../todoUtils'
import { TodoEditForm } from './TodoEditForm'

type DragHandlers = {
  onDragStart: () => void
  onDragOver: (event: DragEvent<HTMLLIElement>) => void
  onDrop: (event: DragEvent<HTMLLIElement>) => void
  onDragEnd: () => void
}

type Props = {
  todo: Todo
  isEditing: boolean
  isDragging: boolean
  dropPosition: DropPosition | null
  dragHandlers: DragHandlers
  onToggle: () => void
  onDelete: () => void
  onStartEdit: () => void
  onSave: (title: string) => void
  onSaveAndNext: (title: string) => void
  onCancelEdit: () => void
}

export function TodoItem({
  todo,
  isEditing,
  isDragging,
  dropPosition,
  dragHandlers,
  onToggle,
  onDelete,
  onStartEdit,
  onSave,
  onSaveAndNext,
  onCancelEdit,
}: Props) {
  const className = [
    todo.completed && 'completed',
    isDragging && 'dragging',
    dropPosition && `drop-${dropPosition}`,
  ].filter(Boolean).join(' ')

  return (
    <li data-todo-id={todo.id} className={className} draggable={!isEditing} {...dragHandlers}>
      <button
        className="check-button"
        onClick={onToggle}
        aria-label={todo.completed ? `${todo.title}を未完了に戻す` : `${todo.title}を完了にする`}
        aria-pressed={todo.completed}
      >
        {todo.completed && '✓'}
      </button>
      {isEditing ? (
        <TodoEditForm
          todoId={todo.id}
          initialTitle={todo.title}
          onSave={onSave}
          onSaveAndNext={onSaveAndNext}
          onCancel={onCancelEdit}
        />
      ) : (
        <span className="editable-title" onDoubleClick={onStartEdit}>{todo.title}</span>
      )}
      <button className="delete-button" onClick={onDelete} aria-label={`${todo.title}を削除`}>
        ×
      </button>
    </li>
  )
}
