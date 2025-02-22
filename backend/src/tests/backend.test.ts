import request from "supertest";
import app from "../utils/create.server";
import { describe, expect, jest } from "@jest/globals";
import initializeRedis from "../utils/redis.app";
import logger from "../config/logger";
import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Redis from "ioredis";

dotenv.config();

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

let redis: Redis;

beforeAll(async () => {
  try {
    redis = await initializeRedis();
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    logger.info("MongoDB connected");
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
