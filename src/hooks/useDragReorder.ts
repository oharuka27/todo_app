import { useEffect, useRef, useState, type DragEvent } from 'react'
import type { DropPosition } from '../todoUtils'

type DropTarget = { id: string; position: DropPosition }

const EDGE_THRESHOLD = 48
const SCROLL_STEP = 3

// リスト内のドラッグ＆ドロップによる並び替えと、ドラッグ中の自動スクロールを扱う
export function useDragReorder(
  items: unknown,
  onMove: (targetId: string, draggedId: string, position: DropPosition) => void,
) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // 並び替えが反映された後、ドロップした項目が見える位置までスクロールする
  useEffect(() => {
    if (!pendingScrollId) return
    requestAnimationFrame(() => {
      const droppedItem = Array.from(listRef.current?.children ?? []).find(
        (item) => (item as HTMLElement).dataset.todoId === pendingScrollId,
      )
      droppedItem?.scrollIntoView({ block: 'nearest' })
    })
    setPendingScrollId(null)
  }, [items, pendingScrollId])

  function reset() {
    setDraggedId(null)
    setDropTarget(null)
  }

  function autoScroll(event: DragEvent<HTMLUListElement>) {
    const list = listRef.current
    if (!draggedId || !list) return

    const bounds = list.getBoundingClientRect()
    if (event.clientY < bounds.top + EDGE_THRESHOLD) {
      list.scrollTop -= SCROLL_STEP
    } else if (event.clientY > bounds.bottom - EDGE_THRESHOLD) {
      list.scrollTop += SCROLL_STEP
    }
  }

  function itemHandlers(id: string) {
    return {
      onDragStart: () => setDraggedId(id),
      onDragOver: (event: DragEvent<HTMLLIElement>) => {
        event.preventDefault()
        if (!draggedId || draggedId === id) {
          setDropTarget(null)
          return
        }
        const bounds = event.currentTarget.getBoundingClientRect()
        const position = event.clientY < bounds.top + bounds.height / 2 ? 'before' : 'after'
        setDropTarget({ id, position })
      },
      onDrop: (event: DragEvent<HTMLLIElement>) => {
        event.preventDefault()
        if (dropTarget?.id === id && draggedId) {
          onMove(id, draggedId, dropTarget.position)
          setPendingScrollId(draggedId)
        }
        reset()
      },
      onDragEnd: reset,
    }
  }

  return { listRef, draggedId, dropTarget, autoScroll, itemHandlers }
}
