const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const UPLOADS_DIR = path.join(ROOT_DIR, "uploads");
const PROCESSED_DIR = path.join(ROOT_DIR, "processed");

module.exports = {
  ROOT_DIR,
  UPLOADS_DIR,
  PROCESSED_DIR,
};
