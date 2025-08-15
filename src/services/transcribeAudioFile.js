import openai from "../config/openai.js";
import fs from "fs";

export async function transcribeAudioFile(req) {
  if (!req.file) {
    throw new Error("No audio file uploaded");
  }

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(req.file.path),
    model: "gpt-4o-mini-transcribe", // or 'whisper-1'
    filename: "recorded.wav", // helps OpenAI detect format
  });

  console.log("Transcription:", transcription.text);
  fs.unlinkSync(req.file.path); // cleanup temp file

  return transcription.text;
}
