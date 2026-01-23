import { useEffect, useState } from "react"
import { Message, AIModel } from "../types/AI"
import { loadChat, saveChat } from "../lib/aiChat"
import { getModel } from "../ai/bytez"

export default function AIAssistant() {
  const [chat, setChat] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [model, setModel] =
    useState<AIModel>("openai/gpt-4.1-mini")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setChat(loadChat())
  }, [])

  async function send() {
    if (!input.trim()) return

    const updated = [...chat, { role: "user", content: input }]
    setChat(updated)
    saveChat(updated)
    setInput("")
    setLoading(true)

    const m = getModel(model)

    const { output } = await m.run(updated)

    const final = [
      ...updated,
      { role: "assistant", content: output }
    ]

    setChat(final)
    saveChat(final)
    setLoading(false)
  }

  return (
    <div style={{ padding: 16, height: "100%" }}>
      <h2>🤖 AI Assistant</h2>

      <select
        value={model}
        onChange={e => setModel(e.target.value as AIModel)}
      >
        <option value="openai/gpt-4.1-mini">
          GPT-4.1-mini
        </option>
        <option value="google/gemini-3-pro-preview">
          Gemini 3 Pro
        </option>
      </select>

      <div style={{ height: "70%", overflow: "auto", marginTop: 10 }}>
        {chat.map((m, i) => (
          <p key={i}>
            <b>{m.role}:</b> {m.content}
          </p>
        ))}
        {loading && <p>Thinking…</p>}
      </div>

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && send()}
        placeholder="Ask anything…"
        style={{ width: "100%", marginTop: 10 }}
      />
    </div>
  )
}
