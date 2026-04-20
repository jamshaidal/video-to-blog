const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { env } = require("../config/env");
const { HttpError } = require("../utils/HttpError");

const tempDir = path.resolve(__dirname, "..", "..", "uploads", "tmp");
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const videoUpload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
      return;
    }

    cb(new HttpError(400, "Only video uploads are allowed."));
  },
});

function handleMulterError(error, req, res, next) {
  if (!(error instanceof multer.MulterError)) {
    next(error);
    return;
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    next(
      new HttpError(
        400,
        `File is too large. Maximum size is ${env.MAX_FILE_SIZE_MB}MB.`
      )
    );
    return;
  }

  next(new HttpError(400, error.message));
}

module.exports = {
  videoUpload,
  handleMulterError,
  tempDir,
};
