import request from "supertest";
import app from "../utils/create.server";
import { describe, expect, jest } from "@jest/globals";
import redis from "../services/redis.services";
import logger from "../config/logger";
import { MongoMemoryServer } from "mongodb-memory-server";
import { RedisMemoryServer } from "redis-memory-server";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

const redisServer = new RedisMemoryServer();
beforeAll(async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    logger.info("MongoDB connected");

    if (!redisServer.getInstanceInfo()) {
      await redisServer.start();
    }

    process.env.REDIS_HOST = await redisServer.getHost();
    process.env.REDIS_PORT = `${await redisServer.getPort()}`;
    process.env.REDIS_PASSWORD = "";

    logger.info(
      `Redis server connected at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    );
  } catch (error) {
    console.error("Error setting up test environment:", error);
  }
});

afterAll(async () => {
  logger.info("Server closed");
  await mongoose.disconnect();
  await mongoose.connection.close();
  logger.info("MongoDB connection closed");

  await new Promise((resolve) => {
    redis.quit(() => {
      resolve(null);
    });
  });
  await redisServer.stop();
  logger.info("Redis connection closed");
});

describe("Backend tests", () => {
  test("GET /api/tweets", async () => {
    const res = await request(app).get("/api/tweets");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test("GET /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/html|json/);
    expect(res.text).toBe("Hello World!");
  });
});
