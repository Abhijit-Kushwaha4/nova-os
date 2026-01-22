import { useState } from "react";

export default function VoiceInput({ onTranscribe }) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return alert("Your browser does not support voice recognition");
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscribe(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <button onClick={startListening} style={{ marginLeft: "8px" }}>
      {listening ? "🎙️ Listening..." : "🎤 Speak"}
    </button>
  );
}
