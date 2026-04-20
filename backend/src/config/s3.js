const { S3Client } = require("@aws-sdk/client-s3");
const { env } = require("./env");

const s3Client = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_S3_ENDPOINT || undefined,
  forcePathStyle: env.AWS_S3_FORCE_PATH_STYLE,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

module.exports = { s3Client };
