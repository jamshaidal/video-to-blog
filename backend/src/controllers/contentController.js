const {
  generateContentFromTranscript,
  normalizeGeneratedContent,
} = require("../services/contentGenerationService");

async function generateContent(req, res, next) {
  try {
    const { transcript } = req.body;
    const generatedContent = await generateContentFromTranscript(transcript);

    res.status(200).json({
      success: true,
      data: normalizeGeneratedContent(generatedContent),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateContent,
};
