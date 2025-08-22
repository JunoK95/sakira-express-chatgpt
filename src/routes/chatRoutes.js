import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import { getChatReply } from "../services/chatService.js";
import { transcribeAudioFile } from "../services/transcribeAudioFile.js";
import { ttsService } from "../services/ttsService.js";

// Configure storage to always save as 'recorded.wav'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "recorded.wav");
  },
});

// Multer setup with forced MIME type
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Force MIME type to 'audio/wav'
    file.mimetype = "audio/wav";
    // Force filename to 'recorded.wav'
    file.originalname = "recorded.wav";
    cb(null, true);
  },
});

// In-memory chat histories per user
const chatHistories = {};

const router = express.Router();

router.post("/", upload.single("audio"), async (req, res) => {
  const { message, userId, mute = true } = req.body;

  let finalMessage = message || "";

  // Transcribe audio if uploaded
  if (req.file) {
    console.log("Audio file uploaded:", req.file);
    try {
      finalMessage = await transcribeAudioFile(req);
    } catch (err) {
      console.error("Transcription failed:", err);
      return res.status(500).json({ error: "Audio transcription failed" });
    }
  }

  if (!finalMessage || finalMessage.trim() === "") {
    return res.status(400).json({ error: "No message or audio content" });
  }

  // Initialize chat history for user if needed
  if (!chatHistories[userId]) {
    chatHistories[userId] = [];
  }

  // Append user's message to history
  chatHistories[userId].push({ role: "user", content: finalMessage });

  try {
    console.log("Requesting reply for:", finalMessage);
    const reply = await getChatReply(finalMessage);
    console.log("Received reply:", reply);

    if (mute) {
      // If muted, just send back message and reply without audio
      return res.json({ msg: finalMessage, reply, audio: null });
    }

    // Generate speech audio from reply
    const audioResponse = await ttsService(reply);
    const outFilePath = path.join("outputs", "speech.mp3");
    const buffer = Buffer.from(await audioResponse.arrayBuffer()); // SDK 4.0+ support
    fs.writeFileSync(outFilePath, buffer);
    console.log("Audio saved at:", outFilePath);

    res.json({ msg: finalMessage, reply, audio: audioResponse });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
