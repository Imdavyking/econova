import request from "supertest";
import app from "../app";
import {
  describe,
  beforeEach,
  it,
  expect,
  jest,
  afterEach,
} from "@jest/globals";
import type { Server } from "http";

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

// let server: Server;

// beforeEach(() => {
//   server = app.listen(4000);
// });

// afterEach(() => {
//   server.close();
// });

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
