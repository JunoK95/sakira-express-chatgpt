const AudioRecorder = require("node-audiorecorder");
const fs = require("fs");
const openai = require("../config/openai.js");

function recordDemo() {
  const fileName = "recorded.wav";
  const recorder = new AudioRecorder(
    {
      program: "sox",
      silence: 0,
    },
    console
  );

  // Log information on the following events.
  recorder.on("error", function () {
    console.warn("Recording error.");
  });
  recorder.on("end", function () {
    console.warn("Recording ended.");
  });

  console.log("Writing new recording file at:", fileName);

  // Create write stream.
  const fileStream = fs.createWriteStream(fileName, { encoding: "binary" });

  // Start and write to the file.
  recorder.start().stream().pipe(fileStream);

  // Stop after 5 seconds.
  setTimeout(async () => {
    recorder.stop();
    console.log("Recording stopped. Processing audio...");

    const transcription = await openai.default.audio.transcriptions.create({
      file: fs.createReadStream("recorded.wav"),
      model: "gpt-4o-mini-transcribe",
    });

    console.log("Transcription:", transcription.text);
    return transcription.text;
  }, 5000);

  // Keep process alive.
  console.warn("Press ctrl+c to exit or wait 5 seconds.");
  return;
}

module.exports = recordDemo;
