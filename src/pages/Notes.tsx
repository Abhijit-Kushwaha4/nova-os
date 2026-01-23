import { useEffect, useState } from "react"
import { Note } from "../types/Note"
import { loadNotes, saveNotes, createNote } from "../lib/notes"

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const n = loadNotes()
    setNotes(n)
    setActiveId(n[0]?.id ?? null)
  }, [])

  const active = notes.find(n => n.id === activeId)

  function update(note: Note) {
    const updated = notes.map(n =>
      n.id === note.id ? note : n
    )
    setNotes(updated)
    saveNotes(updated)
  }

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <aside style={{ width: 200, borderRight: "1px solid #ccc" }}>
        <button
          onClick={() => {
            const n = createNote()
            const updated = [n, ...notes]
            setNotes(updated)
            setActiveId(n.id)
            saveNotes(updated)
          }}
        >
          ➕ New
        </button>

        {notes.map(n => (
          <div
            key={n.id}
            onClick={() => setActiveId(n.id)}
            style={{
              padding: 8,
              cursor: "pointer",
              background: n.id === activeId ? "#eee" : ""
            }}
          >
            {n.title}
          </div>
        ))}
      </aside>

      {active && (
        <main style={{ flex: 1, padding: 16 }}>
          <input
            value={active.title}
            onChange={e =>
              update({ ...active, title: e.target.value })
            }
            style={{ width: "100%", fontSize: 18 }}
          />
          <textarea
            value={active.content}
            onChange={e =>
              update({
                ...active,
                content: e.target.value,
                updatedAt: Date.now()
              })
            }
            style={{ width: "100%", height: "90%" }}
          />
        </main>
      )}
    </div>
  )
}
