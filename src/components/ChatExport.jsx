import { exportAsText, exportAsJSON } from "../utils/chatExporter";

export default function ChatExport({ messages }) {
  return (
    <div style={{ marginTop: "10px" }}>
      <button onClick={() => exportAsText(messages)}>
        📄 Export TXT
      </button>

      <button
        onClick={() => exportAsJSON(messages)}
        style={{ marginLeft: "8px" }}
      >
        🧠 Export JSON
      </button>
    </div>
  );
}
