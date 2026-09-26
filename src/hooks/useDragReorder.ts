import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import type { DropPosition } from '../todoUtils'

type DropTarget = { id: string; position: DropPosition }

type Press = {
  id: string
  pointerId: number
  pointerType: string
  element: HTMLElement
  startX: number
  startY: number
  timer: number
}

type Drag = {
  id: string
  pointerId: number
  x: number
  y: number
  target: DropTarget | null
}

const LONG_PRESS_MS = 400
// 長押し前にこれ以上動いたら、タッチはスクロール、マウスはそのままドラッグ開始とみなす
const MOVE_TOLERANCE = 8
const EDGE_THRESHOLD = 48
const SCROLL_STEP = 6

// 長押し（マウスは押したまま動かすだけでも可）で持ち上げ、離した位置に並び替える。
// Pointer Events で扱うため、マウスとタッチの両方で動く
export function useDragReorder(
  items: unknown,
  onMove: (targetId: string, draggedId: string, position: DropPosition) => void,
) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const pressRef = useRef<Press | null>(null)
  const dragRef = useRef<Drag | null>(null)
  const suppressClickRef = useRef(false)
  const scrollFrameRef = useRef(0)

  // 並び替えが反映された後、ドロップした項目が見える位置までスクロールする
  useEffect(() => {
    if (!pendingScrollId) return
    requestAnimationFrame(() => findItem(pendingScrollId)?.scrollIntoView({ block: 'nearest' }))
    setPendingScrollId(null)
  }, [items, pendingScrollId])

  // 持ち上げている間は、タッチ操作でページや一覧がスクロールしないようにする
  useEffect(() => {
    const list = listRef.current
    if (!list) return

    function preventScroll(event: TouchEvent) {
      if (dragRef.current) event.preventDefault()
    }

    list.addEventListener('touchmove', preventScroll, { passive: false })
    return () => list.removeEventListener('touchmove', preventScroll)
  }, [])

  useEffect(() => () => cancel(), [])

  function findItem(id: string) {
    return Array.from(listRef.current?.children ?? []).find(
      (item) => (item as HTMLElement).dataset.todoId === id,
    ) as HTMLElement | undefined
  }

  function updateDropTarget() {
    const drag = dragRef.current
    if (!drag) return

    const item = document.elementFromPoint(drag.x, drag.y)?.closest<HTMLElement>('li[data-todo-id]')
    const id = item && listRef.current?.contains(item) ? item.dataset.todoId : undefined
    let target: DropTarget | null = null
    if (item && id && id !== drag.id) {
      const bounds = item.getBoundingClientRect()
      target = { id, position: drag.y < bounds.top + bounds.height / 2 ? 'before' : 'after' }
    }

    if (target?.id !== drag.target?.id || target?.position !== drag.target?.position) {
      drag.target = target
      setDropTarget(target)
    }
  }

  // 一覧の上端・下端に指やカーソルがある間は、止まっていても自動でスクロールし続ける
  function autoScroll() {
    const drag = dragRef.current
    const list = listRef.current
    if (!drag || !list) return

    const bounds = list.getBoundingClientRect()
    if (drag.y < bounds.top + EDGE_THRESHOLD) {
      list.scrollTop -= SCROLL_STEP
      updateDropTarget()
    } else if (drag.y > bounds.bottom - EDGE_THRESHOLD) {
      list.scrollTop += SCROLL_STEP
      updateDropTarget()
    }
    scrollFrameRef.current = requestAnimationFrame(autoScroll)
  }

  function beginDrag(x?: number, y?: number) {
    const press = pressRef.current
    if (!press) return

    window.clearTimeout(press.timer)
    pressRef.current = null
    dragRef.current = { id: press.id, pointerId: press.pointerId, x: x ?? press.startX, y: y ?? press.startY, target: null }
    try {
      press.element.setPointerCapture(press.pointerId)
    } catch {
      // ポインターがすでに離れている場合は捕捉できないが、そのまま続けてよい
    }
    if (press.pointerType !== 'mouse') navigator.vibrate?.(15)
    setDraggedId(press.id)
    updateDropTarget()
    scrollFrameRef.current = requestAnimationFrame(autoScroll)
  }

  function cancel() {
    if (pressRef.current) window.clearTimeout(pressRef.current.timer)
    pressRef.current = null
    dragRef.current = null
    cancelAnimationFrame(scrollFrameRef.current)
    setDraggedId(null)
    setDropTarget(null)
  }

  function finishDrag() {
    const drag = dragRef.current
    if (!drag) return

    if (drag.target) {
      onMove(drag.target.id, drag.id, drag.target.position)
      setPendingScrollId(drag.id)
    }
    // 指を離した直後に発生するクリックで、編集やチェックが動かないようにする
    suppressClickRef.current = true
    window.setTimeout(() => {
      suppressClickRef.current = false
    })
    cancel()
  }

  function itemHandlers(id: string) {
    return {
      onPointerDown: (event: PointerEvent<HTMLLIElement>) => {
        if (event.button !== 0 || dragRef.current) return
        if ((event.target as HTMLElement).closest('input, textarea, select, form')) return

        cancel()
        pressRef.current = {
          id,
          pointerId: event.pointerId,
          pointerType: event.pointerType,
          element: event.currentTarget,
          startX: event.clientX,
          startY: event.clientY,
          timer: window.setTimeout(() => beginDrag(), LONG_PRESS_MS),
        }
      },
      onPointerMove: (event: PointerEvent<HTMLLIElement>) => {
        const drag = dragRef.current
        if (drag && drag.pointerId === event.pointerId) {
          drag.x = event.clientX
          drag.y = event.clientY
          updateDropTarget()
          return
        }

        const press = pressRef.current
        if (!press || press.pointerId !== event.pointerId) return
        const distance = Math.hypot(event.clientX - press.startX, event.clientY - press.startY)
        if (distance <= MOVE_TOLERANCE) return
        if (press.pointerType === 'mouse') {
          beginDrag(event.clientX, event.clientY)
        } else {
          cancel()
        }
      },
      onPointerUp: () => (dragRef.current ? finishDrag() : cancel()),
      onPointerCancel: cancel,
      onClickCapture: (event: MouseEvent<HTMLLIElement>) => {
        if (!suppressClickRef.current) return
        event.preventDefault()
        event.stopPropagation()
        suppressClickRef.current = false
      },
      // タッチの長押しで出るメニューを抑える
      onContextMenu: (event: MouseEvent<HTMLLIElement>) => {
        if (pressRef.current || dragRef.current) event.preventDefault()
      },
    }
  }

  return { listRef, draggedId, dropTarget, itemHandlers }
}
