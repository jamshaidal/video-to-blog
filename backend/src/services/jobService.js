const { prisma } = require("../config/prisma");
const { HttpError } = require("../utils/HttpError");

async function createJob({ userId, inputUrl, originalFileName }) {
  return prisma.job.create({
    data: {
      userId,
      originalFileName,
      inputUrl,
      status: "pending",
      progress: 0,
    },
  });
}

async function listJobsForUser(userId) {
  return prisma.job.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      result: true,
    },
  });
}

async function getJobForUser(jobId, userId) {
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId,
    },
    include: {
      result: true,
    },
  });

  if (!job) {
    throw new HttpError(404, "Job not found.");
  }

  return job;
}

async function countUserJobsSince(userId, since) {
  return prisma.job.count({
    where: {
      userId,
      createdAt: {
        gte: since,
      },
    },
  });
}

module.exports = {
  createJob,
  listJobsForUser,
  getJobForUser,
  countUserJobsSince,
};
