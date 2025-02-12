import { Request, Response } from "express";
import { LoginWithTwitter } from "../services/login.twitter.services";
import { FRONTEND_URL } from "../utils/constants";
import logger from "../config/logger";
import { isLocalhost } from "../utils/islocalhost";

declare module "express-session" {
  interface SessionData {
    tokenSecret: string | undefined;
    user: {
      userName: string;
      userId: string;
      userToken: string;
      userTokenSecret: string;
    };
  }
}

export const twitterLogin = new LoginWithTwitter({
  callbackUrl: "http://localhost:3100/twitter/callback",
});

export const getUrlCallback = (req: Request) => {
  const protocol = isLocalhost(req) ? "http" : "https";
  return `${protocol}://${req.get("host")}/twitter/callback`;
};

export const loginTwitter = async (req: Request, res: Response) => {
  twitterLogin.callbackUrl = getUrlCallback(req);
  try {
    const { tokenSecret, url } = await twitterLogin.login();
    req.session.tokenSecret = tokenSecret;

    res.redirect(url);
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({
      error: `An error occurred while logging in with Twitter: ${error.message} ${twitterLogin.callbackUrl}`,
    });
  }
};

export const verifyCallBack = async (req: Request, res: Response) => {
  try {
    twitterLogin.callbackUrl = getUrlCallback(req);
    const { oauth_token, oauth_verifier } = req.query as {
      oauth_token: string;
      oauth_verifier: string;
    };

    if (!oauth_token || !oauth_verifier) {
      res.status(400).json({
        error: "Invalid or missing OAuth parameters for login callback",
      });
      return;
    }

    if (!req.session.tokenSecret) {
      res.status(400).json({
        error: "Missing OAuth token secret in session",
      });
      return;
    }

    const user = await twitterLogin.callback(
      {
        oauth_token,
        oauth_verifier,
      },
      req.session.tokenSecret!
    );

    delete req.session.tokenSecret;

    req.session.user = user;

    res.cookie("user", JSON.stringify(user), {
      httpOnly: true,
      secure: isLocalhost(req) ? false : true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "none",
      path: "/",
    });

    logger.info(req.sessionID);
    res.redirect(FRONTEND_URL!);
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({
      error: `An error occurred while logging in with Twitter: ${error.message}`,
    });
  }
};
