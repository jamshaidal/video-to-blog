const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  message: {
    success: false,
    message: "Upload rate limit exceeded. Try again in a minute.",
  },
});

module.exports = { uploadRateLimiter };
