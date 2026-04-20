const express = require("express");
const { uploadController } = require("../controllers/uploadController");
const { asyncHandler } = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");
const { uploadRateLimiter } = require("../middleware/rateLimiters");
const { videoUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/upload",
  requireAuth,
  uploadRateLimiter,
  videoUpload.single("video"),
  asyncHandler(uploadController)
);

module.exports = router;
