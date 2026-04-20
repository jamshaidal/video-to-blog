const fs = require("fs/promises");
const { transcribeAudioFile } = require("../services/transcriptionService");

async function transcribeAudio(req, res, next) {
  const uploadedFilePath = req.file?.path;

  try {
    if (!req.file) {
      const error = new Error("Please upload an audio file using the 'audio' field.");
      error.statusCode = 400;
      throw error;
    }

    const transcript = await transcribeAudioFile(uploadedFilePath);

    res.status(200).json({
      success: true,
      transcript,
    });
  } catch (error) {
    next(error);
  } finally {
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }
  }
}

module.exports = {
  transcribeAudio,
};
