export type Layout = 1 | 2

export const LAYOUT_STORAGE_KEY = 'cloudflare-todo-layout'

export function loadLayout(): Layout {
  try {
    return localStorage.getItem(LAYOUT_STORAGE_KEY) === '2' ? 2 : 1
  } catch {
    return 1
  }
}
