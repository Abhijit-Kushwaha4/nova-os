import { useEffect, useState } from "react"
import { loadLastMedia, saveLastMedia } from "../lib/media"

export default function MediaPlayer() {
  const [src, setSrc] = useState<string>("")

  useEffect(() => {
    const last = loadLastMedia()
    if (last) setSrc(last)
  }, [])

  function loadFile(file: File) {
    const url = URL.createObjectURL(file)
    setSrc(url)
    saveLastMedia(url)
  }

  const isVideo = src.endsWith(".mp4") || src.endsWith(".webm")

  return (
    <div style={{ padding: 16 }}>
      <h2>🎵 Media Player</h2>

      <input
        type="file"
        accept="audio/*,video/*"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) loadFile(f)
        }}
      />

      {src && (
        isVideo ? (
          <video src={src} controls style={{ width: "100%" }} />
        ) : (
          <audio src={src} controls />
        )
      )}
    </div>
  )
}
