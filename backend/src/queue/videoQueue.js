const { Queue } = require("bullmq");
const { redisConnection } = require("../config/redis");

const VIDEO_QUEUE_NAME = "video-processing";

const videoQueue = new Queue(VIDEO_QUEUE_NAME, {
  connection: redisConnection,
});

async function enqueueVideoProcessingJob(data) {
  return videoQueue.add("process-video", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  });
}

module.exports = {
  VIDEO_QUEUE_NAME,
  videoQueue,
  enqueueVideoProcessingJob,
};
