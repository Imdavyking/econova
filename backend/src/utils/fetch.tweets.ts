import initializeRedis from "../utils/redis.app";
import { getRetweeters, getLikingUsers } from "../services/tweets.services";
import logger from "../config/logger";
import { extractMessageFrom429 } from "./";
import { TwitterResponse } from "../types/tweet.like.retweet";
import Redis from "ioredis";

const REDIS_CACHE_TIME = 60 * 15; // 15 minutes

/**
 * Generic function to fetch and cache Twitter data.
 */
const fetchAndCache = async (
  key: string,
  fetchFunction: (tweetId: string) => Promise<any>,
  tweetId: string
) => {
  let redis: Redis | undefined;
  const cacheKey = `${key}-${tweetId}`;

  logger.info(`${key} data fetching from API`);
  try {
    redis = await initializeRedis();
    const data = await fetchFunction(tweetId);
    await redis.set(cacheKey, JSON.stringify(data), "EX", REDIS_CACHE_TIME);
    return { ...data, fromCache: false };
  } catch (error: any) {
    if (error.response?.status === 429) {
      logger.warn(
        `${key} API rate limited (429), attempting to fetch from cache`
      );
      const cachedData = await redis!.get(cacheKey);
      if (cachedData) {
        return {
          error: extractMessageFrom429(error, "").message,
          ...JSON.parse(cachedData),
          fromCache: true,
        };
      } else {
        throw new Error(`Rate limit exceeded and no cached data available`);
      }
    }
    throw error;
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
