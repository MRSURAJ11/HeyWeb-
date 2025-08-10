// utils/audioUtils.js
// Audio recording utilities using MediaRecorder API

let mediaRecorder = null;
let audioChunks = [];

/**
 * Start recording from user's microphone.
 * @returns {Promise<MediaStream>}
 */
export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioChunks = [];
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.start();
  return stream;
}

/**
 * Stop recording and return audio Blob.
 * @returns {Promise<Blob>}
 */
export async function stopRecording() {
  if (!mediaRecorder) throw new Error("No recording in progress");

  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      resolve(audioBlob);
    };
    mediaRecorder.stop();
  });
}

/**
 * Download audio file locally.
 * @param {Blob} blob 
 * @param {string} filename 
 */
export function downloadAudio(blob, filename = "recording.wav") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
