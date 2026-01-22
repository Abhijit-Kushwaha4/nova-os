import { useEffect, useState } from "react";
import { askAI } from "../ai/aiRouterWithFallback";
import {
  addMessage,
  getChatHistory,
  clearChatHistory
} from "../ai/chatMemoryLocal";
import { PROMPT_MODES } from "../ai/promptModes";

export default function AIChatWithModes() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("exam");

  useEffect(() => {
    setMessages(getChatHistory());
  }, []);

  async function sendMessage() {
    if (!input.trim()) return;

    const systemPrompt = PROMPT_MODES[mode].systemPrompt;
    const finalPrompt = `${systemPrompt}\n\nUser question: ${input}`;

    addMessage("user", `[${PROMPT_MODES[mode].label}] ${input}`);
    setMessages(getChatHistory());

    const reply = await askAI(finalPrompt);

    addMessage("assistant", reply);
    setMessages(getChatHistory());
    setInput("");
  }

  function resetChat() {
    clearChatHistory();
    setMessages([]);
  }

  return (
    <div style={{ maxWidth: "650px", margin: "auto" }}>
      <h2>AI Chat (Prompt Modes)</h2>

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        style={{ marginBottom: "10px" }}
      >
        {Object.entries(PROMPT_MODES).map(([key, val]) => (
          <option key={key} value={key}>
            {val.label}
          </option>
        ))}
      </select>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "300px",
          overflowY: "auto"
        }}
      >
        {messages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.role}:</strong> {msg.content}
          </p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
        style={{ width: "100%", marginTop: "10px" }}
      />

      <button onClick={sendMessage} style={{ marginTop: "10px" }}>
        Send
      </button>

      <button onClick={resetChat} style={{ marginLeft: "10px" }}>
        Clear
      </button>
    </div>
  );
}
