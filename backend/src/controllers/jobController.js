const { getSignedObjectUrl } = require("../services/storageService");
const { getJobForUser, listJobsForUser } = require("../services/jobService");

async function listJobsController(req, res) {
  const jobs = await listJobsForUser(req.user.id);

  res.status(200).json({
    success: true,
    jobs,
  });
}

async function getJobController(req, res) {
  const job = await getJobForUser(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    job,
  });
}

async function getDownloadUrlsController(req, res) {
  const job = await getJobForUser(req.params.id, req.user.id);

  if (!job.result?.outputUrls) {
    res.status(404).json({
      success: false,
      message: "Result files are not available for this job yet.",
    });
    return;
  }

  const outputUrls = job.result.outputUrls;
  const signedUrls = {};

  for (const [key, value] of Object.entries(outputUrls)) {
    if (!value || typeof value !== "object" || !("url" in value)) {
      continue;
    }

    signedUrls[key] = {
      ...value,
      signedUrl: value.key ? await getSignedObjectUrl(value.key) : value.url,
    };
  }

  res.status(200).json({
    success: true,
    downloads: signedUrls,
  });
}

module.exports = {
  listJobsController,
  getJobController,
  getDownloadUrlsController,
};
