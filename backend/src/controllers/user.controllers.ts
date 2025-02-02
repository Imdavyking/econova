// getUserTwitterInfo

import { Request, Response } from "express";
import { LoginWithTwitter } from "../services/login.twitter.services";
export const twitterLogin = new LoginWithTwitter({
  callbackUrl: "http://localhost:3100/twitter/callback",
});
export const getUserTwitterInfo = async (req: Request, res: Response) => {
  try {
    const user = req.cookies.user;

    if (!user) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }

    const userInfo = JSON.parse(user);

    const userTwitterId = await twitterLogin.validateUserToken(
      userInfo.userToken,
      userInfo.userTokenSecret
    );

    console.log({ userTwitterId });

    res.json({ userTwitterId });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
