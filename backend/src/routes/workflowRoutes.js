const express = require("express");
const { processVideo } = require("../controllers/workflowController");
const { upload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/process-video", upload.single("video"), processVideo);

module.exports = router;
