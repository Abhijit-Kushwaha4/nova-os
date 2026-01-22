import { useEffect, useState } from "react";
import { getTheme, setTheme } from "../theme/themeManager";

export default function ThemeToggle() {
  const [theme, setCurrentTheme] = useState(getTheme());

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  return (
    <button
      onClick={() =>
        setCurrentTheme(theme === "light" ? "dark" : "light")
      }
      style={{
        marginBottom: "10px",
        padding: "6px 10px",
        cursor: "pointer"
      }}
    >
      {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
    </button>
  );
}
