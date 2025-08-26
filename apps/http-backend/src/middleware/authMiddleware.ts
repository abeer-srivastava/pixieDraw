import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "@repo/backend-comman/config";
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  // remove "Bearer "
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decodedToken = jwt.verify((token as string), JWT_SECRET);
    req.userId = (decodedToken as jwt.JwtPayload).userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}
