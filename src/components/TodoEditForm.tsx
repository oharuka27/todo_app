import { useEffect, useRef, useState } from 'react'

type Props = {
  todoId: string
  initialTitle: string
  onSave: (title: string) => void
  onSaveAndNext: (title: string) => void
  onCancel: () => void
}

// タスク名の入力欄。フォームの外をクリックしたときも保存する
export function TodoEditForm({ todoId, initialTitle, onSave, onSaveAndNext, onCancel }: Props) {
  const [title, setTitle] = useState(initialTitle)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) onSave(title)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [title, onSave])

  return (
    <form
      className="edit-form"
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault()
        onSave(title)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel()
        // Shift+Enter で確定して、続けて次の項目を追加する
        if (event.key === 'Enter' && event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault()
          if (title.trim()) onSaveAndNext(title)
        }
      }}
    >
      <label className="sr-only" htmlFor={`edit-task-${todoId}`}>タスク名を変更</label>
      <input
        id={`edit-task-${todoId}`}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="新しいタスクを入力…"
        maxLength={100}
        autoFocus
      />
    </form>
  )
}
