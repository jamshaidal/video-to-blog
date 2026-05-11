const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  forgotPasswordController,
  signupController,
  loginController,
  resendVerificationController,
  resetPasswordController,
  verifyEmailController,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", asyncHandler(signupController));
router.post("/login", asyncHandler(loginController));
router.post("/verify-email", asyncHandler(verifyEmailController));
router.post("/resend-verification", asyncHandler(resendVerificationController));
router.post("/forgot-password", asyncHandler(forgotPasswordController));
router.post("/reset-password", asyncHandler(resetPasswordController));

module.exports = router;
