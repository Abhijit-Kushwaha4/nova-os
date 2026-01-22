import { askAI } from "./aiRouterWithFallback";

/*
  Fake streaming (typing effect)
  Works with ANY AI model
*/

export async function streamAIResponse(message, onUpdate) {
  const fullResponse = await askAI(message);

  let currentText = "";
  const words = fullResponse.split(" ");

  for (let i = 0; i < words.length; i++) {
    currentText += words[i] + " ";
    onUpdate(currentText.trim());

    // typing speed (ms)
    await new Promise((res) => setTimeout(res, 60));
  }

  return fullResponse;
}
