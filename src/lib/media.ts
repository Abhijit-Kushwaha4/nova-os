const KEY = "nova_media_last"

export function loadLastMedia(): string | null {
  return localStorage.getItem(KEY)
}

export function saveLastMedia(src: string) {
  localStorage.setItem(KEY, src)
}
