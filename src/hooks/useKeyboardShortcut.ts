import { useEffect, useRef } from 'react'

// 文字入力中以外で、修飾キーなしの1キーを押したときに handler を呼ぶ
export function useKeyboardShortcut(key: string, handler: () => void) {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== key.toLowerCase()) return
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return

      event.preventDefault()
      handlerRef.current()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [key])
}
