import { Request } from "express";

export const isLocalhost = (req: Request) =>
  ["localhost", "127.0.0.1", "[::1]", "10.0.0.2"].includes(req.hostname);
