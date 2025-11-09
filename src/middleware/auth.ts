import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JWTPayload } from "../types";
import { sendError } from "../utils/response";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return sendError(
        res,
        "Authentication required",
        ["No token provided"],
        401
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", null, 401);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;

    if (!user) {
      return sendError(res, "Authentication required", null, 401);
    }

    if (!roles.includes(user.role)) {
      return sendError(
        res,
        "Insufficient permissions",
        ["Admin access required"],
        403
      );
    }

    next();
  };
};
