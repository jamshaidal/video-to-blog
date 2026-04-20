const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  listJobsController,
  getJobController,
  getDownloadUrlsController,
} = require("../controllers/jobController");

const router = express.Router();

router.use(requireAuth);
router.get("/", asyncHandler(listJobsController));
router.get("/:id", asyncHandler(getJobController));
router.get("/:id/download", asyncHandler(getDownloadUrlsController));

module.exports = router;
