import { Note } from "../types/Note"

const KEY = "nova_notes"

export function loadNotes(): Note[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const initial: Note[] = [
      {
        id: crypto.randomUUID(),
        title: "Welcome",
        content: "This is your first note.",
        updatedAt: Date.now()
      }
    ]
    saveNotes(initial)
    return initial
  }
  return JSON.parse(raw)
}

export function saveNotes(notes: Note[]) {
  localStorage.setItem(KEY, JSON.stringify(notes))
}

export function createNote(): Note {
  return {
    id: crypto.randomUUID(),
    title: "New Note",
    content: "",
    updatedAt: Date.now()
  }
}
