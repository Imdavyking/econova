import Redis from "ioredis";
import logger from "../config/logger";

const redis = new Redis({
  host: process.env.REDIS_HOST! || "localhost",
  port: +process.env.REDIS_PORT! || 6379,
  password: process.env.REDIS_PASSWORD,
});

redis.on("connect", () => {
  logger.info("Connected to Redis");
});

redis.on("error", (err) => {
  logger.error("Redis error:", err);
});

export default redis;
