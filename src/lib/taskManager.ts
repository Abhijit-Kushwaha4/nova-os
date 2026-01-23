import { Task } from "../types/Task"

const KEY = "nova_tasks"

export function loadTasks(): Task[] {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks))
}

export function registerTask(name: string): Task {
  const tasks = loadTasks()
  const task: Task = {
    id: crypto.randomUUID(),
    name,
    startedAt: Date.now()
  }
  const updated = [...tasks, task]
  saveTasks(updated)
  return task
}

export function killTask(id: string) {
  const updated = loadTasks().filter(t => t.id !== id)
  saveTasks(updated)
}
