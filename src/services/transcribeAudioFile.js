import openai from "../config/openai.js";
import fs from "fs";
import path from "path";
import { webmToWav } from "./webmToWav.js";

export async function transcribeAudioFile(req) {
  if (!req.file) {
    throw new Error("No audio file uploaded");
  }

  try {
    // Convert uploaded file (e.g. webm → wav)
    const inputPath = req.file.path; // e.g. "uploads/abc123"
    const outputPath = path.join("uploads", `${req.file.filename}.wav`); // e.g. "uploads/abc123.wav"
    const wavFile = await webmToWav(inputPath, outputPath);
    console.log("Converted audio to WAV:", wavFile);

    // Send to OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(wavFile),
      model: "gpt-4o-mini-transcribe", // or "whisper-1"
    });

    console.log("📝 Transcription:", transcription.text);

    return transcription.text;
  } finally {
    // cleanup both original + converted
    try {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (fs.existsSync("uploads/recorded.wav"))
        fs.unlinkSync("uploads/recorded.wav");
    } catch (err) {
      console.warn("⚠️ Cleanup failed:", err);
    }
  }
}
