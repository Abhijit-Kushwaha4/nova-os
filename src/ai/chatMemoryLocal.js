const STORAGE_KEY = "ai_chat_history";

export function getChatHistory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addMessage(role, content) {
  const history = getChatHistory();
  history.push({ role, content });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearChatHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
