const { createLogger, format, transports } = require("winston");
const { env } = require("./env");

const logger = createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  defaultMeta: {
    service: "ai-video-platform-backend",
    environment: env.NODE_ENV,
  },
  transports: [new transports.Console()],
});

module.exports = { logger };
