import { TweetSchemaModel } from "../models/tweets";
import axios from "axios";
import dotenv from "dotenv";
import { environment } from "../utils/config";
import { processOauth } from "../utils/oauth";

dotenv.config();

export const getAllTweets = async () =>
  await TweetSchemaModel.find().sort({ created_at: -1 });
export const getTweetByTweetId = async (id: string) =>
  await TweetSchemaModel.findOne({ id });

const BASE_URL = "https://api.twitter.com/2/tweets";

/**
 * Get users who retweeted a tweet.
 * @param tweetId - The ID of the tweet.
 */
export const getRetweeters = async (tweetId: string) => {
  const url = `${BASE_URL}/${tweetId}/retweeted_by`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${environment.TWITTER_BEARER_TOKEN}`,
    },
  });
  return response.data;
};

/**
 * Get users who liked a tweet.
 * @param tweetId - The ID of the tweet.
 */
export const getLikingUsers = async (tweetId: string) => {
  const url = `${BASE_URL}/${tweetId}/liking_users`;
  const headers = processOauth(url) as any;
  const response = await axios.get(url, {
    headers,
  });
  return response.data;
};
