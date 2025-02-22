import request from "supertest";
import { app, server } from "../app";
import {
  describe,
  expect,
  jest,
} from "@jest/globals";
import redis from "../services/redis.services";
import logger from "../config/logger";

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

afterAll(async () => {
  await new Promise((resolve) => {
    server.close();
    resolve(null);
  });
  logger.info("Server closed");
  await new Promise((resolve) => {
    redis.quit(() => {
      resolve(null);
    });
  });
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
