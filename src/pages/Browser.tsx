import { useEffect, useState } from "react"
import { Tab } from "../types/Browser"
import { loadTabs, saveTabs, newTab } from "../lib/browser"

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const t = loadTabs()
    setTabs(t)
    setActiveId(t[0].id)
  }, [])

  const active = tabs.find(t => t.id === activeId)

  function update(tab: Tab) {
    const updated = tabs.map(t =>
      t.id === tab.id ? tab : t
    )
    setTabs(updated)
    saveTabs(updated)
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Tabs */}
      <div style={{ display: "flex", background: "#ddd" }}>
        {tabs.map(t => (
          <div
            key={t.id}
            onClick={() => setActiveId(t.id)}
            style={{
              padding: 8,
              cursor: "pointer",
              background: t.id === activeId ? "#fff" : "#ccc"
            }}
          >
            {t.url}
          </div>
        ))}
        <button
          onClick={() => {
            const t = newTab()
            const updated = [...tabs, t]
            setTabs(updated)
            setActiveId(t.id)
            saveTabs(updated)
          }}
        >
          ➕
        </button>
      </div>

      {/* Address bar */}
      {active && (
        <input
          value={active.url}
          onChange={e =>
            update({ ...active, url: e.target.value })
          }
          onKeyDown={e => e.key === "Enter" && saveTabs(tabs)}
          style={{ padding: 6 }}
        />
      )}

      {/* Web view */}
      {active && (
        <iframe
          src={active.url}
          style={{ flex: 1, border: "none" }}
        />
      )}
    </div>
  )
}
