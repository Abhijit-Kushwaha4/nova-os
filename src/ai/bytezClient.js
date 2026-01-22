import Bytez from "bytez.js";

const apiKey = import.meta.env.VITE_BYTEZ_API_KEY;

if (!apiKey) {
  throw new Error("Bytez API key missing. Check .env file.");
}

const sdk = new Bytez(apiKey);

// Models
export const geminiModel = sdk.model("google/gemini-3-pro-preview");
export const gptMiniModel = sdk.model("openai/gpt-4.1-mini");
