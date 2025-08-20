import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { getChatReply } from "../services/chatService.js";
import { transcribeAudioFile } from "../services/transcribeAudioFile.js";
import { ttsService } from "../services/ttsService.js";

// Force file name and type
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "recorded.wav"); // Always save as recorded.wav
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Force correct mimetype
    file.mimetype = "audio/wav";
    file.originalname = "recorded.wav";
    cb(null, true);
  },
});

// In-memory chat history (per userId)
const chatHistories = {};

const router = express.Router();

router.post("/", upload.single("audio"), async (req, res) => {
  const { message, userId } = req.body;

  let finalMessage = message || "";

  // Transcribe uploaded audio if present
  if (req.file) {
    console.log("Audio file uploaded:", req.file);
    finalMessage = await transcribeAudioFile(req);
  }

  if (!finalMessage || finalMessage.trim() === "") {
    return res.status(400).json({ error: "No message or audio content" });
  }

  // Initialize history if needed
  if (!chatHistories[userId]) chatHistories[userId] = [];

  // Append user message to history
  chatHistories[userId].push({ role: "user", content: finalMessage });

  // Ask OpenAI for a chat reply
  try {
    console.log("Asking OpenAI for reply:", finalMessage);
    const reply = await getChatReply(finalMessage);
    console.log("OpenAI reply:", reply);
    const audioResponse = await ttsService(reply);
    // Save audio to file
    // File to save the generated audio
    const outFile = path.resolve("outputs/speech.mp3");
    const buffer = Buffer.from(await audioResponse.arrayBuffer()); // ✅ works with SDK 4.0+
    fs.writeFileSync("output.mp3", buffer);

    console.log("✅ Saved to output.mp3");

    console.log("✅ Speech generated at", outFile);
    res.json({ reply, audio: audioResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
