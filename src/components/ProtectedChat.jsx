import { useState } from "react";
import { getUser, logoutUser } from "../auth/authStorage";
import AIChatStreaming from "./AIChatStreaming";
import Login from "./Login";

export default function ProtectedChat() {
  const [user, setUser] = useState(getUser());

  if (!user) {
    return <Login onLogin={() => setUser(getUser())} />;
  }

  return (
    <div>
      <p>
        Logged in as <strong>{user.name}</strong>
        <button
          style={{ marginLeft: "10px" }}
          onClick={() => {
            logoutUser();
            setUser(null);
          }}
        >
          Logout
        </button>
      </p>

      <AIChatStreaming />
    </div>
  );
}
