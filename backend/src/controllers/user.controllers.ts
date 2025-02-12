// getUserTwitterInfo

import { Request, Response } from "express";
import { LoginWithTwitter } from "../services/login.twitter.services";
import { getUrlCallback } from "./twitter.controllers";
export const twitterLogin = new LoginWithTwitter({
  callbackUrl: "http://localhost:3100/twitter/callback",
});

export const deleteTwitterCookie = async (req: Request, res: Response) => {
  res.clearCookie("user");
  res.json({ message: "User logged out" });
};
export const getUserTwitterInfo = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }

    const userInfo = JSON.parse(user);

    twitterLogin.callbackUrl = getUrlCallback(req);

    const userTokenData = await twitterLogin.validateUserToken(
      userInfo.userToken,
      userInfo.userTokenSecret
    );

    if (!userTokenData) {
      res.status(400).json({ error: "Invalid user token" });
      return;
    }

    const { twitter_id, screen_name } = userTokenData;

    res.json({ twitter_id, screen_name });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
