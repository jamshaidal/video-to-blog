const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { PROCESSED_DIR } = require("../config/paths");

fs.mkdirSync(PROCESSED_DIR, { recursive: true });

function extractAudioToMp3(inputFilePath) {
  const inputName = path.parse(inputFilePath).name;
  const outputFileName = `${inputName}.mp3`;
  const outputFilePath = path.join(PROCESSED_DIR, outputFileName);

  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .noVideo()
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("end", () => resolve(outputFilePath))
      .on("error", (error) => {
        const wrappedError = new Error(
          `Audio extraction failed. Ensure FFmpeg is installed and available in PATH. ${error.message}`
        );
        wrappedError.statusCode = 500;
        reject(wrappedError);
      })
      .save(outputFilePath);
  });
}

module.exports = {
  extractAudioToMp3,
};
