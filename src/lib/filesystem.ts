import { FSItem } from "../types/FileSystem"

const KEY = "nova_fs"

export function loadFS(): FSItem[] {
  const data = localStorage.getItem(KEY)
  if (!data) {
    const initial: FSItem[] = [
      { id: "1", name: "Documents", type: "folder" },
      { id: "2", name: "readme.txt", type: "file", content: "Welcome to Nova OS" }
    ]
    saveFS(initial)
    return initial
  }
  return JSON.parse(data)
}

export function saveFS(items: FSItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function createFile(name: string) {
  const fs = loadFS()
  fs.push({
    id: crypto.randomUUID(),
    name,
    type: "file",
    content: ""
  })
  saveFS(fs)
}

export function deleteItem(id: string) {
  const fs = loadFS().filter(i => i.id !== id)
  saveFS(fs)
}
