const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_GPT_MODEL = process.env.OPENAI_GPT_MODEL || "gpt-5.2";
const CONTENT_TIMEOUT_MS = Number(process.env.OPENAI_CONTENT_TIMEOUT_MS || 120000);

const contentSchema = {
  type: "object",
  additionalProperties: false,
  required: ["blogPost", "youtubeDescription", "socialCaptions"],
  properties: {
    blogPost: {
      type: "string",
      description: "A detailed blog post based on the transcript.",
    },
    youtubeDescription: {
      type: "string",
      description: "An engaging YouTube video description based on the transcript.",
    },
    socialCaptions: {
      type: "array",
      description: "Five social media captions based on the transcript.",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "string",
      },
    },
  },
};

function extractStructuredContent(payload) {
  if (payload?.output_parsed) {
    return payload.output_parsed;
  }

  if (payload?.output_text) {
    return JSON.parse(payload.output_text);
  }

  const contentItems =
    payload?.output?.flatMap((item) => item.content || []) || [];

  for (const item of contentItems) {
    if (item?.parsed) {
      return item.parsed;
    }

    if (item?.json) {
      return item.json;
    }

    if (typeof item?.text === "string" && item.text.trim()) {
      return JSON.parse(item.text);
    }

    if (item?.type === "refusal") {
      const error = new Error(item.refusal || "OpenAI refused the content generation request.");
      error.statusCode = 502;
      throw error;
    }
  }

  const incompleteReason = payload?.incomplete_details?.reason;

  if (incompleteReason) {
    const error = new Error(
      `OpenAI returned an incomplete content generation response: ${incompleteReason}.`
    );
    error.statusCode = 502;
    throw error;
  }

  const error = new Error("OpenAI returned an empty content generation response.");
  error.statusCode = 502;
  throw error;
}

async function generateContentFromTranscript(transcript) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not configured.");
    error.statusCode = 500;
    throw error;
  }

  if (!transcript || !transcript.trim()) {
    const error = new Error("Transcript text is required.");
    error.statusCode = 400;
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONTENT_TIMEOUT_MS);
  let response;
  let payload;

  try {
    response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_GPT_MODEL,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: "You are a content strategist. Convert transcripts into polished marketing content and return only valid JSON matching the schema.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Use the transcript below to generate:
1. A detailed blog post
2. A YouTube description
3. Exactly 5 social media captions

Transcript:
${transcript}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "generated_content",
            strict: true,
            schema: contentSchema,
          },
        },
      }),
      signal: controller.signal,
    });

    payload = await response.json().catch(() => null);
  } catch (requestError) {
    if (requestError?.name === "AbortError") {
      const error = new Error(
        `Content generation timed out after ${Math.round(CONTENT_TIMEOUT_MS / 1000)} seconds.`
      );
      error.statusCode = 504;
      throw error;
    }

    const error = new Error(
      requestError?.message || "OpenAI content generation request failed."
    );
    error.statusCode = 502;
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorMessage =
      payload?.error?.message || "OpenAI content generation request failed.";
    const error = new Error(errorMessage);
    error.statusCode = response.status || 500;
    throw error;
  }

  try {
    return extractStructuredContent(payload);
  } catch (parseError) {
    if (parseError.statusCode) {
      throw parseError;
    }

    const error = new Error("Failed to parse generated content as JSON.");
    error.statusCode = 502;
    throw error;
  }
}

function normalizeGeneratedContent(content) {
  return {
    blog: content.blogPost,
    youtubeDescription: content.youtubeDescription,
    captions: content.socialCaptions,
  };
}

module.exports = {
  generateContentFromTranscript,
  normalizeGeneratedContent,
};
