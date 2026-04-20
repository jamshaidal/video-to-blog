const app = require("./app");
const { env } = require("./config/env");
const { prisma } = require("./config/prisma");
const { logger } = require("./config/logger");
const { startVideoWorker } = require("./workers/videoWorker");

async function startServer() {
  await prisma.$connect();

  if (env.ENABLE_EMBEDDED_WORKER) {
    startVideoWorker();
    logger.info({
      type: "embedded_worker_enabled",
    });
  }

  app.listen(env.PORT, () => {
    logger.info({
      type: "server_started",
      port: env.PORT,
    });
  });
}

startServer().catch((error) => {
  logger.error({
    type: "server_failed_to_start",
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
