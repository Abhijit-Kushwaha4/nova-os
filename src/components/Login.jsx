import { useState } from "react";
import { loginUser } from "../auth/authStorage";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  function handleLogin() {
    if (!email || !name) return alert("Fill all fields");
    loginUser(email, name);
    onLogin();
  }

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
