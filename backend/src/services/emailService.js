const nodemailer = require("nodemailer");
const { env } = require("../config/env");
const { logger } = require("../config/logger");

function isSmtpConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

async function sendEmail({ to, subject, text }) {
  if (!isSmtpConfigured()) {
    logger.warn({
      type: "email_not_configured",
      to,
      subject,
      preview: text,
    });
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
  });
}

async function sendVerificationCode({ email, code }) {
  await sendEmail({
    to: email,
    subject: "Your MotionCraftAI verification code",
    text: `Your MotionCraftAI verification code is ${code}. It expires in 15 minutes.`,
  });
}

async function sendPasswordResetLink({ email, token }) {
  const resetUrl = `${env.APP_BASE_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: email,
    subject: "Reset your MotionCraftAI password",
    text: `Open this link to reset your password: ${resetUrl}\n\nThis link expires in 30 minutes. If you did not request it, ignore this email.`,
  });
}

module.exports = {
  sendVerificationCode,
  sendPasswordResetLink,
};
