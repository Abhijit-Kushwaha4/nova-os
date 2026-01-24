/**
 * Bytez AI Model Examples
 * Using environment variables for API keys (secure approach)
 * 
 * Install: npm i bytez.js
 */

import Bytez from "bytez.js";
import { getApiKey, SUPPORTED_MODELS } from "./apiKeys";

const apiKey = getApiKey();
const sdk = new Bytez(apiKey);

/**
 * Example: Claude Opus 4.1
 */
export const claudeOpus41 = async () => {
  const model = sdk.model("anthropic/claude-opus-4-1");
  const { error, output } = await model.run([
    {
      role: "user",
      content: "Hello",
    },
  ]);
  console.log({ error, output });
  return { error, output };
};

/**
 * Example: Claude Opus 4.5
 */
export const claudeOpus45 = async () => {
  const model = sdk.model("anthropic/claude-opus-4-5");
  const { error, output } = await model.run([
    {
      role: "user",
      content: "Hello",
    },
  ]);
  console.log({ error, output });
  return { error, output };
};

/**
 * Example: Claude Haiku 4.5
 */
export const claudeHaiku45 = async () => {
  const model = sdk.model("anthropic/claude-haiku-4-5");
  const { error, output } = await model.run([
    {
      role: "user",
      content: "Hello",
    },
  ]);
  console.log({ error, output });
  return { error, output };
};

/**
 * Example: Claude Sonnet 4.5
 */
export const claudeSonnet45 = async () => {
  const model = sdk.model("anthropic/claude-sonnet-4-5");
  const { error, output } = await model.run([
    {
      role: "user",
      content: "Hello",
    },
  ]);
  console.log({ error, output });
  return { error, output };
};

/**
 * Example: DeepSeek Coder 6.7B
 */
export const deepseekCoder = async () => {
  const model = sdk.model("deepseek-ai/deepseek-coder-6.7b-instruct");
  const { error, output } = await model.run([
    {
      role: "user",
      content: "Hello",
    },
  ]);
  console.log({ error, output });
  return { error, output };
};

/**
 * Example: GPT-4o
 */
export const gpt4o = async () => {
  const model = sdk.model("openai/gpt-4o");
  const { error, output } = await model.run([
    {
      role: "user",
      content: "Hello",
    },
  ]);
  console.log({ error, output });
  return { error, output };
};

/**
 * Example: GPT-4o Mini
 */
export const gpt4oMini = async () => {
  const model = sdk.model("openai/gpt-4o-mini");
  const { error, output } = await model.run([
    {
      role: "user",
      content: "Hello",
    },
  ]);
  console.log({ error, output });
  return { error, output };
};

/**
 * Example: Google Gemini 3 Pro Preview
 */
export const gemini3Pro = async () => {
  const model = sdk.model("google/gemini-3-pro-preview");
  const { error, output } = await model.run([
    {
      role: "user",
      content: "Hello",
    },
  ]);
  console.log({ error, output });
  return { error, output };
};

/**
 * Generic function to run any supported model
 */
export const runModel = async (modelName: string, prompt: string) => {
  if (!SUPPORTED_MODELS.includes(modelName as any)) {
    console.error(`Model ${modelName} not supported`);
    return { error: "Model not supported" };
  }

  const model = sdk.model(modelName);
  const { error, output } = await model.run([
    {
      role: "user",
      content: prompt,
    },
  ]);

  return { error, output };
};
