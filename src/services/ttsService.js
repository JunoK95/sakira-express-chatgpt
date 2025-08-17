import openai from "../config/openai.js";

export async function ttsService(text) {
  console.log("TTS Service called with text:", text);

  if (!text || typeof text !== "string") {
    throw new Error("Invalid text input for TTS");
  }

  try {
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      input: text,
      voice: "alloy",
    });

    console.log("TTS Response:", response);
    return response;
  } catch (error) {
    console.error("Error in TTS service:", error);
    throw error;
  }
}
