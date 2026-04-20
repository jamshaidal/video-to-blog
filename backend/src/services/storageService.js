const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { pipeline } = require("stream/promises");
const {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client } = require("../config/s3");
const { env } = require("../config/env");

let ensureBucketPromise;

function getObjectUrl(key) {
  const baseUrl = env.AWS_S3_PUBLIC_ENDPOINT || env.AWS_S3_ENDPOINT;

  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, "")}/${env.AWS_S3_BUCKET}/${key}`;
  }

  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

async function ensureBucketExists() {
  if (!env.AWS_S3_BUCKET || !env.AWS_S3_AUTO_CREATE_BUCKET) {
    return;
  }

  if (!ensureBucketPromise) {
    ensureBucketPromise = (async () => {
      try {
        await s3Client.send(
          new HeadBucketCommand({
            Bucket: env.AWS_S3_BUCKET,
          })
        );
      } catch (error) {
        if (
          error?.$metadata?.httpStatusCode === 404 ||
          error?.name === "NotFound" ||
          error?.name === "NoSuchBucket"
        ) {
          const createBucketInput = {
            Bucket: env.AWS_S3_BUCKET,
          };

          if (env.AWS_REGION && env.AWS_REGION !== "us-east-1") {
            createBucketInput.CreateBucketConfiguration = {
              LocationConstraint: env.AWS_REGION,
            };
          }

          await s3Client.send(new CreateBucketCommand(createBucketInput));
          return;
        }

        throw error;
      }
    })().catch((error) => {
      ensureBucketPromise = undefined;
      throw error;
    });
  }

  await ensureBucketPromise;
}

async function uploadLocalFile({ localPath, keyPrefix, contentType }) {
  await ensureBucketExists();
  const key = `${keyPrefix}/${randomUUID()}${path.extname(localPath)}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: fs.createReadStream(localPath),
      ContentType: contentType,
    })
  );

  return {
    key,
    url: getObjectUrl(key),
  };
}

async function uploadTextContent({ keyPrefix, extension, body, contentType }) {
  await ensureBucketExists();
  const key = `${keyPrefix}/${randomUUID()}.${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: getObjectUrl(key),
  };
}

async function downloadObjectToFile(key, localPath) {
  await ensureBucketExists();
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    })
  );

  await pipeline(response.Body, fs.createWriteStream(localPath));
  return localPath;
}

async function getSignedObjectUrl(key, expiresIn = 60 * 15) {
  await ensureBucketExists();
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    }),
    { expiresIn }
  );
}

module.exports = {
  uploadLocalFile,
  uploadTextContent,
  downloadObjectToFile,
  getSignedObjectUrl,
};
