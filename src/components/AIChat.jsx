import { useState } from "react";
import { askAI } from "../ai/aiRouterWithFallback";
import {
  addMessage,
  getChatHistory,
  clearChatHistory
} from "../ai/chatMemory";

export default function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  async function sendMessage() {
    if (!input.trim()) return;

    // Add user message
    addMessage("user", input);
    setMessages([...getChatHistory()]);

    // Ask AI using router + fallback
    const reply = await askAI(input);

    // Add AI reply
    addMessage("assistant", reply);
    setMessages([...getChatHistory()]);
    setInput("");
  }

  function resetChat() {
    clearChatHistory();
    setMessages([]);
  }

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>AI Assistant</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "300px"
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
        placeholder="Ask anything..."
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
