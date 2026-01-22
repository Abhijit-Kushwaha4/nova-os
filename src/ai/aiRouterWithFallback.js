import { askGemini, askGPTMini } from "./askAI";

/*
  AI Router with Fallback
  Priority:
  - Code → GPT → Gemini fallback
  - General → Gemini → GPT fallback
*/

function detectIntent(message) {
  const codeKeywords = [
    "code",
    "javascript",
    "python",
    "react",
    "function",
    "api",
    "bug",
    "error",
    "fix",
    "algorithm",
    "sql",
    "html",
    "css"
  ];

  const msg = message.toLowerCase();

  return codeKeywords.some(word => msg.includes(word))
    ? "code"
    : "general";
}

export async function askAI(message) {
  const intent = detectIntent(message);

  // CODE TASKS
  if (intent === "code") {
    try {
      console.log("🧠 Trying GPT-4.1 Mini");
      return await askGPTMini(message);
    } catch (err) {
      console.warn("⚠️ GPT failed, switching to Gemini");
      return await askGemini(message);
    }
  }

  // GENERAL TASKS
  try {
    console.log("🧠 Trying Gemini 3 Pro");
    return await askGemini(message);
  } catch (err) {
    console.warn("⚠️ Gemini failed, switching to GPT");
    return await askGPTMini(message);
  }
}
