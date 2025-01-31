import { getAllTweets, getTweetByTweetId } from "../services/tweets.services";
import { Request, Response } from "express";
import { signTwitterPoints } from "../services/twitter-points.services";
import { getLikingUsersData, getRetweetersData } from "../utils/fetch.tweets";
export const getTweets = async (_: Request, res: Response) => {
  const tweets = await getAllTweets();
  res.json(tweets);
};
export const getTweetByTweetID = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tweet = await getTweetByTweetId(id);
  res.json(tweet);
};

export const getTweetPoints = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tweet = await getTweetByTweetId(id);
  if (!tweet) {
    return res.status(404).json({ error: "Tweet not found" });
  }

  const userLikes = await getLikingUsersData(id);
  const userRetweets = await getRetweetersData(id);
  // signTwitterPoints(tweet.sender, tweet.points, tweet.nonce);
  res.json({ points: tweet });
};
