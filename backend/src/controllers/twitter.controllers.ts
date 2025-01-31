import { getAllTweets, getTweetByTweetId } from "../services/tweets.services";
import { Request, Response } from "express";
import { signTwitterPoints } from "../services/twitter-points.services";
import { getLikingUsersData, getRetweetersData } from "../utils/fetch.tweets";
import { TwitterResponse } from "../types/tweet.like.retweet";
import { SIGN_TWITTER_POINTS } from "../utils/constants";
import { LoginWithTwitter } from "../services/login.twitter.services";

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

const twitterLogin = new LoginWithTwitter({
  callbackUrl: "http://localhost:5100/callback",
});

export const loginTwitter = async (req: Request, res: Response) => {
  twitterLogin.callbackUrl = `${req.protocol}://${req.get("host")}/callback`;
  const { tokenSecret, url } = await twitterLogin.login();

  if (req.session?.tokenSecret) {
  }

  req.session.tokenSecret = tokenSecret;

  res.redirect(url);
};

export const verifyCallBack = async (req: Request, res: Response) => {
  twitterLogin.callbackUrl = `${req.protocol}://${req.get("host")}/callback`;
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

  res.redirect("/");
};
