import express from "express";
import path from "path";
import fs from "fs";
import { ttsService } from "../services/ttsService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No text provided" });
    }

    // File to save the generated audio
    const outFile = path.resolve("outputs/speech.mp3");

    // Generate speech from text
    const mp3 = await ttsService(message);

    // Save audio to file
    const buffer = Buffer.from(await mp3.arrayBuffer()); // ✅ works with SDK 4.0+
    fs.writeFileSync("output.mp3", buffer);

    console.log("✅ Saved to output.mp3");

    console.log("✅ Speech generated at", outFile);

    // Optionally, stream back to client
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).send("Error generating speech");
  }
});

export default router;
