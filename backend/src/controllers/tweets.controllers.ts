import { getAllTweets, getTweetByTweetId } from "../services/tweets.services";
import { Request, Response } from "express";
import { signTwitterPoints } from "../services/twitter-points.services";
import { getLikingUsersData, getRetweetersData } from "../utils/fetch.tweets";
import { TwitterResponse } from "../types/tweet.like.retweet";
import { SIGN_TWITTER_POINTS } from "../utils/constants";
import { twitterLogin } from "./twitter.controllers";
import { ethers } from "ethers";

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
  const { tweetId, tweetSignature } = req.params;

  const user = JSON.parse(req.cookies.user) as {
    userToken: string;
    userTokenSecret: string;
  };

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userTokenData = await twitterLogin.validateUserToken(
    user.userToken,
    user.userTokenSecret
  );

  if (!userTokenData || !userTokenData.twitter_id) {
    res.status(401).json({ error: "Invalid user token" });
    return;
  }

  const tweet = await getTweetByTweetId(tweetId);
  if (!tweet) {
    res.status(404).json({ error: "Tweet not found" });
    return;
  }

  let likesInfo: TwitterResponse | undefined;
  let retweetsInfo: TwitterResponse | undefined;
  try {
    likesInfo = await getLikingUsersData(tweetId);
  } catch (_) {}

  try {
    retweetsInfo = await getRetweetersData(tweetId);
  } catch (_) {}

  let points = {
    likes: 0,
    retweets: 0,
  };

  if (retweetsInfo) {
    const hasRetweeted = retweetsInfo?.data?.find(
      (user) => user.id === userTokenData.twitter_id
    );
    if (hasRetweeted) {
      points.retweets += SIGN_TWITTER_POINTS.retweet;
    }
  }

  if (likesInfo) {
    const hasLiked = likesInfo?.data?.find(
      (user) => user.id === userTokenData.twitter_id
    );
    if (hasLiked) {
      points.likes += SIGN_TWITTER_POINTS.like;
    }
  }

  const messageHash = ethers.solidityPackedKeccak256(["uint256"], [tweetId]);

  const ethSignedMessageHash = ethers.hashMessage(ethers.getBytes(messageHash));

  const userAddress = ethers.recoverAddress(
    ethSignedMessageHash,
    tweetSignature
  );

  const { signature, chainId } = await signTwitterPoints(
    userAddress,
    Object.values(points).reduce((a, b) => a + b, 0),
    userTokenData.twitter_id,
    tweetId
  );
  res.json({
    signature,
    points,
    tweetId,
    chainId,
    twitter_id: userTokenData.twitter_id,
  });
};
