const express = require("express");
const { transcribeAudio } = require("../controllers/transcriptionController");
const { audioUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/transcribe", audioUpload.single("audio"), transcribeAudio);

module.exports = router;
