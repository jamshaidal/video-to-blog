const fs = require("fs/promises");
const path = require("path");
const { createJob, countUserJobsSince } = require("../services/jobService");
const { uploadLocalFile } = require("../services/storageService");
const { enqueueVideoProcessingJob } = require("../queue/videoQueue");
const { getMediaDurationInSeconds } = require("../services/mediaService");
const { env } = require("../config/env");
const { HttpError } = require("../utils/HttpError");

async function uploadController(req, res) {
  if (!req.file) {
    throw new HttpError(400, "Video file is required.");
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const uploadsToday = await countUserJobsSince(req.user.id, startOfToday);

  if (uploadsToday >= env.MAX_DAILY_UPLOADS_PER_USER) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new HttpError(
      400,
      `Daily upload limit reached. You can process up to ${env.MAX_DAILY_UPLOADS_PER_USER} videos per day on self-serve.`
    );
  }

  const duration = await getMediaDurationInSeconds(req.file.path);

  if (duration > env.MAX_VIDEO_DURATION_SECONDS) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new HttpError(
      400,
      `Video duration exceeds ${env.MAX_VIDEO_DURATION_SECONDS} seconds. Contact us for longer videos or manual processing support.`
    );
  }

  const uploadedVideo = await uploadLocalFile({
    localPath: req.file.path,
    keyPrefix: `uploads/${req.user.id}`,
    contentType: req.file.mimetype,
  });

  await fs.unlink(req.file.path).catch(() => {});

  const job = await createJob({
    userId: req.user.id,
    originalFileName: path.basename(req.file.originalname).trim(),
    inputUrl: uploadedVideo.url,
  });

  await enqueueVideoProcessingJob({
    jobId: job.id,
    userId: req.user.id,
    inputKey: uploadedVideo.key,
  });

  res.status(202).json({
    success: true,
    job,
  });
}

module.exports = { uploadController };
