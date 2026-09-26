import { useEffect, useState } from 'react'

// 値を localStorage に JSON で保存し続ける useState
export function usePersistentState<T>(key: string, load: () => T) {
  const [value, setValue] = useState<T>(load)

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 保存できない環境でも画面上の操作は使えるようにする
    }
  }, [key, value])

  return [value, setValue] as const
}
