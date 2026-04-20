const ffmpeg = require("fluent-ffmpeg");

function extractAudioToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
}

function getMediaDurationInSeconds(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, metadata) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(Math.ceil(metadata?.format?.duration || 0));
    });
  });
}

module.exports = {
  extractAudioToMp3,
  getMediaDurationInSeconds,
};
