const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");
const { env } = require("../config/env");
const {
  sendPasswordResetLink,
  sendVerificationCode,
} = require("./emailService");
const { HttpError } = require("../utils/HttpError");

const VERIFICATION_CODE_TTL_MINUTES = 15;
const RESET_TOKEN_TTL_MINUTES = 30;

function createToken(userId) {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function createSixDigitCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function createResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

function addMinutes(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

async function createAndSendVerificationCode(user) {
  const code = createSixDigitCode();
  const verificationCodeHash = await bcrypt.hash(code, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationCodeHash,
      verificationExpiresAt: addMinutes(VERIFICATION_CODE_TTL_MINUTES),
    },
  });

  await sendVerificationCode({
    email: user.email,
    code,
  });
}

async function signup(email, password) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new HttpError(409, "Email is already registered.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  await createAndSendVerificationCode(user);

  return {
    user,
    needsVerification: true,
    message: "Account created. Check your email for the 6-digit verification code.",
  };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);

  if (!matches) {
    throw new HttpError(401, "Invalid email or password.");
  }

  if (!user.emailVerifiedAt) {
    await createAndSendVerificationCode(user);
    throw new HttpError(
      403,
      "Please verify your email first. We sent you a new 6-digit code."
    );
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
    token: createToken(user.id),
  };
}

async function verifyEmail(email, code) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new HttpError(404, "Account not found.");
  }

  if (user.emailVerifiedAt) {
    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token: createToken(user.id),
    };
  }

  if (!user.verificationCodeHash || !user.verificationExpiresAt) {
    throw new HttpError(400, "Verification code was not requested.");
  }

  if (user.verificationExpiresAt < new Date()) {
    throw new HttpError(400, "Verification code expired. Request a new code.");
  }

  const matches = await bcrypt.compare(code, user.verificationCodeHash);

  if (!matches) {
    throw new HttpError(400, "Invalid verification code.");
  }

  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      verificationCodeHash: null,
      verificationExpiresAt: null,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  return {
    user: verifiedUser,
    token: createToken(verifiedUser.id),
  };
}

async function resendVerificationCode(email) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new HttpError(404, "Account not found.");
  }

  if (user.emailVerifiedAt) {
    return {
      message: "Email is already verified.",
    };
  }

  await createAndSendVerificationCode(user);

  return {
    message: "A new verification code has been sent.",
  };
}

async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      message: "If that email exists, a reset link has been sent.",
    };
  }

  const token = createResetToken();
  const resetTokenHash = await bcrypt.hash(token, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetTokenHash,
      resetTokenExpiresAt: addMinutes(RESET_TOKEN_TTL_MINUTES),
    },
  });

  await sendPasswordResetLink({
    email: user.email,
    token,
  });

  return {
    message: "If that email exists, a reset link has been sent.",
  };
}

async function resetPassword(token, password) {
  const users = await prisma.user.findMany({
    where: {
      resetTokenHash: {
        not: null,
      },
      resetTokenExpiresAt: {
        gt: new Date(),
      },
    },
  });

  let matchingUser = null;

  for (const user of users) {
    const matches = await bcrypt.compare(token, user.resetTokenHash);

    if (matches) {
      matchingUser = user;
      break;
    }
  }

  if (!matchingUser) {
    throw new HttpError(400, "Reset link is invalid or expired.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: matchingUser.id },
    data: {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      emailVerifiedAt: matchingUser.emailVerifiedAt || new Date(),
    },
  });

  return {
    message: "Password reset successfully. You can now sign in.",
  };
}

module.exports = {
  signup,
  login,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
};
