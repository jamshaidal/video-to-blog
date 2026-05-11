const { z } = require("zod");
const {
  login,
  requestPasswordReset,
  resendVerificationCode,
  resetPassword,
  signup,
  verifyEmail,
} = require("../services/authService");

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const emailSchema = z.object({
  email: z.string().email(),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits."),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8),
});

async function signupController(req, res) {
  const payload = authSchema.parse(req.body);
  const result = await signup(payload.email.toLowerCase(), payload.password);

  res.status(201).json({
    success: true,
    ...result,
  });
}

async function loginController(req, res) {
  const payload = authSchema.parse(req.body);
  const result = await login(payload.email.toLowerCase(), payload.password);

  res.status(200).json({
    success: true,
    ...result,
  });
}

async function verifyEmailController(req, res) {
  const payload = verifyEmailSchema.parse(req.body);
  const result = await verifyEmail(payload.email.toLowerCase(), payload.code);

  res.status(200).json({
    success: true,
    ...result,
  });
}

async function resendVerificationController(req, res) {
  const payload = emailSchema.parse(req.body);
  const result = await resendVerificationCode(payload.email.toLowerCase());

  res.status(200).json({
    success: true,
    ...result,
  });
}

async function forgotPasswordController(req, res) {
  const payload = emailSchema.parse(req.body);
  const result = await requestPasswordReset(payload.email.toLowerCase());

  res.status(200).json({
    success: true,
    ...result,
  });
}

async function resetPasswordController(req, res) {
  const payload = resetPasswordSchema.parse(req.body);
  const result = await resetPassword(payload.token, payload.password);

  res.status(200).json({
    success: true,
    ...result,
  });
}

module.exports = {
  signupController,
  loginController,
  verifyEmailController,
  resendVerificationController,
  forgotPasswordController,
  resetPasswordController,
};
