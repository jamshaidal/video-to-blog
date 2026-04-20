const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");
const { env } = require("../config/env");
const { HttpError } = require("../utils/HttpError");

function createToken(userId) {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
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

  return {
    user,
    token: createToken(user.id),
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

  return {
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
    token: createToken(user.id),
  };
}

module.exports = {
  signup,
  login,
};
