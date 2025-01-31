import { getAllTweets, getTweetByTweetId } from "../services/tweets.services";
import { Request, Response } from "express";
import { signTwitterPoints } from "../services/twitter-points.services";
import { getLikingUsersData, getRetweetersData } from "../utils/fetch.tweets";
import { TwitterResponse } from "../types/tweet.like.retweet";
import { SIGN_TWITTER_POINTS } from "../utils/constants";
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
  const { tweetId, usertweeterId } = req.params;
  const tweet = await getTweetByTweetId(tweetId);
  if (!tweet) {
    return res.status(404).json({ error: "Tweet not found" });
  }

  let userLikes: TwitterResponse | undefined;
  let userRetweets: TwitterResponse | undefined;
  try {
    userLikes = await getLikingUsersData(tweetId);
  } catch (_) {}

  try {
    userRetweets = await getRetweetersData(tweetId);
  } catch (_) {}

  let points = {
    likes: 0,
    retweets: 0,
  };

  if (userRetweets) {
    const hasRetweeted = userRetweets.data.find(
      (user) => user.id === usertweeterId
    );
    if (hasRetweeted) {
      points.retweets += SIGN_TWITTER_POINTS.retweet;
    }
  }

  if (userLikes) {
    const hasLiked = userLikes.data.find((user) => user.id === usertweeterId);
    if (hasLiked) {
      points.likes += SIGN_TWITTER_POINTS.like;
    }
  }

  const { signature, pointToAdd } = await signTwitterPoints(
    "",
    Object.values(points).reduce((a, b) => a + b, 0),
    tweetId
  );
  res.json({ signature, pointToAdd, tweetId });
};
