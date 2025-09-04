// src/middleware/auth.ts
import type{ Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userModel } from "./db.js";
dotenv.config();

const SECRET = process.env.SECRET || "secret";

export interface AuthRequest extends Request {
  user?: { username: string };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = String(req.headers.authorization || "");
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) return res.status(401).json({ status: 401, message: "Token is missing" });

    const decoded = jwt.verify(token, SECRET) as { username?: string } | string;

    if (!decoded || typeof decoded === "string" || !("username" in decoded)) {
      return res.status(401).json({ status: 401, message: "Token is invalid" });
    }

    const username = (decoded as { username?: string }).username;
    if (!username) {
      return res.status(401).json({ status: 401, message: "Token payload invalid" });
    }

    const user = await userModel.findOne({ username }).lean();
    if (!user) return res.status(401).json({ status: 401, message: "User not found" });

    req.user = { username: user.username };
    return next();
  } catch (err) {
    console.error("Error during auth:", err);
    return res.status(401).json({ status: 401, message: "Token is invalid or expired" });
  }
};
