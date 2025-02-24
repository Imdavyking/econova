import Redis from "ioredis";
import logger from "../config/logger";
import { RedisMemoryServer } from "redis-memory-server";
import dotenv from "dotenv";
import { environment } from "./config";

dotenv.config();

let redisInstance: Redis | null = null;

async function initializeRedis(): Promise<Redis> {
  if (redisInstance) {
    return redisInstance;
  }

  if (environment.NODE_ENV === "test") {
    const redisServer = new RedisMemoryServer();
    if (!redisServer.getInstanceInfo()) {
      await redisServer.start();
    }

    environment.REDIS_HOST = await redisServer.getHost();
    environment.REDIS_PORT = `${await redisServer.getPort()}`;
    environment.REDIS_PASSWORD = "";

    logger.info("Using in-memory Redis for testing");
  }

  redisInstance = new Redis({
    host: environment.REDIS_HOST || "localhost",
    port: Number(environment.REDIS_PORT) || 6379,
    password: environment.REDIS_PASSWORD,
  });

  redisInstance.on("connect", () => {
    logger.info(
      `Redis connected at ${environment.REDIS_HOST}:${environment.REDIS_PORT}`
    );
  });

  redisInstance.on("error", (err) => {
    logger.error("Redis error:", err);
  });

  return redisInstance;
}

export default initializeRedis;
