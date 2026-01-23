import { useEffect, useState } from "react"
import { Task } from "../types/Task"
import { loadTasks, killTask } from "../lib/taskManager"

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])

  function refresh() {
    setTasks(loadTasks())
  }

  useEffect(() => {
    refresh()
    const i = setInterval(refresh, 1000)
    return () => clearInterval(i)
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h2>🧠 Task Manager</h2>

      {tasks.length === 0 && <p>No running apps</p>}

      {tasks.map(t => (
        <div
          key={t.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 6,
            borderBottom: "1px solid #ccc"
          }}
        >
          <span>{t.name}</span>
          <button
            onClick={() => {
              killTask(t.id)
              refresh()
            }}
          >
            ❌ End
          </button>
        </div>
      ))}
    </div>
  )
}
