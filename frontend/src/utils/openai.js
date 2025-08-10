// utils/openai.js
// Client-side helper to call backend routes for AI chat & optional transcription.

export async function sendMessageToAI(message, settings = {}) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, settings }),
    });
    if (!res.ok) throw new Error("Failed to get AI response");
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error("sendMessageToAI error:", err);
    return "Sorry, there was an error talking to the AI.";
  }
}

export async function transcribeAudio(blob) {
  const formData = new FormData();
  formData.append("audio", blob, "voice.wav");

  try {
    const res = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to transcribe audio");
    const data = await res.json();
    return data.text;
  } catch (err) {
    console.error("transcribeAudio error:", err);
    return "";
  }
}
