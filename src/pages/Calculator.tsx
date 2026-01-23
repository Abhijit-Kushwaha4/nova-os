import { useState } from "react"
import { calculate } from "../lib/calculator"

const buttons = [
  "7","8","9","/",
  "4","5","6","*",
  "1","2","3","-",
  "0",".","=","+",
  "C"
]

export default function Calculator() {
  const [expr, setExpr] = useState("")

  function press(b: string) {
    if (b === "C") return setExpr("")
    if (b === "=") return setExpr(calculate(expr))
    setExpr(e => e + b)
  }

  return (
    <div style={{ padding: 16, width: 200 }}>
      <input
        value={expr}
        onChange={e => setExpr(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 4
        }}
      >
        {buttons.map(b => (
          <button key={b} onClick={() => press(b)}>
            {b}
          </button>
        ))}
      </div>
    </div>
  )
}
