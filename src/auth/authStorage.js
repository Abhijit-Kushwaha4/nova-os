const USER_KEY = "nova_user";

export function loginUser(email, name) {
  const user = { email, name };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function logoutUser() {
  localStorage.removeItem(USER_KEY);
}
