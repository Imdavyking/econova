import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"]; // Express lowercases headers automatically

  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    res.status(401).json({ error: "Unauthorized: Invalid token format" });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Forbidden: Invalid token" });
    return;
  }
};
