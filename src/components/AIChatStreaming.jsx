import { useEffect, useState } from "react";
import { streamAIResponse } from "../ai/streamingAI";
import {
  addMessage,
  getChatHistory,
  clearChatHistory
} from "../ai/chatMemoryLocal";

export default function AIChatStreaming() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setMessages(getChatHistory());
  }, []);

  async function sendMessage() {
    if (!input.trim() || isTyping) return;

    addMessage("user", input);
    setMessages(getChatHistory());

    setIsTyping(true);

    let liveText = "";
    streamAIResponse(input, (chunk) => {
      liveText = chunk;
      setMessages([
        ...getChatHistory(),
        { role: "assistant", content: liveText }
      ]);
    }).then((finalText) => {
      addMessage("assistant", finalText);
      setMessages(getChatHistory());
      setIsTyping(false);
    });

    setInput("");
  }

  function resetChat() {
    clearChatHistory();
    setMessages([]);
  }

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Streaming AI Chat</h2>

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
        {isTyping && <p><em>AI is typing…</em></p>}
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
