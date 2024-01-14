import { config } from "./config.js";
import { asyncHandler, sendError } from "./utils.js";
import { prisma } from "../app.js";

const authorizationPattern = /^Bearer (.+)$/;

export const authenticate = asyncHandler(async (req, res, next) => {
  
  const authorization = req.get("Authorization");

  if (!authorization || !authorization.trim().length) {
    return sendError(401, "No Authorization header sent.", res);
  }

  const match = authorizationPattern.exec(authorization);
  if (!match)
    return sendError(
      401,
      "The Authorization header does not contain a valid Bearer token.",
      res
    );

  const token = match[1];
  if (token == config.adminToken) {
    req.authToken = {
      admin: true
    };
    return next();
  }

  const matchedToken = await prisma.token.findUnique({
    where: { token: token }
  });

  if (matchedToken && matchedToken.expiresAt.getTime() > new Date().getTime()) {
    req.authToken = matchedToken;
    next();
  } else {
    sendError(
      401,
      "The Bearer token sent in the Authorization header is not valid.",
      res
    );
  }
});

export const requireAdmin = (req, res, next) => {
  if (!req.authToken || !req.authToken.admin) {
    return sendError(
      403,
      "You must be an administrator to perform this action.",
      res
    );
  }

  next();
};

export const requireUser = (req, res, next) => {
  if (!req.authToken || req.authToken.admin) {
    return sendError(403, "Administrators cannot perform this action.", res);
  }
  next();
};
