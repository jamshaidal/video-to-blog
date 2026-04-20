const fs = require("fs/promises");
const { extractAudioToMp3 } = require("../services/audioService");
const { transcribeAudioFile } = require("../services/transcriptionService");
const {
  generateContentFromTranscript,
  normalizeGeneratedContent,
} = require("../services/contentGenerationService");

async function processVideo(req, res, next) {
  const videoPath = req.file?.path;
  let audioPath;

  try {
    if (!req.file) {
      const error = new Error("Please upload a video file using the 'video' field.");
      error.statusCode = 400;
      throw error;
    }

    audioPath = await extractAudioToMp3(videoPath);
    const transcript = await transcribeAudioFile(audioPath);
    const generatedContent = await generateContentFromTranscript(transcript);

    res.status(200).json({
      success: true,
      transcript,
      ...normalizeGeneratedContent(generatedContent),
    });
  } catch (error) {
    next(error);
  } finally {
    if (videoPath) {
      await fs.unlink(videoPath).catch(() => {});
    }

    if (audioPath) {
      await fs.unlink(audioPath).catch(() => {});
    }
  }
}

module.exports = {
  processVideo,
};
