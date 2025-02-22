import request from "supertest";
import { app, server } from "../app";
import {
  describe,
  beforeEach,
  it,
  expect,
  jest,
  afterEach,
} from "@jest/globals";
import type { Server } from "http";
import redis from "../services/redis.services";

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

// let server: Server;

// beforeEach(() => {
//   server = app.listen(4000);
// });

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await redis.quit();
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
