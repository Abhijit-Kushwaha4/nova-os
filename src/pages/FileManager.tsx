import { useEffect, useState } from "react"
import { FSItem } from "../types/FileSystem"
import { loadFS, createFile, deleteItem } from "../lib/filesystem"

export default function FileManager() {
  const [items, setItems] = useState<FSItem[]>([])
  const [name, setName] = useState("")

  function refresh() {
    setItems(loadFS())
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h2>📁 File Manager</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="new file name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button
          onClick={() => {
            createFile(name)
            setName("")
            refresh()
          }}
        >
          Create
        </button>
      </div>

      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.type === "folder" ? "📂" : "📄"} {item.name}
            <button
              style={{ marginLeft: 8 }}
              onClick={() => {
                deleteItem(item.id)
                refresh()
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
