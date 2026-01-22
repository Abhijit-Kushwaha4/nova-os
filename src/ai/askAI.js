import { geminiModel, gptMiniModel } from "./bytezClient";

// Ask Gemini
export async function askGemini(message) {
  const { error, output } = await geminiModel.run([
    {
      role: "user",
      content: message
    }
  ]);

  if (error) {
    console.error("Gemini Error:", error);
    return "Gemini failed to respond.";
  }

  return output;
}

// Ask GPT-4.1 Mini
export async function askGPTMini(message) {
  const { error, output } = await gptMiniModel.run([
    {
      role: "user",
      content: message
    }
  ]);

  if (error) {
    console.error("GPT Mini Error:", error);
    return "GPT-4.1 Mini failed to respond.";
  }

  return output;
}
