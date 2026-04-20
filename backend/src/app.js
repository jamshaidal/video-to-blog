const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const { env } = require("./config/env");
const { requestLogger } = require("./middleware/requestLogger");
const {
  notFoundHandler,
  errorHandler,
} = require("./middleware/errorHandler");
const { handleMulterError } = require("./middleware/uploadMiddleware");

const app = express();
const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS."));
    },
  })
);
app.use(express.json());
app.use(requestLogger);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
  });
});

app.use("/auth", authRoutes);
app.use("/", uploadRoutes);
app.use("/jobs", jobRoutes);
app.use("/download", downloadRoutes);

app.use(handleMulterError);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
