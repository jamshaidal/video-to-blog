const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "..", "..", ".env"),
});

function normalizeEndpoint(value) {
  if (!value) {
    return "";
  }

  return /^https?:\/\//i.test(value) ? value : `http://${value}`;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_TRANSCRIPTION_MODEL:
    process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-transcribe",
  OPENAI_CONTENT_MODEL: process.env.OPENAI_CONTENT_MODEL || "gpt-4.1",
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",
  AWS_S3_ENDPOINT: normalizeEndpoint(process.env.AWS_S3_ENDPOINT || ""),
  AWS_S3_PUBLIC_ENDPOINT: normalizeEndpoint(
    process.env.AWS_S3_PUBLIC_ENDPOINT || ""
  ),
  AWS_S3_FORCE_PATH_STYLE: process.env.AWS_S3_FORCE_PATH_STYLE === "true",
  AWS_S3_AUTO_CREATE_BUCKET: process.env.AWS_S3_AUTO_CREATE_BUCKET
    ? process.env.AWS_S3_AUTO_CREATE_BUCKET === "true"
    : true,
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB || 50),
  MAX_VIDEO_DURATION_SECONDS: Number(
    process.env.MAX_VIDEO_DURATION_SECONDS || 300
  ),
  MAX_DAILY_UPLOADS_PER_USER: Number(
    process.env.MAX_DAILY_UPLOADS_PER_USER || 3
  ),
  WORKER_CONCURRENCY: Number(process.env.WORKER_CONCURRENCY || 2),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "",
  TRUST_PROXY: process.env.TRUST_PROXY
    ? process.env.TRUST_PROXY === "true"
    : process.env.NODE_ENV === "production",
  ENABLE_EMBEDDED_WORKER: process.env.ENABLE_EMBEDDED_WORKER
    ? process.env.ENABLE_EMBEDDED_WORKER === "true"
    : process.env.NODE_ENV !== "production",
};

module.exports = { env };
