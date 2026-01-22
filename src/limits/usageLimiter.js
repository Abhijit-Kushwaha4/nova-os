const DAILY_LIMIT = 50; // messages per user per day
const STORAGE_KEY = "nova_usage_limit";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function canSendMessage(userEmail) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const today = getToday();

  if (!data[userEmail] || data[userEmail].date !== today) {
    data[userEmail] = { count: 0, date: today };
  }

  if (data[userEmail].count >= DAILY_LIMIT) {
    return false;
  }

  return true;
}

export function recordMessage(userEmail) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const today = getToday();

  if (!data[userEmail] || data[userEmail].date !== today) {
    data[userEmail] = { count: 0, date: today };
  }

  data[userEmail].count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getRemainingMessages(userEmail) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const today = getToday();

  if (!data[userEmail] || data[userEmail].date !== today) {
    return DAILY_LIMIT;
  }

  return DAILY_LIMIT - data[userEmail].count;
}
