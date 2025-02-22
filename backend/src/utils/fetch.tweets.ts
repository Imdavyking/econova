import initializeRedis from "../utils/redis.app";
import { getRetweeters, getLikingUsers } from "../services/tweets.services";
import logger from "../config/logger";
import { extractMessageFrom429 } from "./";
import { TwitterResponse } from "../types/tweet.like.retweet";

const REDIS_CACHE_TIME = 60 * 15; // 15 minutes

/**
 * Generic function to fetch and cache Twitter data.
 */
const fetchAndCache = async (
  key: string,
  fetchFunction: (tweetId: string) => Promise<any>,
  tweetId: string
) => {
  try {
    const redis = await initializeRedis();
    const cacheKey = `${key}-${tweetId}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      logger.info(`${key} data fetched from cache`);
      return JSON.parse(cachedData);
    }

    logger.info(`${key} data fetched from API`);
    const data = await fetchFunction(tweetId);
    await redis.set(cacheKey, JSON.stringify(data), "EX", REDIS_CACHE_TIME);

    return data;
  } catch (error: any) {
    logger.error(`Error fetching ${key}: ${error.message}`);
    throw new Error(
      extractMessageFrom429(error, `Failed to fetch ${key}`).message
    );
  }
};

/**
 * Fetch retweeters of a tweet.
 */
export const getRetweetersData = async (
  tweetId: string
): Promise<TwitterResponse> => {
  return fetchAndCache("retweeters", getRetweeters, tweetId);
};

/**
 * Fetch users who liked a tweet.
 */
export const getLikingUsersData = async (
  tweetId: string
): Promise<TwitterResponse> => {
  return fetchAndCache("liking-users", getLikingUsers, tweetId);
};
