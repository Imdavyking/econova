// getUserTwitterInfo

import { Request, Response } from "express";

export const getUserTwitterInfo = async (req: Request, res: Response) => {
  if (!req.session.user) {
    res.status(401).json({
      error: "Unauthorized",
    });
    return;
  }

  res.json(req.session.user);
};
