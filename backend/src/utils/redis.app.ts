import Redis from "ioredis";
import logger from "../config/logger";
import { RedisMemoryServer } from "redis-memory-server";

let redis: Redis;

async function initializeRedis() {
  if (process.env.NODE_ENV === "test") {
    const redisServer = new RedisMemoryServer();

    if (!redisServer.getInstanceInfo()) {
      await redisServer.start();
    }

    process.env.REDIS_HOST = await redisServer.getHost();
    process.env.REDIS_PORT = `${await redisServer.getPort()}`;
    process.env.REDIS_PASSWORD = "";

    logger.info("Using in-memory Redis for testing");
  }

  redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
  });

  redis.on("connect", () => {
    logger.info(
      `Redis connected at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    );
  });

  redis.on("close", () => {
    logger.info("Redis connection closed");
  });

  redis.on("error", (err) => {
    logger.error("Redis error:", err);
  });

  return redis;
}

export default initializeRedis;
