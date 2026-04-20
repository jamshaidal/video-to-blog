const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");
const { env } = require("../config/env");
const { HttpError } = require("../utils/HttpError");

async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new HttpError(401, "Authentication required.");
    }

    const token = authorization.replace("Bearer ", "");
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new HttpError(401, "Invalid authentication token.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new HttpError(401, "Invalid authentication token."));
  }
}

module.exports = { requireAuth };
