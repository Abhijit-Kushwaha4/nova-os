import { Tab } from "../types/Browser"

const KEY = "nova_browser_tabs"

export function loadTabs(): Tab[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const initial: Tab[] = [
      { id: crypto.randomUUID(), url: "https://example.com" }
    ]
    saveTabs(initial)
    return initial
  }
  return JSON.parse(raw)
}

export function saveTabs(tabs: Tab[]) {
  localStorage.setItem(KEY, JSON.stringify(tabs))
}

export function newTab(): Tab {
  return {
    id: crypto.randomUUID(),
    url: "https://example.com"
  }
}
