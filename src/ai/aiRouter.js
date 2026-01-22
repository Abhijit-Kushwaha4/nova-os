import { askGemini, askGPTMini } from "./askAI";

/*
  Simple AI Router
  - Coding / technical → GPT
  - Explanation / learning → Gemini
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

  for (const word of codeKeywords) {
    if (msg.includes(word)) {
      return "code";
    }
  }

  return "general";
}

export async function askAI(message) {
  const intent = detectIntent(message);

  if (intent === "code") {
    console.log("🧠 Routing to GPT-4.1 Mini");
    return await askGPTMini(message);
  } else {
    console.log("🧠 Routing to Gemini 3 Pro");
    return await askGemini(message);
  }
}
