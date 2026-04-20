const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../utils/asyncHandler");
const { getDownloadUrlsController } = require("../controllers/jobController");

const router = express.Router();

router.get("/:id", requireAuth, asyncHandler(getDownloadUrlsController));

module.exports = router;
