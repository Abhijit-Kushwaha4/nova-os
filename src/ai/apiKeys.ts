/**
 * API Keys configuration
 * Load from environment variables for security
 */

export const getApiKey = (provider?: string): string => {
  const key = import.meta.env.VITE_BYTEZ_API_KEY;
  
  if (!key) {
    console.warn(
      'No API key found. Set VITE_BYTEZ_API_KEY in .env.local'
    );
    return '';
  }
  
  return key;
};

export const getModelKey = (modelProvider: string): string => {
  const keys: Record<string, string> = {
    anthropic: import.meta.env.VITE_ANTHROPIC_KEY || '',
    openai: import.meta.env.VITE_OPENAI_KEY || '',
    google: import.meta.env.VITE_GOOGLE_KEY || '',
    deepseek: import.meta.env.VITE_DEEPSEEK_KEY || '',
  };
  
  return keys[modelProvider] || getApiKey();
};

export const SUPPORTED_MODELS = [
  "anthropic/claude-opus-4-1",
  "anthropic/claude-opus-4-5",
  "anthropic/claude-haiku-4-5",
  "anthropic/claude-sonnet-4-5",
  "deepseek-ai/deepseek-coder-6.7b-instruct",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "google/gemini-3-pro-preview",
] as const;
