const fs = require("fs");
const OpenAI = require("openai");
const { env } = require("../config/env");
const { HttpError } = require("../utils/HttpError");

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const contentSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "cleanedTranscript",
    "blogPost",
    "youtubeDescription",
    "socialCaptions",
    "chapters",
  ],
  properties: {
    cleanedTranscript: {
      type: "string",
    },
    blogPost: {
      type: "string",
    },
    youtubeDescription: {
      type: "string",
    },
    socialCaptions: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "string",
      },
    },
    chapters: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "startTimeSeconds", "summary"],
        properties: {
          title: {
            type: "string",
          },
          startTimeSeconds: {
            type: "number",
          },
          summary: {
            type: "string",
          },
        },
      },
    },
  },
};

function ensureConfigured() {
  if (!env.OPENAI_API_KEY) {
    throw new HttpError(500, "OPENAI_API_KEY is not configured.");
  }
}

async function transcribeAudio(filePath) {
  ensureConfigured();

  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: env.OPENAI_TRANSCRIPTION_MODEL,
    response_format: "verbose_json",
  });

  return {
    text: response.text,
    duration: Number(response.duration || 0),
    segments: Array.isArray(response.segments) ? response.segments : [],
  };
}

function extractStructuredOutput(response) {
  if (response.output_parsed) {
    return response.output_parsed;
  }

  if (response.output_text) {
    return JSON.parse(response.output_text);
  }

  const items = response.output?.flatMap((entry) => entry.content || []) || [];

  for (const item of items) {
    if (item.parsed) {
      return item.parsed;
    }

    if (item.json) {
      return item.json;
    }

    if (typeof item.text === "string" && item.text.trim()) {
      return JSON.parse(item.text);
    }
  }

  throw new HttpError(502, "OpenAI returned an empty structured response.");
}

async function generateContent({ transcript, durationSeconds, segmentsTimeline }) {
  ensureConfigured();

  if (!transcript?.trim()) {
    throw new HttpError(400, "Transcript is required for content generation.");
  }

  const response = await openai.responses.create({
    model: env.OPENAI_CONTENT_MODEL,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: "You are a production content strategist for video repurposing. Return only valid JSON matching the schema.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Use the transcript below to generate:
1. A cleaned transcript
2. A detailed blog post
3. A YouTube description
4. Exactly 5 social captions
5. 3 to 8 useful chapters with timestamps and short summaries

Transcript:
${transcript}

Video duration in seconds:
${durationSeconds || 0}

Transcript timeline:
${segmentsTimeline || "Timeline unavailable"}`,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "video_content_bundle",
        strict: true,
        schema: contentSchema,
      },
    },
  });

  return extractStructuredOutput(response);
}

module.exports = {
  transcribeAudio,
  generateContent,
};
