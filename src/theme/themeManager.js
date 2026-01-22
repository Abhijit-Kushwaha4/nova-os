const THEME_KEY = "nova_theme";

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.body.setAttribute("data-theme", theme);
}

export function initTheme() {
  const theme = getTheme();
  document.body.setAttribute("data-theme", theme);
}
