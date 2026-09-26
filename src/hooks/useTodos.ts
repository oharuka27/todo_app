import {
  SAVED_NOTES_STORAGE_KEY,
  STORAGE_KEY,
  clearCompleted,
  countRemaining,
  createTodo,
  loadSavedNotes,
  loadTodos,
  removeTodo,
  renameTodo,
  reorderTodos,
  toggleTodo,
  type DropPosition,
} from '../todoUtils'
import { usePersistentState } from './usePersistentState'

// TODO一覧と削減できた付箋数を管理し、操作をまとめて提供する
export function useTodos() {
  const [todos, setTodos] = usePersistentState(STORAGE_KEY, loadTodos)
  const [savedNotes, setSavedNotes] = usePersistentState(SAVED_NOTES_STORAGE_KEY, loadSavedNotes)

  function findTitle(id: string) {
    return todos.find((todo) => todo.id === id)?.title
  }

  // 空の項目を先頭に追加し、その id を返す（付箋カウントは保存時）
  function addDraft() {
    const draft = createTodo('')
    setTodos((current) => [draft, ...current])
    return draft.id
  }

  // タイトルを保存する。編集を終えてよい場合は true を返す
  function saveTitle(id: string, title: string) {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      // 既存の項目は空にできない。入力途中の新規項目は破棄する
      if (findTitle(id) !== '') return false
      discardIfEmpty(id)
      return true
    }

    if (findTitle(id) !== trimmedTitle) setSavedNotes((count) => count + 1)
    setTodos((current) => renameTodo(current, id, trimmedTitle))
    return true
  }

  // 何も入力されずに編集を終えた新規項目は取り除く
  function discardIfEmpty(id: string) {
    if (findTitle(id) === '') setTodos((current) => removeTodo(current, id))
  }

  return {
    todos,
    savedNotes,
    remaining: countRemaining(todos),
    addDraft,
    saveTitle,
    discardIfEmpty,
    toggle: (id: string) => setTodos((current) => toggleTodo(current, id)),
    remove: (id: string) => setTodos((current) => removeTodo(current, id)),
    clearCompleted: () => setTodos((current) => clearCompleted(current)),
    move: (targetId: string, draggedId: string, position: DropPosition) =>
      setTodos((current) => reorderTodos(current, targetId, draggedId, position)),
  }
}
