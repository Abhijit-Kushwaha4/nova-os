import { useState } from "react"
import { runCommand } from "../lib/terminal"

export default function Terminal() {
  const [history, setHistory] = useState<string[]>([
    "Nova OS Terminal — type `help`"
  ])
  const [input, setInput] = useState("")

  function execute() {
    const result = runCommand(input)

    if (result.clear) {
      setHistory([])
    } else {
      setHistory(h => [...h, `$ ${input}`, result.output])
    }

    setInput("")
  }

  return (
    <div
      style={{
        background: "#000",
        color: "#0f0",
        padding: 16,
        height: "100%",
        fontFamily: "monospace"
      }}
    >
      {history.map((line, i) => (
        <pre key={i}>{line}</pre>
      ))}

      <div>
        <span>$ </span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && execute()}
          style={{
            background: "black",
            color: "#0f0",
            border: "none",
            outline: "none",
            width: "90%"
          }}
        />
      </div>
    </div>
  )
}
