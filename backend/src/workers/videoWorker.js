const fs = require("fs");
const os = require("os");
const path = require("path");
const { Worker } = require("bullmq");
const { prisma } = require("../config/prisma");
const { redisConnection } = require("../config/redis");
const { env } = require("../config/env");
const { logger } = require("../config/logger");
const { VIDEO_QUEUE_NAME } = require("../queue/videoQueue");
const {
  downloadObjectToFile,
  uploadTextContent,
} = require("../services/storageService");
const {
  extractAudioToMp3,
  getMediaDurationInSeconds,
} = require("../services/mediaService");
const {
  transcribeAudio,
  generateContent,
} = require("../services/openaiService");
const {
  buildSubtitleArtifacts,
  buildTranscriptTimeline,
  formatChaptersForText,
} = require("../services/timelineService");

async function processVideoJob(queueJob) {
  const { jobId, userId, inputKey } = queueJob.data;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-video-job-"));
  const videoPath = path.join(tempDir, "input-video");
  const audioPath = path.join(tempDir, "audio.mp3");

  try {
    logger.info({
      type: "job_start",
      queueJobId: queueJob.id,
      jobId,
      userId,
    });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "processing",
        progress: 10,
        errorMessage: null,
      },
    });
    await queueJob.updateProgress(10);

    await downloadObjectToFile(inputKey, videoPath);

    const duration = await getMediaDurationInSeconds(videoPath);
    if (duration > env.MAX_VIDEO_DURATION_SECONDS) {
      throw new Error(
        `Video duration exceeds ${env.MAX_VIDEO_DURATION_SECONDS} seconds.`
      );
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        progress: 30,
      },
    });
    await queueJob.updateProgress(30);

    await extractAudioToMp3(videoPath, audioPath);
    const transcription = await transcribeAudio(audioPath);
    const subtitleArtifacts = buildSubtitleArtifacts({
      segments: transcription.segments,
      transcriptText: transcription.text,
      durationSeconds: transcription.duration,
    });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        progress: 65,
      },
    });
    await queueJob.updateProgress(65);

    const content = await generateContent({
      transcript: transcription.text,
      durationSeconds: transcription.duration,
      segmentsTimeline: buildTranscriptTimeline(subtitleArtifacts.segments),
    });

    const transcriptFile = await uploadTextContent({
      keyPrefix: `results/${userId}/${jobId}`,
      extension: "txt",
      body: content.cleanedTranscript,
      contentType: "text/plain",
    });
    const blogFile = await uploadTextContent({
      keyPrefix: `results/${userId}/${jobId}`,
      extension: "md",
      body: content.blogPost,
      contentType: "text/markdown",
    });
    const youtubeFile = await uploadTextContent({
      keyPrefix: `results/${userId}/${jobId}`,
      extension: "txt",
      body: content.youtubeDescription,
      contentType: "text/plain",
    });
    const captionsFile = await uploadTextContent({
      keyPrefix: `results/${userId}/${jobId}`,
      extension: "json",
      body: JSON.stringify(content.socialCaptions, null, 2),
      contentType: "application/json",
    });
    const chaptersJsonFile = await uploadTextContent({
      keyPrefix: `results/${userId}/${jobId}`,
      extension: "json",
      body: JSON.stringify(content.chapters, null, 2),
      contentType: "application/json",
    });
    const chaptersTextFile = await uploadTextContent({
      keyPrefix: `results/${userId}/${jobId}`,
      extension: "txt",
      body: formatChaptersForText(content.chapters),
      contentType: "text/plain",
    });
    const subtitlesSrtFile = await uploadTextContent({
      keyPrefix: `results/${userId}/${jobId}`,
      extension: "srt",
      body: subtitleArtifacts.srt,
      contentType: "application/x-subrip",
    });
    const subtitlesVttFile = await uploadTextContent({
      keyPrefix: `results/${userId}/${jobId}`,
      extension: "vtt",
      body: subtitleArtifacts.vtt,
      contentType: "text/vtt",
    });
    const subtitlesTxtFile = await uploadTextContent({
      keyPrefix: `results/${userId}/${jobId}`,
      extension: "txt",
      body: subtitleArtifacts.txt,
      contentType: "text/plain",
    });

    await prisma.result.upsert({
      where: { jobId },
      update: {
        transcript: content.cleanedTranscript,
        blog: content.blogPost,
        captions: content.socialCaptions,
        youtubeDescription: content.youtubeDescription,
        subtitlesUrl: subtitlesSrtFile.url,
        outputUrls: {
          transcript: transcriptFile,
          blog: blogFile,
          youtubeDescription: youtubeFile,
          captions: captionsFile,
          chaptersJson: chaptersJsonFile,
          chaptersText: chaptersTextFile,
          subtitlesSrt: subtitlesSrtFile,
          subtitlesVtt: subtitlesVttFile,
          subtitlesTxt: subtitlesTxtFile,
          metadata: {
            chapters: content.chapters,
            durationSeconds: transcription.duration,
          },
        },
      },
      create: {
        jobId,
        transcript: content.cleanedTranscript,
        blog: content.blogPost,
        captions: content.socialCaptions,
        youtubeDescription: content.youtubeDescription,
        subtitlesUrl: subtitlesSrtFile.url,
        outputUrls: {
          transcript: transcriptFile,
          blog: blogFile,
          youtubeDescription: youtubeFile,
          captions: captionsFile,
          chaptersJson: chaptersJsonFile,
          chaptersText: chaptersTextFile,
          subtitlesSrt: subtitlesSrtFile,
          subtitlesVtt: subtitlesVttFile,
          subtitlesTxt: subtitlesTxtFile,
          metadata: {
            chapters: content.chapters,
            durationSeconds: transcription.duration,
          },
        },
      },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "completed",
        progress: 100,
      },
    });
    await queueJob.updateProgress(100);

    logger.info({
      type: "job_completed",
      queueJobId: queueJob.id,
      jobId,
      userId,
    });
  } catch (error) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorMessage: error.message,
      },
    });

    logger.error({
      type: "job_failed",
      queueJobId: queueJob.id,
      jobId,
      userId,
      message: error.message,
      stack: error.stack,
    });

    throw error;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

let workerInstance;

function startVideoWorker() {
  if (workerInstance) {
    return workerInstance;
  }

  workerInstance = new Worker(VIDEO_QUEUE_NAME, processVideoJob, {
    connection: redisConnection,
    concurrency: env.WORKER_CONCURRENCY,
  });

  workerInstance.on("completed", (job) => {
    logger.info({
      type: "queue_completed",
      queueJobId: job.id,
    });
  });

  workerInstance.on("failed", (job, error) => {
    logger.error({
      type: "queue_failed",
      queueJobId: job?.id,
      message: error.message,
    });
  });

  logger.info({
    type: "worker_started",
    queueName: VIDEO_QUEUE_NAME,
    concurrency: env.WORKER_CONCURRENCY,
  });

  return workerInstance;
}

if (require.main === module) {
  startVideoWorker();
}

module.exports = { startVideoWorker };
