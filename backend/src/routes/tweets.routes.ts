import express, { Request, Response } from "express";
import {
  getTweets,
  getTweetByTweetID,
  getTweetPoints,
} from "../controllers/tweets.controllers";
import { getLikingUsersData, getRetweetersData } from "../utils/fetch.tweets";
const tweetRoutes = express.Router();
tweetRoutes.get("/", getTweets);
tweetRoutes.get("/points/:tweetId/:tweetSignature", getTweetPoints);
tweetRoutes.get("/:id", getTweetByTweetID);

/**
 * Route to get retweeters of a tweet.
 */
tweetRoutes.get("/:id/retweeters", async (req: Request, res: Response) => {
  try {
    const data = await getRetweetersData(req.params.id);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route to get users who liked a tweet.
 */
tweetRoutes.get("/:id/liking-users", async (req: Request, res: Response) => {
  try {
    const data = await getLikingUsersData(req.params.id);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default tweetRoutes;
