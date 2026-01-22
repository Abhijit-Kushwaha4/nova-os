export function exportAsText(messages) {
  let content = "";

  messages.forEach((msg) => {
    content += `${msg.role.toUpperCase()}:\n${msg.content}\n\n`;
  });

  downloadFile(content, "chat.txt", "text/plain");
}

export function exportAsJSON(messages) {
  const content = JSON.stringify(messages, null, 2);
  downloadFile(content, "chat.json", "application/json");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
