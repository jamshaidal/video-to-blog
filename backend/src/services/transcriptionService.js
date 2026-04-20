const fs = require("fs");
const OpenAI = require("openai");

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

async function transcribeAudioFile(filePath) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not configured.");
    error.statusCode = 500;
    throw error;
  }

  try {
    const openai = getOpenAIClient();
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "gpt-4o-transcribe",
    });

    return response.text;
  } catch (apiError) {
    const error = new Error(
      apiError?.message || "OpenAI transcription request failed."
    );
    error.statusCode = apiError?.status || 500;
    throw error;
  }
}

module.exports = {
  transcribeAudioFile,
};
