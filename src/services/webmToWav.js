import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

/**
 * Converts a WebM audio file to WAV format.
 * @param {string} inputPath - Path to the input .webm file.
 * @param {string} outputPath - Path to save the output .wav file.
 * @returns {Promise<string>} - Resolves with outputPath when done.
 */
export function webmToWav(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      return reject(
        new Error("ffmpeg not found. Did you install ffmpeg-static?")
      );
    }

    // ensure output directory exists
    const outDir = outputPath.substring(0, outputPath.lastIndexOf("/"));
    if (outDir && !fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const ffmpeg = spawn(ffmpegPath, [
      "-y", // overwrite output if exists
      "-i",
      inputPath, // input file
      "-ar",
      "16000", // sample rate required for Whisper
      "-ac",
      "1", // mono channel
      "-f",
      "wav", // force wav format
      outputPath,
    ]);

    ffmpeg.stderr.on("data", (data) => {
      console.log("ffmpeg:", data.toString());
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}
