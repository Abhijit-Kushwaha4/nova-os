import { useState } from "react";

export default function ClearChatConfirm({ onConfirm }) {
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    setOpen(true);
  };

  const handleYes = () => {
    onConfirm();
    setOpen(false);
  };

  const handleNo = () => {
    setOpen(false);
  };

  return (
    <div style={{ display: "inline-block", marginLeft: "8px" }}>
      <button onClick={handleClear}>🗑️ Clear Chat</button>

      {open && (
        <div
          style={{
            position: "absolute",
            background: "#fff",
            border: "1px solid #ccc",
            padding: "10px",
            zIndex: 1000,
            marginTop: "5px"
          }}
        >
          <p>Are you sure you want to clear the chat?</p>
          <button onClick={handleYes} style={{ marginRight: "5px" }}>
            Yes
          </button>
          <button onClick={handleNo}>No</button>
        </div>
      )}
    </div>
  );
}
