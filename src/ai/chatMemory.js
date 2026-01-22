let chatHistory = [];

export function addMessage(role, content) {
  chatHistory.push({ role, content });
}

export function getChatHistory() {
  return chatHistory;
}

export function clearChatHistory() {
  chatHistory = [];
}
