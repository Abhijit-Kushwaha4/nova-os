export type AIModel =
  | "openai/gpt-4.1-mini"
  | "google/gemini-3-pro-preview"

export interface Message {
  role: "user" | "assistant"
  content: string
}
